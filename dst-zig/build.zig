const std = @import("std");

// dst-zig — the Zig port of the dst (Data Store) reference service.
// Links platform-lib-zig (shared platform contract) + pg.zig (pure-Zig
// Postgres driver). Produces a single static musl binary `dst`.
pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const platform_lib = b.dependency("platform_lib", .{
        .target = target,
        .optimize = optimize,
    }).module("platform_lib");

    const pg = b.dependency("pg", .{
        .target = target,
        .optimize = optimize,
    }).module("pg");

    const exe_mod = b.createModule(.{
        .root_source_file = b.path("src/main.zig"),
        .target = target,
        .optimize = optimize,
    });
    exe_mod.addImport("platform_lib", platform_lib);
    exe_mod.addImport("pg", pg);

    const exe = b.addExecutable(.{ .name = "dst", .root_module = exe_mod });
    b.installArtifact(exe);

    const run_cmd = b.addRunArtifact(exe);
    run_cmd.step.dependOn(b.getInstallStep());
    const run_step = b.step("run", "Run dst");
    run_step.dependOn(&run_cmd.step);

    const unit_tests = b.addTest(.{ .root_module = exe_mod });
    const run_unit_tests = b.addRunArtifact(unit_tests);
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_unit_tests.step);
}
