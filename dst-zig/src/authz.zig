const std = @import("std");
const http = std.http;
const platform = @import("platform_lib");

/// Local mirror of pno's DATA-scope role→permission grants — the piece that lets
/// dst enforce from the token's roleIds (the token's `perms` claim only carries
/// GLOBAL-scope perms; DATA is a separate role-only scope). Port of the Java
/// dst's Casbin snapshot consumer: pulls GET /internal/authorization/snapshot
/// from pno, keeps a role_id → [perm] map, refreshes on NATS
/// `global.AUTHORIZATION_CHANGED` + a periodic fallback.
pub const DataAuthz = struct {
    base: std.mem.Allocator,
    arena: std.heap.ArenaAllocator,
    mutex: std.Thread.Mutex = .{},
    http: http.Client,
    pno_url: []const u8,
    secret: []const u8,
    map: std.StringHashMapUnmanaged([]const []const u8) = .{},
    populated: bool = false,
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    thread: ?std.Thread = null,

    const scope_code = "DATA";
    const snapshot_path = "/internal/authorization/snapshot";
    const refresh_period_ns: u64 = 5 * 60 * std.time.ns_per_s;

    pub fn init(base: std.mem.Allocator, pno_url: []const u8, secret: []const u8) DataAuthz {
        return .{ .base = base, .arena = std.heap.ArenaAllocator.init(base), .http = .{ .allocator = base }, .pno_url = pno_url, .secret = secret };
    }

    pub fn deinit(self: *DataAuthz) void {
        self.running.store(false, .seq_cst);
        if (self.thread) |t| t.join();
        self.map.deinit(self.base);
        self.arena.deinit();
        self.http.deinit();
    }

    /// True if any of the caller's roles grants `code` in the DATA scope.
    pub fn anyRoleGrants(self: *DataAuthz, role_ids: []const []const u8, code: []const u8) bool {
        self.mutex.lock();
        defer self.mutex.unlock();
        for (role_ids) |rid| {
            const perms = self.map.get(rid) orelse continue;
            for (perms) |p| {
                if (std.mem.eql(u8, p, code)) return true;
            }
        }
        return false;
    }

    pub fn start(self: *DataAuthz, bus: ?*platform.Bus) !void {
        self.fetch() catch |e| std.log.warn("dst authz initial snapshot failed: {}", .{e});
        if (bus) |b| try b.subscribe("global.AUTHORIZATION_CHANGED", onChanged, self);
        self.thread = try std.Thread.spawn(.{}, refreshLoop, .{self});
    }

    fn onChanged(ctx: ?*anyopaque, _: []const u8) void {
        const self: *DataAuthz = @ptrCast(@alignCast(ctx.?));
        self.fetch() catch |e| std.log.warn("dst authz refresh (NATS) failed: {}", .{e});
    }

    fn refreshLoop(self: *DataAuthz) void {
        while (self.running.load(.seq_cst)) {
            std.Thread.sleep(refresh_period_ns);
            if (!self.running.load(.seq_cst)) return;
            self.fetch() catch {};
        }
    }

    /// Pulls the snapshot and rebuilds the DATA-scope role→perm map.
    fn fetch(self: *DataAuthz) !void {
        var scratch = std.heap.ArenaAllocator.init(self.base);
        defer scratch.deinit();
        const a = scratch.allocator();

        const url = try std.fmt.allocPrint(a, "{s}{s}", .{ self.pno_url, snapshot_path });
        var aw = std.Io.Writer.Allocating.init(a);
        const result = try self.http.fetch(.{
            .location = .{ .url = url },
            .method = .GET,
            .extra_headers = &.{.{ .name = "X-Service-Secret", .value = self.secret }},
            .response_writer = &aw.writer,
        });
        if (@intFromEnum(result.status) >= 400) return error.SnapshotRejected;

        var parsed = try std.json.parseFromSlice(std.json.Value, a, aw.written(), .{});
        defer parsed.deinit();
        try self.rebuild(parsed.value);
        std.log.info("dst authz DATA grants refreshed ({d} roles)", .{self.map.count()});
    }

    fn rebuild(self: *DataAuthz, root: std.json.Value) !void {
        if (root != .object) return error.BadSnapshot;
        const policies = root.object.get("policies") orelse return;
        if (policies != .array) return;

        self.mutex.lock();
        defer self.mutex.unlock();
        _ = self.arena.reset(.retain_capacity);
        const a = self.arena.allocator();
        self.map.clearRetainingCapacity();

        // role_id → growing perm list (arena-backed).
        var builder = std.StringHashMap(std.array_list.Managed([]const u8)).init(a);
        for (policies.array.items) |pol| {
            if (pol != .object) continue;
            const o = pol.object;
            if (!eqlStr(o.get("scope"), scope_code)) continue;
            const rid = strOf(o.get("role_id")) orelse continue;
            const pc = strOf(o.get("permission_code")) orelse continue;
            const gop = try builder.getOrPut(try a.dupe(u8, rid));
            if (!gop.found_existing) gop.value_ptr.* = std.array_list.Managed([]const u8).init(a);
            try gop.value_ptr.append(try a.dupe(u8, pc));
        }

        var it = builder.iterator();
        while (it.next()) |e| {
            // Map metadata in base (stable); keys + slices in the arena.
            try self.map.put(self.base, e.key_ptr.*, try e.value_ptr.toOwnedSlice());
        }
        self.populated = true;
    }

    fn strOf(v: ?std.json.Value) ?[]const u8 {
        const val = v orelse return null;
        return switch (val) {
            .string => |s| s,
            else => null,
        };
    }

    fn eqlStr(v: ?std.json.Value, want: []const u8) bool {
        return if (strOf(v)) |s| std.mem.eql(u8, s, want) else false;
    }
};
