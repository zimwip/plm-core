const std = @import("std");
const pg = @import("pg");
const Config = @import("config.zig").Config;

/// Opens the Postgres pool and applies migrations. Tables are schema-qualified
/// (`<schema>.data_object`) rather than relying on search_path, so the pooled
/// connections need no per-session setup. Mirrors the dst Flyway V1 schema.
pub fn initPool(alloc: std.mem.Allocator, cfg: *const Config) !*pg.Pool {
    const pool = try pg.Pool.init(alloc, .{
        .size = 5,
        .connect = .{ .host = cfg.pg_host, .port = cfg.pg_port },
        .auth = .{
            .username = cfg.pg_user,
            .password = if (cfg.pg_password.len > 0) cfg.pg_password else null,
            .database = cfg.pg_db,
            .application_name = "dst-zig",
        },
    });
    errdefer pool.deinit();
    try migrate(alloc, pool, cfg.db_schema);
    return pool;
}

/// Creates the schema + tables (idempotent) and records the version in
/// `<schema>.schema_history` — a minimal Flyway stand-in.
pub fn migrate(alloc: std.mem.Allocator, pool: *pg.Pool, schema: []const u8) !void {
    const stmts = [_][]const u8{
        "CREATE SCHEMA IF NOT EXISTS {s}",
        "CREATE TABLE IF NOT EXISTS {s}.schema_history (version INT PRIMARY KEY, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",
        \\CREATE TABLE IF NOT EXISTS {s}.data_object (
        \\  id VARCHAR(36) NOT NULL PRIMARY KEY,
        \\  sha256 VARCHAR(64) NOT NULL,
        \\  size_bytes BIGINT NOT NULL,
        \\  content_type VARCHAR(255),
        \\  original_name VARCHAR(500),
        \\  location VARCHAR(1000) NOT NULL,
        \\  project_space_id VARCHAR(36),
        \\  ref_count INTEGER NOT NULL DEFAULT 1,
        \\  created_by VARCHAR(100) NOT NULL,
        \\  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \\  last_accessed TIMESTAMP,
        \\  CONSTRAINT uq_data_object_sha_ps UNIQUE (sha256, project_space_id))
        ,
        "CREATE INDEX IF NOT EXISTS idx_data_object_sha ON {s}.data_object(sha256)",
        "CREATE INDEX IF NOT EXISTS idx_data_object_author ON {s}.data_object(created_by)",
        "CREATE INDEX IF NOT EXISTS idx_data_object_ps ON {s}.data_object(project_space_id)",
        \\CREATE TABLE IF NOT EXISTS {s}.event_outbox (
        \\  id VARCHAR(36) NOT NULL PRIMARY KEY,
        \\  destination VARCHAR(255) NOT NULL,
        \\  payload TEXT NOT NULL,
        \\  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)
        ,
        "CREATE INDEX IF NOT EXISTS idx_event_outbox_ts ON {s}.event_outbox(created_at)",
    };
    for (stmts) |tmpl| {
        const sql = try subSchema(alloc, tmpl, schema);
        defer alloc.free(sql);
        _ = try pool.exec(sql, .{});
    }
    const mark = try subSchema(alloc, "INSERT INTO {s}.schema_history (version) VALUES (1) ON CONFLICT DO NOTHING", schema);
    defer alloc.free(mark);
    _ = try pool.exec(mark, .{});
    std.log.info("dst schema '{s}' migrated", .{schema});
}

/// Replaces every "{s}" placeholder in `tmpl` with `schema` (runtime-safe; the
/// stdlib allocPrint requires a comptime fmt string, which a runtime DDL list
/// can't provide). Caller frees.
fn subSchema(alloc: std.mem.Allocator, tmpl: []const u8, schema: []const u8) ![]u8 {
    const count = std.mem.count(u8, tmpl, "{s}");
    const size = tmpl.len - count * 3 + count * schema.len;
    const out = try alloc.alloc(u8, size);
    _ = std.mem.replace(u8, tmpl, "{s}", schema, out);
    return out;
}
