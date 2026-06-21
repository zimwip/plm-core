const std = @import("std");
const http = std.http;
const dto = @import("dto.zig");
const Registry = @import("registry.zig").Registry;
const Bus = @import("nats.zig").Bus;
const util = @import("util.zig");

const register_path = "/internal/environment/register";
const snapshot_path = "/internal/environment/snapshot";
const re_register_period_ns: u64 = 5 * 60 * std.time.ns_per_s;

/// Declares this service's identity for platform-api. Strings are borrowed and
/// must outlive the Registrar.
pub const Config = struct {
    service_code: []const u8,
    self_base_url: []const u8,
    platform_url: []const u8,
    service_secret: []const u8,
    space_tag: []const u8 = "",
    version: []const u8 = "0.1.0",
    extra_paths: []const []const u8 = &.{},
    features: []const []const u8 = &.{},
};

/// Self-registers with platform-api and keeps the local registry fresh. Port of
/// platform-lib-go's Registrar / Java PlatformRegistrationClient.
pub const Registrar = struct {
    alloc: std.mem.Allocator,
    cfg: Config,
    reg: *Registry,
    http: http.Client,
    instance_id_buf: [10]u8 = undefined,
    instance_id: []const u8 = "",
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    ticker: ?std.Thread = null,

    pub fn init(alloc: std.mem.Allocator, cfg: Config, reg: *Registry) Registrar {
        var r = Registrar{ .alloc = alloc, .cfg = cfg, .reg = reg, .http = .{ .allocator = alloc } };
        r.instance_id = util.instanceId(cfg.self_base_url, &r.instance_id_buf);
        return r;
    }

    pub fn deinit(self: *Registrar) void {
        self.running.store(false, .seq_cst);
        if (self.ticker) |t| t.join();
        self.http.deinit();
    }

    fn buildRequest(self: *Registrar, alloc: std.mem.Allocator) !dto.RegisterRequest {
        return .{
            .serviceCode = self.cfg.service_code,
            .baseUrl = self.cfg.self_base_url,
            .healthUrl = try std.fmt.allocPrint(alloc, "{s}/actuator/health", .{std.mem.trimRight(u8, self.cfg.self_base_url, "/")}),
            .routePrefix = try std.fmt.allocPrint(alloc, "/api/{s}/**", .{self.cfg.service_code}),
            .extraPaths = self.cfg.extra_paths,
            .version = self.cfg.version,
            .spaceTag = self.cfg.space_tag,
            .features = self.cfg.features,
        };
    }

    /// POSTs registration then pulls the snapshot.
    pub fn registerOnce(self: *Registrar) !void {
        var arena = std.heap.ArenaAllocator.init(self.alloc);
        defer arena.deinit();
        const a = arena.allocator();

        const req = try self.buildRequest(a);
        const body = try std.fmt.allocPrint(a, "{f}", .{std.json.fmt(req, .{})});
        const url = try std.fmt.allocPrint(a, "{s}{s}", .{ self.cfg.platform_url, register_path });

        var aw = std.Io.Writer.Allocating.init(a);
        const result = try self.http.fetch(.{
            .location = .{ .url = url },
            .method = .POST,
            .payload = body,
            .extra_headers = &.{.{ .name = "X-Service-Secret", .value = self.cfg.service_secret }},
            .headers = .{ .content_type = .{ .override = "application/json" } },
            .response_writer = &aw.writer,
        });
        if (@intFromEnum(result.status) >= 400) return error.RegistrationFailed;

        if (std.json.parseFromSlice(dto.RegisterResponse, a, aw.written(), .{ .ignore_unknown_fields = true })) |parsed| {
            defer parsed.deinit();
            if (parsed.value.instanceId.len > 0) {
                @memcpy(self.instance_id_buf[0..@min(10, parsed.value.instanceId.len)], parsed.value.instanceId[0..@min(10, parsed.value.instanceId.len)]);
                self.instance_id = self.instance_id_buf[0..@min(10, parsed.value.instanceId.len)];
            }
        } else |_| {}

        self.pullSnapshot();
    }

    pub fn pullSnapshot(self: *Registrar) void {
        var arena = std.heap.ArenaAllocator.init(self.alloc);
        defer arena.deinit();
        const a = arena.allocator();
        const url = std.fmt.allocPrint(a, "{s}{s}", .{ self.cfg.platform_url, snapshot_path }) catch return;
        var aw = std.Io.Writer.Allocating.init(a);
        const result = self.http.fetch(.{
            .location = .{ .url = url },
            .method = .GET,
            .extra_headers = &.{.{ .name = "X-Service-Secret", .value = self.cfg.service_secret }},
            .response_writer = &aw.writer,
        }) catch |e| {
            std.log.warn("snapshot pull failed: {}", .{e});
            return;
        };
        if (@intFromEnum(result.status) >= 400) return;
        var parsed = std.json.parseFromSlice(std.json.Value, a, aw.written(), .{}) catch return;
        defer parsed.deinit();
        self.reg.updateFromSnapshot(parsed.value) catch {};
    }

    /// Retries the initial registration until it succeeds.
    pub fn registerWithBackoff(self: *Registrar) void {
        const backoffs = [_]u64{ 500, 1000, 2000, 4000, 8000, 15000, 30000 };
        var i: usize = 0;
        while (self.running.load(.seq_cst)) {
            if (self.registerOnce()) {
                std.log.info("registered with platform-api as instance {s}", .{self.instance_id});
                return;
            } else |e| {
                const wait = backoffs[@min(i, backoffs.len - 1)];
                std.log.warn("platform-api registration failed: {}; retry in {d}ms", .{ e, wait });
                std.Thread.sleep(wait * std.time.ns_per_ms);
                i += 1;
            }
        }
    }

    /// Launches NATS subscriptions + the periodic re-register ticker.
    pub fn run(self: *Registrar, bus: ?*Bus) !void {
        if (bus) |b| {
            try b.subscribe("env.global.PLATFORM_RESTARTED", onRestarted, self);
            try b.subscribe("env.global.ENVIRONMENT_CHANGED", onEnvChanged, self);
        }
        self.ticker = try std.Thread.spawn(.{}, tickLoop, .{self});
    }

    fn tickLoop(self: *Registrar) void {
        while (self.running.load(.seq_cst)) {
            std.Thread.sleep(re_register_period_ns);
            if (!self.running.load(.seq_cst)) return;
            self.registerOnce() catch {};
        }
    }

    fn onRestarted(ctx: ?*anyopaque, _: []const u8) void {
        const self: *Registrar = @ptrCast(@alignCast(ctx.?));
        std.Thread.sleep(2 * std.time.ns_per_s);
        // platform-api's registry version resets on restart; drop our baseline
        // so the fresh snapshot is accepted, not rejected as stale.
        self.reg.resetVersion();
        self.registerOnce() catch {};
    }

    fn onEnvChanged(ctx: ?*anyopaque, _: []const u8) void {
        const self: *Registrar = @ptrCast(@alignCast(ctx.?));
        self.pullSnapshot();
    }
};
