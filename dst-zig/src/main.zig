const std = @import("std");
const platform = @import("platform_lib");
const pg = @import("pg");
const Config = @import("config.zig").Config;
const db = @import("db.zig");
const S3 = @import("s3.zig").Client;
const Outbox = @import("outbox.zig").Outbox;
const DataService = @import("data_service.zig").DataService;
const handlers = @import("handlers.zig");
const contributions = @import("contributions.zig");

const service_code = "dst";
const port: u16 = 8086;

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    const alloc = gpa.allocator();

    var cfg = try Config.load(alloc);
    defer cfg.deinit();
    std.log.info("dst-zig starting (schema={s}, bucket={s})", .{ cfg.db_schema, cfg.s3_bucket });

    // ── Postgres pool + migrations ──────────────────────────────────────────
    const pool = try db.initPool(alloc, &cfg);
    defer pool.deinit();

    // ── S3 (Garage) client ──────────────────────────────────────────────────
    var s3 = S3.init(alloc, &cfg);
    defer s3.deinit();

    // ── NATS bus (optional) ──────────────────────────────────────────────────
    var bus: ?platform.Bus = null;
    if (cfg.nats_enabled) {
        bus = platform.Bus.init(alloc, cfg.nats_url, service_code) catch |e| blk: {
            std.log.warn("nats init failed: {}", .{e});
            break :blk null;
        };
        if (bus) |*b| b.start() catch |e| std.log.warn("nats start failed: {}", .{e});
    }
    const bus_ptr: ?*platform.Bus = if (bus) |*b| b else null;

    // ── Transactional outbox + poller ─────────────────────────────────────────
    var outbox = Outbox{ .pool = pool, .bus = bus_ptr, .schema = cfg.db_schema, .enabled = cfg.nats_enabled };
    try outbox.start();
    defer outbox.deinit();

    // ── Domain service ────────────────────────────────────────────────────────
    var ds = DataService{
        .pool = pool,
        .s3 = &s3,
        .outbox = &outbox,
        .schema = cfg.db_schema,
        .presign_ttl_s = cfg.presign_ttl_seconds,
    };

    // ── JWT codec (forward-token verification) ────────────────────────────────
    const codec = platform.Codec.init(cfg.service_secret, 60) catch {
        std.log.err("PLM_SERVICE_SECRET missing or < 32 bytes — cannot verify forward JWTs", .{});
        return error.BadSecret;
    };

    // ── DATA-scope authorization (role→perm grants pulled from pno) ───────────
    var authz = @import("authz.zig").DataAuthz.init(alloc, cfg.pno_url, cfg.service_secret);
    defer authz.deinit();
    authz.start(bus_ptr) catch |e| std.log.warn("dst authz start failed: {}", .{e});

    var app_state = handlers.AppState{ .ds = &ds, .codec = &codec, .schema = cfg.db_schema, .pool = pool, .service_secret = cfg.service_secret, .ui_dir = cfg.ui_dir, .authz = &authz };

    // ── OpenTelemetry tracer (hand-rolled OTLP/HTTP-JSON → Jaeger) ────────────
    var tracer = platform.Tracer.init(alloc, cfg.otel_endpoint, service_code);
    defer tracer.deinit();
    tracer.start() catch |e| std.log.warn("otel flusher start failed: {}", .{e});

    // ── HTTP server + routes (bare paths; spe-api strips /api/dst) ─────────────
    var server = platform.HttpServer.init(alloc, &app_state);
    server.tracer = &tracer;
    defer server.deinit();
    try server.get("/data", handlers.list);
    try server.post("/data", handlers.upload);
    try server.post("/data/{id}/ref", handlers.reference);
    try server.post("/data/{id}/unref", handlers.unreference);
    try server.get("/data/{id}/metadata", handlers.metadata);
    try server.get("/data/{id}/content", handlers.content);
    try server.get("/data/{id}/detail", handlers.detail);
    try server.get("/data/{id}/download-url", handlers.downloadUrl);
    try server.get("/data/{id}", handlers.download);
    try server.delete("/data/{id}", handlers.deleteData);
    try server.get("/stats", handlers.stats);
    try server.get("/item-type/{key}", handlers.itemType);
    // S2S internal endpoints (X-Service-Secret) + public UI bundles.
    try server.post("/internal/items/visible", handlers.visibleItems);
    try server.get("/internal/ui/plugins", handlers.uiPlugins);
    try server.get("/ui/{file}", handlers.uiBundle);

    // ── Self-registration lifecycle (background) ──────────────────────────────
    var registrar = platform.Registrar.init(alloc, .{
        .service_code = service_code,
        .self_base_url = cfg.self_base_url,
        .platform_url = cfg.platform_url,
        .service_secret = cfg.service_secret,
        .version = "0.1.0",
    }, registryOf(&app_state));
    _ = &registrar;

    const reg_thread = try std.Thread.spawn(.{}, registerLifecycle, .{ &registrar, bus_ptr });
    reg_thread.detach();

    // Push contribution registrations (scopes→pno, settings+actions→platform-api).
    var contrib = contributions.Registrar.init(alloc, cfg.self_base_url, cfg.pno_url, cfg.platform_url, cfg.service_secret);
    defer contrib.deinit();
    try contrib.start();

    // Block serving requests.
    try server.listen(port);
}

// dst does not consume the registry for S2S (it talks to pno via fixed URL only
// for permission registration, a follow-up); the registrar still needs one to
// store snapshots. Use a process-lifetime registry.
var global_registry: ?platform.Registry = null;
fn registryOf(_: *handlers.AppState) *platform.Registry {
    if (global_registry == null) global_registry = platform.Registry.init(std.heap.page_allocator);
    return &global_registry.?;
}

fn registerLifecycle(registrar: *platform.Registrar, bus_ptr: ?*platform.Bus) void {
    registrar.registerWithBackoff();
    registrar.run(bus_ptr) catch |e| std.log.warn("registrar run failed: {}", .{e});
}

test {
    std.testing.refAllDecls(@This());
    _ = @import("util.zig");
    _ = @import("multipart.zig");
    _ = @import("s3.zig");
}
