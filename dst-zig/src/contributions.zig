const std = @import("std");
const http = std.http;
const platform = @import("platform_lib");

/// Outbound contribution registrations dst pushes at startup (mirrors the
/// platform-lib auto-config clients):
///   - permission scope  → pno-api      POST /internal/scopes/register
///   - settings sections → platform-api POST /internal/settings/register
///   - action catalog    → platform-api POST /internal/registry/actions
/// Each retries with backoff then re-registers every 300s. (Item catalog + UI
/// plugins are pull-based — platform-api calls into dst — see resource.zig/ui.zig.)
pub const Registrar = struct {
    alloc: std.mem.Allocator,
    http: http.Client,
    service_secret: []const u8,
    pno_url: []const u8,
    platform_url: []const u8,
    instance_buf: [10]u8 = undefined,
    instance_id: []const u8 = "",
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    thread: ?std.Thread = null,

    pub fn init(alloc: std.mem.Allocator, self_base_url: []const u8, pno_url: []const u8, platform_url: []const u8, secret: []const u8) Registrar {
        var r = Registrar{ .alloc = alloc, .http = .{ .allocator = alloc }, .service_secret = secret, .pno_url = pno_url, .platform_url = platform_url };
        r.instance_id = platform.instanceId(self_base_url, &r.instance_buf);
        return r;
    }

    pub fn deinit(self: *Registrar) void {
        self.running.store(false, .seq_cst);
        if (self.thread) |t| t.join();
        self.http.deinit();
    }

    pub fn start(self: *Registrar) !void {
        self.thread = try std.Thread.spawn(.{}, loop, .{self});
    }

    fn loop(self: *Registrar) void {
        const backoffs = [_]u64{ 1000, 2000, 4000, 8000, 15000, 30000 };
        var i: usize = 0;
        while (self.running.load(.seq_cst)) {
            if (self.registerAll()) {
                std.log.info("dst contributions registered (scopes, settings, actions)", .{});
                break;
            } else |e| {
                const wait = backoffs[@min(i, backoffs.len - 1)];
                std.log.warn("dst contribution registration failed: {}; retry in {d}ms", .{ e, wait });
                std.Thread.sleep(wait * std.time.ns_per_ms);
                i += 1;
            }
        }
        // periodic re-register
        while (self.running.load(.seq_cst)) {
            std.Thread.sleep(300 * std.time.ns_per_s);
            if (!self.running.load(.seq_cst)) return;
            self.registerAll() catch {};
        }
    }

    fn registerAll(self: *Registrar) !void {
        try self.registerScopes();
        try self.registerSettings();
        try self.registerActions();
    }

    fn registerScopes(self: *Registrar) !void {
        const body = try std.fmt.allocPrint(self.alloc, "{f}", .{std.json.fmt(.{
            .serviceCode = "dst",
            .instanceId = self.instance_id,
            .scopes = .{.{
                .scopeCode = "DATA",
                .parentScopeCode = @as(?[]const u8, null),
                .description = "Role-only access to the data store. Permissions: READ_DATA, WRITE_DATA, MANAGE_DATA.",
                .keys = .{},
                .valueSources = .{},
            }},
        }, .{})});
        defer self.alloc.free(body);
        try self.post(self.pno_url, "/internal/scopes/register", body);
    }

    fn registerSettings(self: *Registrar) !void {
        const body = try std.fmt.allocPrint(self.alloc, "{f}", .{std.json.fmt(.{
            .serviceCode = "dst",
            .instanceId = self.instance_id,
            .sections = .{.{
                .key = "dst-stats",
                .label = "Statistics",
                .group = "Data Storage",
                .order = 10,
                .permission = "MANAGE_DATA",
                .icon = "database",
            }},
        }, .{})});
        defer self.alloc.free(body);
        try self.post(self.platform_url, "/internal/settings/register", body);
    }

    fn registerActions(self: *Registrar) !void {
        const body = try std.fmt.allocPrint(self.alloc, "{f}", .{std.json.fmt(.{
            .serviceCode = "dst",
            .guards = .{.{ .code = "dst_file_exists", .label = "dst_file_exists", .module = "dst" }},
            .handlers = .{},
            .contributions = .{},
            .events = .{},
        }, .{})});
        defer self.alloc.free(body);
        try self.post(self.platform_url, "/internal/registry/actions", body);
    }

    fn post(self: *Registrar, base: []const u8, path: []const u8, body: []const u8) !void {
        const url = try std.fmt.allocPrint(self.alloc, "{s}{s}", .{ base, path });
        defer self.alloc.free(url);
        // Always supply a response_writer — the null path discards the body and
        // segfaults on a non-empty response (see s3.zig).
        var discard = std.Io.Writer.Allocating.init(self.alloc);
        defer discard.deinit();
        const result = try self.http.fetch(.{
            .location = .{ .url = url },
            .method = .POST,
            .payload = body,
            .extra_headers = &.{.{ .name = "X-Service-Secret", .value = self.service_secret }},
            .headers = .{ .content_type = .{ .override = "application/json" } },
            .response_writer = &discard.writer,
        });
        if (@intFromEnum(result.status) >= 400) {
            std.log.warn("POST {s} → {d}", .{ path, @intFromEnum(result.status) });
            return error.RegistrationRejected;
        }
    }
};
