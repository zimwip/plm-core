const std = @import("std");

/// POSTed to platform-api /internal/environment/register. Field names match
/// Jackson camelCase so std.json.stringify produces the Java-compatible body.
pub const RegisterRequest = struct {
    serviceCode: []const u8,
    baseUrl: []const u8,
    healthUrl: []const u8,
    routePrefix: []const u8,
    extraPaths: []const []const u8,
    version: []const u8,
    spaceTag: []const u8,
    features: []const []const u8,
};

/// Body returned by a successful registration.
pub const RegisterResponse = struct {
    instanceId: []const u8 = "",
};

/// Lightweight per-instance view in a registry snapshot.
pub const ServiceInstanceInfo = struct {
    instanceId: []const u8,
    serviceCode: []const u8,
    baseUrl: []const u8,
    version: []const u8 = "",
    spaceTag: []const u8 = "",
    healthy: bool = false,
};

test "RegisterRequest stringifies to camelCase JSON" {
    const alloc = std.testing.allocator;
    const req = RegisterRequest{
        .serviceCode = "dst",
        .baseUrl = "http://dst:8086",
        .healthUrl = "http://dst:8086/actuator/health",
        .routePrefix = "/api/dst/**",
        .extraPaths = &.{},
        .version = "0.1.0",
        .spaceTag = "",
        .features = &.{},
    };
    const json = try std.fmt.allocPrint(alloc, "{f}", .{std.json.fmt(req, .{})});
    defer alloc.free(json);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"serviceCode\":\"dst\"") != null);
    try std.testing.expect(std.mem.indexOf(u8, json, "\"routePrefix\":\"/api/dst/**\"") != null);
}
