const std = @import("std");
const dto = @import("dto.zig");

const ServiceInstanceInfo = dto.ServiceInstanceInfo;

/// In-memory mirror of the platform registry: rejects stale snapshots
/// (monotonic version), selects instances round-robin with a health-aware
/// fallback. Port of platform-lib-go's LocalServiceRegistry.
///
/// Instance strings are duped into `arena`, which is reset on every accepted
/// snapshot. Round-robin counters live in the long-lived base allocator so they
/// survive snapshot churn.
pub const Registry = struct {
    base: std.mem.Allocator,
    arena: std.heap.ArenaAllocator,
    mutex: std.Thread.Mutex = .{},
    version: i64 = 0,
    populated: bool = false,
    services: std.StringHashMapUnmanaged([]ServiceInstanceInfo) = .{},
    rr: std.StringHashMapUnmanaged(u64) = .{},
    ready: std.Thread.ResetEvent = .{},

    pub fn init(base: std.mem.Allocator) Registry {
        return .{ .base = base, .arena = std.heap.ArenaAllocator.init(base) };
    }

    pub fn deinit(self: *Registry) void {
        self.arena.deinit();
        self.services.deinit(self.base);
        var it = self.rr.keyIterator();
        while (it.next()) |k| self.base.free(k.*);
        self.rr.deinit(self.base);
    }

    /// Applies a parsed snapshot ({version, services:{code:[inst...]}}),
    /// ignoring stale ones (version <= current once populated).
    pub fn updateFromSnapshot(self: *Registry, value: std.json.Value) !void {
        if (value != .object) return error.BadSnapshot;
        const root = value.object;
        const new_version: i64 = switch (root.get("version") orelse std.json.Value{ .integer = 0 }) {
            .integer => |i| i,
            .float => |f| @intFromFloat(f),
            else => 0,
        };

        self.mutex.lock();
        defer self.mutex.unlock();
        if (self.populated and new_version <= self.version) return;

        // Rebuild service map into a fresh arena generation.
        _ = self.arena.reset(.retain_capacity);
        const a = self.arena.allocator();
        self.services.clearRetainingCapacity();

        if (root.get("services")) |svcs_v| {
            if (svcs_v == .object) {
                var it = svcs_v.object.iterator();
                while (it.next()) |entry| {
                    const code = entry.key_ptr.*;
                    if (entry.value_ptr.* != .array) continue;
                    const arr = entry.value_ptr.*.array;
                    var list = try a.alloc(ServiceInstanceInfo, arr.items.len);
                    var n: usize = 0;
                    for (arr.items) |inst_v| {
                        if (inst_v != .object) continue;
                        list[n] = try parseInstance(a, inst_v.object);
                        n += 1;
                    }
                    // Map metadata lives in `base` (stable across arena resets);
                    // keys + value slices point into the arena (refreshed each snapshot).
                    try self.services.put(self.base, try a.dupe(u8, code), list[0..n]);
                }
            }
        }

        self.version = new_version;
        self.populated = true;
        self.ready.set();
    }

    fn parseInstance(a: std.mem.Allocator, obj: std.json.ObjectMap) !ServiceInstanceInfo {
        return .{
            .instanceId = try dupStr(a, obj, "instanceId"),
            .serviceCode = try dupStr(a, obj, "serviceCode"),
            .baseUrl = try dupStr(a, obj, "baseUrl"),
            .version = try dupStr(a, obj, "version"),
            .spaceTag = try dupStr(a, obj, "spaceTag"),
            .healthy = switch (obj.get("healthy") orelse std.json.Value{ .bool = false }) {
                .bool => |b| b,
                else => false,
            },
        };
    }

    fn dupStr(a: std.mem.Allocator, obj: std.json.ObjectMap, key: []const u8) ![]const u8 {
        const v = obj.get(key) orelse return "";
        return switch (v) {
            .string => |s| try a.dupe(u8, s),
            else => "",
        };
    }

    /// Drops the monotonic baseline so the next snapshot is accepted regardless
    /// of version (used on PLATFORM_RESTARTED, when platform-api's version resets).
    pub fn resetVersion(self: *Registry) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        self.version = std.math.minInt(i64);
    }

    pub fn isPopulated(self: *Registry) bool {
        self.mutex.lock();
        defer self.mutex.unlock();
        return self.populated;
    }

    /// Round-robin instance for a service code, preferring healthy ones. Returns
    /// a copy (strings borrow the registry arena — valid until the next accepted
    /// snapshot; callers must use it before yielding to a refresh).
    pub fn pickInstance(self: *Registry, code: []const u8) ?ServiceInstanceInfo {
        self.mutex.lock();
        defer self.mutex.unlock();
        const all = self.services.get(code) orelse return null;
        if (all.len == 0) return null;

        // Count healthy.
        var healthy: usize = 0;
        for (all) |i| {
            if (i.healthy) healthy += 1;
        }
        const use_healthy = healthy > 0;
        const pool_len = if (use_healthy) healthy else all.len;

        const gop = self.rr.getOrPut(self.base, code) catch return all[0];
        if (!gop.found_existing) {
            gop.key_ptr.* = self.base.dupe(u8, code) catch code;
            gop.value_ptr.* = 0;
        }
        const idx = gop.value_ptr.*;
        gop.value_ptr.* = idx +% 1;

        const target = idx % pool_len;
        var seen: usize = 0;
        for (all) |i| {
            if (use_healthy and !i.healthy) continue;
            if (seen == target) return i;
            seen += 1;
        }
        return all[0];
    }

    /// Blocks until the first snapshot arrives or the timeout elapses.
    pub fn awaitPopulated(self: *Registry, timeout_ns: u64) bool {
        if (self.isPopulated()) return true;
        self.ready.timedWait(timeout_ns) catch return self.isPopulated();
        return true;
    }
};

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

