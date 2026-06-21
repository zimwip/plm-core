//! platform-lib-zig — public API surface for the Zig polyglot lane.
//! Re-exports the modules consumer services (dst-zig) import.

pub const util = @import("util.zig");
pub const dto = @import("dto.zig");
pub const jwt = @import("jwt.zig");
pub const config = @import("config.zig");
pub const context = @import("context.zig");
pub const registry = @import("registry.zig");
pub const client = @import("client.zig");
pub const nats = @import("nats.zig");
pub const registration = @import("registration.zig");
pub const httpx = @import("http.zig");
pub const otel = @import("otel.zig");

// Convenience aliases.
pub const Codec = jwt.Codec;
pub const Registry = registry.Registry;
pub const RequestContext = context.RequestContext;
pub const PlatformConfig = config.PlatformConfig;
pub const ServiceClient = client.ServiceClient;
pub const Bus = nats.Bus;
pub const Registrar = registration.Registrar;
pub const HttpServer = httpx.Server;
pub const Tracer = otel.Tracer;
pub const instanceId = util.instanceId;

test {
    @import("std").testing.refAllDecls(@This());
}
