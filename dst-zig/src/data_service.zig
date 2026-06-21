const std = @import("std");
const pg = @import("pg");
const S3 = @import("s3.zig").Client;
const Outbox = @import("outbox.zig").Outbox;
const meta = @import("metadata.zig");
const util = @import("util.zig");

const DataMetadata = meta.DataMetadata;

pub const Error = error{ NotFound, Storage };

/// CRUD around stored binary data — port of Java DataService. SHA-256 is the
/// dedup key (scoped per project space); ref-counting GCs the blob at zero.
/// Every object is scoped to projectSpaceId. Permission checks live in the HTTP
/// layer (token perms), matching the @PlmPermission gate.
pub const DataService = struct {
    pool: *pg.Pool,
    s3: *S3,
    outbox: *Outbox,
    schema: []const u8,
    presign_ttl_s: i64,

    const cols = "id, sha256, size_bytes, content_type, original_name, location, created_by, created_at::text, last_accessed::text, project_space_id, ref_count";

    fn rowToMeta(alloc: std.mem.Allocator, row: anytype) !DataMetadata {
        return .{
            .id = try alloc.dupe(u8, try row.get([]const u8, 0)),
            .sha256 = try alloc.dupe(u8, try row.get([]const u8, 1)),
            .sizeBytes = try row.get(i64, 2),
            .contentType = try dupeOpt(alloc, try row.get(?[]const u8, 3)),
            .originalName = try dupeOpt(alloc, try row.get(?[]const u8, 4)),
            .location = try alloc.dupe(u8, try row.get([]const u8, 5)),
            .createdBy = try alloc.dupe(u8, try row.get([]const u8, 6)),
            .createdAt = try dupeOpt(alloc, try row.get(?[]const u8, 7)),
            .lastAccessed = try dupeOpt(alloc, try row.get(?[]const u8, 8)),
            .projectSpaceId = try dupeOpt(alloc, try row.get(?[]const u8, 9)),
            .refCount = try row.get(i32, 10),
        };
    }

    fn dupeOpt(alloc: std.mem.Allocator, v: ?[]const u8) !?[]const u8 {
        return if (v) |s| try alloc.dupe(u8, s) else null;
    }

    /// Loads a row on an already-acquired connection (release_conn=false — the
    /// caller owns the connection lifecycle). All data_service paths use ONE
    /// explicitly-acquired conn per request: mixing pool.row/pool.exec (which
    /// release via QueryRow.deinit) with manual acquire/release races the pool's
    /// release path under concurrency and corrupts memory.
    fn loadWithConn(self: *DataService, conn: *pg.Conn, alloc: std.mem.Allocator, id: []const u8, ps: []const u8) !DataMetadata {
        const sql = try std.fmt.allocPrint(alloc, "SELECT {s} FROM {s}.data_object WHERE id = $1 AND project_space_id = $2", .{ cols, self.schema });
        defer alloc.free(sql);
        var qr = (try conn.row(sql, .{ id, ps })) orelse return Error.NotFound;
        defer qr.deinit() catch {};
        return rowToMeta(alloc, &qr);
    }

    /// Loads a row scoped to (id, projectSpaceId) or returns NotFound.
    pub fn loadOrThrow(self: *DataService, alloc: std.mem.Allocator, id: []const u8, ps: []const u8) !DataMetadata {
        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        return self.loadWithConn(conn, alloc, id, ps);
    }

    pub fn list(self: *DataService, alloc: std.mem.Allocator, ps: []const u8, page: i64, size: i64) ![]DataMetadata {
        const lim = @max(@as(i64, 1), size);
        const off = @max(@as(i64, 0), page) * lim;
        const sql = try std.fmt.allocPrint(alloc, "SELECT {s} FROM {s}.data_object WHERE project_space_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3", .{ cols, self.schema });
        defer alloc.free(sql);
        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        var result = try conn.query(sql, .{ ps, lim, off });
        defer result.deinit();
        var out = std.array_list.Managed(DataMetadata).init(alloc);
        while (try result.next()) |row| {
            try out.append(try rowToMeta(alloc, &row));
        }
        return out.toOwnedSlice();
    }

    pub fn upload(self: *DataService, alloc: std.mem.Allocator, user_id: []const u8, ps: []const u8, original_name: []const u8, content_type: []const u8, body: []const u8) !meta.UploadResult {
        var id_buf: [36]u8 = undefined;
        const id = util.genUuid(&id_buf);
        const stored = try self.s3.store(id, body, content_type);
        const sha_hex = try alloc.dupe(u8, &stored.sha256_hex);

        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        try conn.begin();
        errdefer conn.rollback() catch {};

        // Dedup by (sha256, projectSpace).
        var existing_id: ?[]const u8 = null;
        {
            const dsql = try std.fmt.allocPrint(alloc, "SELECT id FROM {s}.data_object WHERE sha256 = $1 AND project_space_id = $2", .{self.schema});
            var dr = try conn.row(dsql, .{ sha_hex, ps });
            if (dr) |*r| {
                existing_id = try alloc.dupe(u8, try r.get([]const u8, 0));
                try r.deinit();
            }
        }

        if (existing_id) |eid| {
            // Discard the just-uploaded blob; bump the existing row's ref_count.
            self.s3.delete(id);
            const usql = try std.fmt.allocPrint(alloc, "UPDATE {s}.data_object SET ref_count = ref_count + 1 WHERE id = $1", .{self.schema});
            _ = try conn.exec(usql, .{eid});
            try conn.commit();
            const m = try self.loadWithConn(conn, alloc, eid, ps);
            std.log.info("DATA upload-dup id={s} sha256={s} ref_count={d} by={s} ps={s}", .{ m.id, m.sha256, m.refCount, user_id, ps });
            return .{ .metadata = m, .duplicate = true };
        }

        const isql = try std.fmt.allocPrint(alloc,
            \\INSERT INTO {s}.data_object
            \\  (id, sha256, size_bytes, content_type, original_name, location, created_by, project_space_id, ref_count)
            \\VALUES ($1,$2,$3,$4,$5,$6,$7,$8,1)
        , .{self.schema});
        _ = try conn.exec(isql, .{ id, sha_hex, stored.size_bytes, content_type, original_name, stored.location, user_id, ps });

        const payload = try Outbox.itemCreatedJson(alloc, id, user_id, ps, original_name, content_type, stored.size_bytes, sha_hex);
        try self.outbox.enqueueOnConn(conn, alloc, "global.ITEM_CREATED", payload);
        try conn.commit();

        std.log.info("DATA upload id={s} sha256={s} size={d} by={s} ps={s}", .{ id, sha_hex, stored.size_bytes, user_id, ps });
        return .{
            .metadata = .{
                .id = try alloc.dupe(u8, id),
                .sha256 = sha_hex,
                .sizeBytes = stored.size_bytes,
                .contentType = try alloc.dupe(u8, content_type),
                .originalName = try alloc.dupe(u8, original_name),
                .location = try alloc.dupe(u8, stored.location),
                .createdBy = try alloc.dupe(u8, user_id),
                .createdAt = null,
                .lastAccessed = null,
                .projectSpaceId = try alloc.dupe(u8, ps),
                .refCount = 1,
            },
            .duplicate = false,
        };
    }

    pub fn reference(self: *DataService, alloc: std.mem.Allocator, id: []const u8, user_id: []const u8, ps: []const u8) !DataMetadata {
        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        _ = try self.loadWithConn(conn, alloc, id, ps); // verify exists/scope
        const sql = try std.fmt.allocPrint(alloc, "UPDATE {s}.data_object SET ref_count = ref_count + 1 WHERE id = $1", .{self.schema});
        defer alloc.free(sql);
        _ = try conn.exec(sql, .{id});
        const m = try self.loadWithConn(conn, alloc, id, ps);
        std.log.info("DATA ref id={s} ref_count={d} by={s} ps={s}", .{ id, m.refCount, user_id, ps });
        return m;
    }

    pub fn unreference(self: *DataService, alloc: std.mem.Allocator, id: []const u8, user_id: []const u8, ps: []const u8) !void {
        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        const m = try self.loadWithConn(conn, alloc, id, ps);
        if (m.refCount <= 1) {
            try conn.begin();
            errdefer conn.rollback() catch {};
            const dsql = try std.fmt.allocPrint(alloc, "DELETE FROM {s}.data_object WHERE id = $1", .{self.schema});
            _ = try conn.exec(dsql, .{id});
            const payload = try Outbox.itemDeletedJson(alloc, id, user_id);
            try self.outbox.enqueueOnConn(conn, alloc, "global.ITEM_DELETED", payload);
            try conn.commit();
            self.s3.delete(m.location);
            std.log.info("DATA unref-gc id={s} sha256={s} by={s} ps={s}", .{ id, m.sha256, user_id, ps });
        } else {
            const sql = try std.fmt.allocPrint(alloc, "UPDATE {s}.data_object SET ref_count = ref_count - 1 WHERE id = $1", .{self.schema});
            _ = try conn.exec(sql, .{id});
            std.log.info("DATA unref id={s} ref_count={d} by={s} ps={s}", .{ id, m.refCount - 1, user_id, ps });
        }
    }

    pub fn delete(self: *DataService, alloc: std.mem.Allocator, id: []const u8, user_id: []const u8, ps: []const u8) !void {
        const conn = try self.pool.acquire();
        defer self.pool.release(conn);
        const m = try self.loadWithConn(conn, alloc, id, ps);
        try conn.begin();
        errdefer conn.rollback() catch {};
        const dsql = try std.fmt.allocPrint(alloc, "DELETE FROM {s}.data_object WHERE id = $1", .{self.schema});
        _ = try conn.exec(dsql, .{id});
        const payload = try Outbox.itemDeletedJson(alloc, id, user_id);
        try self.outbox.enqueueOnConn(conn, alloc, "global.ITEM_DELETED", payload);
        try conn.commit();
        self.s3.delete(m.location);
        std.log.info("DATA delete id={s} sha256={s} by={s} ps={s}", .{ id, m.sha256, user_id, ps });
    }

    pub fn presignedUrl(self: *DataService, alloc: std.mem.Allocator, id: []const u8, user_id: []const u8, ps: []const u8) !meta.PresignedUrl {
        const m = try self.loadOrThrow(alloc, id, ps);
        const url = try self.s3.presignedGetUrl(alloc, m.location, self.presign_ttl_s);
        std.log.info("DATA presign id={s} by={s} ps={s}", .{ id, user_id, ps });
        return .{ .url = url, .expiresInSeconds = self.presign_ttl_s, .size = m.sizeBytes };
    }

    pub const Content = struct { metadata: DataMetadata, bytes: []u8 };

    pub fn openContent(self: *DataService, alloc: std.mem.Allocator, id: []const u8, user_id: []const u8, ps: []const u8) !Content {
        const m = try self.loadOrThrow(alloc, id, ps);
        const bytes = try self.s3.get(alloc, m.location);
        std.log.info("DATA stream id={s} by={s} ps={s}", .{ id, user_id, ps });
        return .{ .metadata = m, .bytes = bytes };
    }
};