fn parse(alloc: std.mem.Allocator, json: []const u8) !std.json.Parsed(std.json.Value) {
    return std.json.parseFromSlice(std.json.Value, alloc, json, .{});
}

test "snapshot apply + stale rejection + round-robin healthy" {
    var reg = Registry.init(testing.allocator);
    defer reg.deinit();

    const snap1 =
        \\{"version":5,"services":{"psm":[
        \\  {"instanceId":"a","serviceCode":"psm","baseUrl":"http://psm-1:8080","healthy":true},
        \\  {"instanceId":"b","serviceCode":"psm","baseUrl":"http://psm-2:8080","healthy":true},
        \\  {"instanceId":"c","serviceCode":"psm","baseUrl":"http://psm-3:8080","healthy":false}
        \\]}}
    ;
    var p1 = try parse(testing.allocator, snap1);
    defer p1.deinit();
    try reg.updateFromSnapshot(p1.value);
    try testing.expect(reg.isPopulated());

    // round-robin cycles only the 2 healthy instances
    const pick0 = reg.pickInstance("psm").?;
    const pick1 = reg.pickInstance("psm").?;
    const pick2 = reg.pickInstance("psm").?;
    try testing.expect(!std.mem.eql(u8, pick0.baseUrl, pick1.baseUrl));
    try testing.expectEqualStrings(pick0.baseUrl, pick2.baseUrl); // wrapped
    try testing.expect(pick0.healthy and pick1.healthy);

    // stale snapshot (version <= current) is ignored
    const snap_stale = "{\"version\":3,\"services\":{\"psm\":[]}}";
    var ps = try parse(testing.allocator, snap_stale);
    defer ps.deinit();
    try reg.updateFromSnapshot(ps.value);
    try testing.expect(reg.pickInstance("psm") != null);

    // unknown code → null
    try testing.expect(reg.pickInstance("nope") == null);
}

test "unhealthy-only pool falls back to all" {
    var reg = Registry.init(testing.allocator);
    defer reg.deinit();
    const snap = "{\"version\":1,\"services\":{\"x\":[{\"instanceId\":\"a\",\"serviceCode\":\"x\",\"baseUrl\":\"u\",\"healthy\":false}]}}";
    var p = try parse(testing.allocator, snap);
    defer p.deinit();
    try reg.updateFromSnapshot(p.value);
    try testing.expectEqualStrings("u", reg.pickInstance("x").?.baseUrl);
}
