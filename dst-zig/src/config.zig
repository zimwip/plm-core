const std = @import("std");
const platform = @import("platform_lib");

/// dst-zig configuration, sourced from env vars (mirrors the dst compose block
/// + application.properties). Strings owned by `arena`.
pub const Config = struct {
    arena: std.heap.ArenaAllocator,

    // platform contract
    service_secret: []const u8,
    self_base_url: []const u8,
    platform_url: []const u8,
    pno_url: []const u8,
    nats_url: []const u8,
    nats_enabled: bool,
    otel_endpoint: []const u8,

    // postgres
    pg_host: []const u8,
    pg_port: u16,
    pg_user: []const u8,
    pg_password: []const u8,
    pg_db: []const u8,
    db_schema: []const u8,

    // s3 / garage
    s3_endpoint: []const u8,
    s3_public_endpoint: []const u8,
    s3_region: []const u8,
    s3_bucket: []const u8,
    s3_access_key: []const u8,
    s3_secret_key: []const u8,
    presign_ttl_seconds: i64,
    ui_dir: []const u8,

    pub fn load(child: std.mem.Allocator) !Config {
        var arena = std.heap.ArenaAllocator.init(child);
        const a = arena.allocator();
        const env = platform.config.env;
        const port_str = try env(a, "PG_PORT", "5432");
        return .{
            .arena = arena,
            .service_secret = try env(a, "PLM_SERVICE_SECRET", ""),
            .self_base_url = try env(a, "SPE_SELF_BASE_URL", "http://dst:8086"),
            .platform_url = try env(a, "PLM_PLATFORM_URL", "http://platform-api:8084"),
            .pno_url = try env(a, "PNO_API_URL", "http://pno-api:8081"),
            .nats_url = try env(a, "NATS_URL", "nats://nats:4222"),
            .nats_enabled = std.mem.eql(u8, try env(a, "PLM_NATS_ENABLED", "true"), "true"),
            .otel_endpoint = try env(a, "OTEL_EXPORTER_OTLP_ENDPOINT", ""),
            .pg_host = try env(a, "PG_HOST", "postgres"),
            .pg_port = std.fmt.parseInt(u16, port_str, 10) catch 5432,
            .pg_user = try env(a, "PG_USER", "plm"),
            .pg_password = try env(a, "PG_PASSWORD", ""),
            .pg_db = try env(a, "PG_DB", "plmdb"),
            .db_schema = try env(a, "DST_DB_SCHEMA", "dst"),
            .s3_endpoint = try env(a, "DST_S3_ENDPOINT", "http://garage:3900"),
            .s3_public_endpoint = try env(a, "DST_S3_PUBLIC_ENDPOINT", "http://localhost:3000"),
            .s3_region = try env(a, "DST_S3_REGION", "garage"),
            .s3_bucket = try env(a, "DST_S3_BUCKET", "plm-dst"),
            .s3_access_key = try env(a, "DST_S3_ACCESS_KEY", ""),
            .s3_secret_key = try env(a, "DST_S3_SECRET_KEY", ""),
            .presign_ttl_seconds = std.fmt.parseInt(i64, try env(a, "DST_S3_PRESIGN_TTL_SECONDS", "900"), 10) catch 900,
            .ui_dir = try env(a, "DST_UI_DIR", "static/ui"),
        };
    }

    pub fn deinit(self: *Config) void {
        self.arena.deinit();
    }
};
