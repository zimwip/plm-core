const std = @import("std");
const pg = @import("pg");
const platform = @import("platform_lib");
const util = @import("util.zig");

/// Transactional outbox: events are inserted into `<schema>.event_outbox` within
/// the caller's DB transaction, then a poller delivers them to NATS and deletes
/// them. `FOR UPDATE SKIP LOCKED` lets multiple dst replicas share the table
/// without double-delivery. Port of DstEventPublisher + DstOutboxPoller.
pub const Outbox = struct {
    pool: *pg.Pool,
    bus: ?*platform.Bus,
    schema: []const u8,
    enabled: bool,
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    poller: ?std.Thread = null,

    /// Inserts an event on an in-transaction connection (mirrors @Transactional).
    pub fn enqueueOnConn(self: *Outbox, conn: *pg.Conn, alloc: std.mem.Allocator, destination: []const u8, payload_json: []const u8) !void {
        var id_buf: [36]u8 = undefined;
        const id = util.genUuid(&id_buf);
        const sql = try std.fmt.allocPrint(alloc, "INSERT INTO {s}.event_outbox (id, destination, payload) VALUES ($1,$2,$3)", .{self.schema});
        defer alloc.free(sql);
        _ = try conn.exec(sql, .{ id, destination, payload_json });
    }

    pub fn itemCreatedJson(
        alloc: std.mem.Allocator,
        item_id: []const u8,
        user_id: []const u8,
        project_space: []const u8,
        original_name: []const u8,
        content_type: []const u8,
        size_bytes: i64,
        sha256: []const u8,
    ) ![]u8 {
        var ts: [19]u8 = undefined;
        var id_buf: [36]u8 = undefined;
        // payload.fields[] mirrors the shape search-api's DstDataExtractor /
        // PsmNodeExtractor consume — without it the event is silently dropped.
        return std.fmt.allocPrint(alloc, "{f}", .{std.json.fmt(.{
            .event = "ITEM_CREATED",
            .at = util.isoNow(&ts),
            .source = "dst",
            .typeCode = "data-object",
            .itemId = item_id,
            .userId = user_id,
            .projectSpaceId = project_space,
            .id = util.genUuid(&id_buf),
            .payload = .{
                .typeCode = "data-object",
                .type = "data-object",
                .projectSpaceId = project_space,
                .fields = .{
                    .{ .name = "originalName", .valueType = "string", .values = .{original_name} },
                    .{ .name = "contentType", .valueType = "enum", .values = .{content_type} },
                    .{ .name = "sizeBytes", .valueType = "number", .values = .{size_bytes} },
                    .{ .name = "createdBy", .valueType = "string", .values = .{user_id} },
                    .{ .name = "sha256", .valueType = "string", .values = .{sha256} },
                },
            },
        }, .{})});
    }

    pub fn itemDeletedJson(alloc: std.mem.Allocator, item_id: []const u8, by_user: []const u8) ![]u8 {
        var ts: [19]u8 = undefined;
        var id_buf: [36]u8 = undefined;
        return std.fmt.allocPrint(alloc, "{f}", .{std.json.fmt(.{
            .event = "ITEM_DELETED",
            .at = util.isoNow(&ts),
            .source = "dst",
            .itemId = item_id,
            .byUser = if (by_user.len > 0) by_user else "unknown",
            .id = util.genUuid(&id_buf),
        }, .{})});
    }

    pub fn start(self: *Outbox) !void {
        if (!self.enabled or self.bus == null) return;
        self.poller = try std.Thread.spawn(.{}, pollLoop, .{self});
    }

    pub fn deinit(self: *Outbox) void {
        self.running.store(false, .seq_cst);
        if (self.poller) |t| t.join();
    }

    fn pollLoop(self: *Outbox) void {
        var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
        defer arena.deinit();
        while (self.running.load(.seq_cst)) {
            std.Thread.sleep(200 * std.time.ns_per_ms);
            _ = arena.reset(.retain_capacity);
            self.pollOnce(arena.allocator()) catch |e| {
                std.log.warn("outbox poll failed: {}", .{e});
            };
        }
    }

    fn pollOnce(self: *Outbox, alloc: std.mem.Allocator) !void {
        const bus = self.bus orelse return;
        var conn = try self.pool.acquire();
        defer self.pool.release(conn);
        try conn.begin();
        errdefer conn.rollback() catch {};

        const Pending = struct { id: []const u8, destination: []const u8, payload: []const u8 };
        var pending = std.array_list.Managed(Pending).init(alloc);
        {
            const sel = try std.fmt.allocPrint(alloc, "SELECT id, destination, payload FROM {s}.event_outbox ORDER BY created_at LIMIT 50 FOR UPDATE SKIP LOCKED", .{self.schema});
            var result = try conn.query(sel, .{});
            defer result.deinit(); // free the cursor before issuing deletes on the same conn
            while (try result.next()) |row| {
                try pending.append(.{
                    .id = try alloc.dupe(u8, try row.get([]const u8, 0)),
                    .destination = try alloc.dupe(u8, try row.get([]const u8, 1)),
                    .payload = try alloc.dupe(u8, try row.get([]const u8, 2)),
                });
            }
        }

        const del = try std.fmt.allocPrint(alloc, "DELETE FROM {s}.event_outbox WHERE id = $1", .{self.schema});
        for (pending.items) |p| {
            bus.publish(p.destination, p.payload) catch |e| {
                std.log.warn("outbox deliver {s} failed: {}", .{ p.destination, e });
                continue;
            };
            _ = try conn.exec(del, .{p.id});
        }
        try conn.commit();
    }
};
