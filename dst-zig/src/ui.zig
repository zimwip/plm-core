const std = @import("std");
const platform = @import("platform_lib");
const Ctx = platform.httpx.Ctx;

// Microfrontend bundles are built from dst-zig/ui (Vite) into a directory the
// runtime serves from disk (DST_UI_DIR). Disk-serving — rather than @embedFile —
// handles Vite's hashed shared-chunk names (dstApi-<hash>.js) without baking the
// hash into the binary at comptime.

fn contentType(file: []const u8) []const u8 {
    if (std.mem.endsWith(u8, file, ".js")) return "application/javascript; charset=utf-8";
    if (std.mem.endsWith(u8, file, ".css")) return "text/css; charset=utf-8";
    if (std.mem.endsWith(u8, file, ".json")) return "application/json";
    if (std.mem.endsWith(u8, file, ".map")) return "application/json";
    return "application/octet-stream";
}

/// Serves a UI bundle at /ui/{file} from `dir` (public). Browser URL is
/// /api/dst/ui/{file}. Rejects path traversal.
pub fn serve(ctx: *Ctx, dir: []const u8) !void {
    const file = ctx.param("file") orelse return ctx.errorJson(.not_found, "not found");
    if (file.len == 0 or std.mem.indexOfScalar(u8, file, '/') != null or std.mem.indexOf(u8, file, "..") != null) {
        return ctx.errorJson(.bad_request, "invalid path");
    }
    const path = try std.fmt.allocPrint(ctx.arena, "{s}/{s}", .{ dir, file });
    const bytes = std.fs.cwd().readFileAlloc(ctx.arena, path, 8 * 1024 * 1024) catch {
        return ctx.errorJson(.not_found, "bundle not found");
    };
    try ctx.raw(.ok, contentType(file), bytes);
}

const PluginDeclaration = struct {
    pluginId: []const u8,
    zone: []const u8,
    entryPath: []const u8,
    requiredPermission: ?[]const u8 = null,
};

/// GET /internal/ui/plugins — platform-api pulls the microfrontend declarations.
/// Mirrors UiPluginsConfig (dst-nav / dst-settings). Entry names are stable Vite
/// entry points (only the shared chunk is hashed).
pub fn plugins(ctx: *Ctx) !void {
    const decls = [_]PluginDeclaration{
        .{ .pluginId = "dst-nav", .zone = "nav", .entryPath = "nav.js" },
        .{ .pluginId = "dst-settings", .zone = "settings", .entryPath = "settings.js", .requiredPermission = "MANAGE_DATA" },
    };
    try ctx.json(.ok, decls);
}
