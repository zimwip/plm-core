const std = @import("std");

/// Reads an env var into an owned string, falling back to `default` when unset.
/// Caller frees the result with the same allocator.
pub fn env(alloc: std.mem.Allocator, name: []const u8, default: []const u8) ![]u8 {
    return std.process.getEnvVarOwned(alloc, name) catch |e| switch (e) {
        error.EnvironmentVariableNotFound => try alloc.dupe(u8, default),
        else => return e,
    };
}

/// Platform-wide config every service needs, sourced from env vars. Strings are
/// owned by `arena`; free by deiniting the arena. Mirrors the registration +
/// S2S knobs in platform-lib-go's RegistrationConfig + NATS/OTLP wiring.
pub const PlatformConfig = struct {
    arena: std.heap.ArenaAllocator,
    service_code: []const u8,
    self_base_url: []const u8,
    platform_url: []const u8,
    service_secret: []const u8,
    nats_url: []const u8,
    otel_endpoint: []const u8,
    space_tag: []const u8,
    version: []const u8,

    pub fn load(child: std.mem.Allocator, service_code: []const u8) !PlatformConfig {
        var arena = std.heap.ArenaAllocator.init(child);
        const a = arena.allocator();
        return .{
            .arena = arena,
            .service_code = try a.dupe(u8, service_code),
            .self_base_url = try env(a, "SPE_SELF_BASE_URL", ""),
            .platform_url = try env(a, "PLM_PLATFORM_URL", "http://platform-api:8084"),
            .service_secret = try env(a, "PLM_SERVICE_SECRET", ""),
            .nats_url = try env(a, "NATS_URL", "nats://nats:4222"),
            .otel_endpoint = try env(a, "OTEL_EXPORTER_OTLP_ENDPOINT", ""),
            .space_tag = try env(a, "PLATFORM_REGISTRATION_SPACE_TAG", ""),
            .version = try env(a, "SERVICE_VERSION", "0.1.0"),
        };
    }

    pub fn deinit(self: *PlatformConfig) void {
        self.arena.deinit();
    }
};
