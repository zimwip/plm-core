const std = @import("std");

// platform-lib-zig — the Zig lane of PLM Core's shared platform library.
// Mirrors platform-lib-go / platform-lib-rs: JWT (HS256), registration DTOs,
// instance-id derivation, the local service registry, the S2S client, a NATS
// wrapper, a minimal HTTP server/router and an OTLP/HTTP JSON span exporter.
//
// Exposes a single importable module named "platform_lib" for consumer
// services (e.g. dst-zig), plus a `test` step running the unit suite.
pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const mod = b.addModule("platform_lib", .{
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    // OTLP/HTTP span export is hand-rolled in src/otel.zig (the zig-o11y SDK
    // v0.1.0 GP-faults under concurrent load — see its removed import). No
    // external tracing deps.

    const lib = b.addLibrary(.{
        .linkage = .static,
        .name = "platform_lib",
        .root_module = mod,
    });
    b.installArtifact(lib);

    const unit_tests = b.addTest(.{ .root_module = mod });
    const run_unit_tests = b.addRunArtifact(unit_tests);
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_unit_tests.step);
}
