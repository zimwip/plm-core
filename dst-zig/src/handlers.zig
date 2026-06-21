const std = @import("std");
const platform = @import("platform_lib");
const pg = @import("pg");
const Ctx = platform.httpx.Ctx;
const DataService = @import("data_service.zig").DataService;
const dserr = @import("data_service.zig").Error;
const auth = @import("auth.zig");
const multipart = @import("multipart.zig");
const meta = @import("metadata.zig");
const ui = @import("ui.zig");
const resource = @import("resource.zig");
const DataAuthz = @import("authz.zig").DataAuthz;

const max_upload = 1 << 30; // 1 GiB

/// Service-wide state shared with every handler via Ctx.app.
pub const AppState = struct {
    ds: *DataService,
    codec: *const platform.Codec,
    schema: []const u8,
    pool: *pg.Pool,
    service_secret: []const u8,
    ui_dir: []const u8,
    authz: *DataAuthz,
};

fn app(ctx: *Ctx) *AppState {
    return @ptrCast(@alignCast(ctx.app.?));
}

/// Authenticates + checks a permission, responding 401/403 on failure. Returns
/// null when it already responded (handler should return).
fn gate(ctx: *Ctx, a: *AppState, perm: []const u8) !?auth.Principal {
    const p = auth.authenticate(ctx.arena, ctx, a.codec) catch {
        try ctx.errorJson(.unauthorized, "unauthorized");
        return null;
    };
    // GLOBAL-scope perms ride the token; DATA-scope perms are resolved from the
    // caller's roles against pno's grants (DataAuthz). Admin bypasses both.
    if (!p.hasPerm(perm) and !a.authz.anyRoleGrants(p.role_ids, perm)) {
        try ctx.errorJson(.forbidden, "forbidden");
        return null;
    }
    return p;
}

fn handleServiceError(ctx: *Ctx, e: anyerror) !void {
    if (e == dserr.NotFound) return ctx.errorJson(.not_found, "Data not found");
    std.log.warn("handler service error: {}", .{e});
    return ctx.errorJson(.internal_server_error, "internal error");
}

pub fn list(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const page = std.fmt.parseInt(i64, ctx.queryParam("page") orelse "0", 10) catch 0;
    const size = std.fmt.parseInt(i64, ctx.queryParam("size") orelse "50", 10) catch 50;
    const items = a.ds.list(ctx.arena, p.project_space, page, size) catch |e| return handleServiceError(ctx, e);
    try ctx.json(.ok, items);
}

pub fn upload(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "WRITE_DATA")) orelse return;

    const ct = ctx.header("content-type") orelse return ctx.errorJson(.bad_request, "missing content-type");
    // boundary is a slice into the HTTP read_buffer, which readBody overwrites
    // with body bytes — dupe it into the arena before reading the body.
    const boundary = try ctx.arena.dupe(u8, multipart.boundaryOf(ct) orelse return ctx.errorJson(.bad_request, "not multipart/form-data"));
    const body = try ctx.readBody(max_upload);
    const parts = try multipart.parse(ctx.arena, boundary, body);
    const file = multipart.find(parts, "file") orelse return ctx.errorJson(.bad_request, "missing file part");

    const name_field = multipart.find(parts, "name");
    const original_name = blk: {
        if (name_field) |n| if (n.data.len > 0) break :blk n.data;
        break :blk file.filename orelse "upload";
    };
    const file_ct = file.content_type orelse "application/octet-stream";

    const result = a.ds.upload(ctx.arena, p.user_id, p.project_space, original_name, file_ct, file.data) catch |e| return handleServiceError(ctx, e);
    try ctx.json(.ok, result);
}

pub fn reference(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "WRITE_DATA")) orelse return;
    const id = ctx.param("id").?;
    const m = a.ds.reference(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.json(.ok, m);
}

pub fn unreference(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "WRITE_DATA")) orelse return;
    const id = ctx.param("id").?;
    a.ds.unreference(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.sendStatus(.no_content);
}

pub fn metadata(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const id = ctx.param("id").?;
    const m = a.ds.loadOrThrow(ctx.arena, id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.json(.ok, m);
}

pub fn content(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const id = ctx.param("id").?;
    const c = a.ds.openContent(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    const ct = c.metadata.contentType orelse "application/octet-stream";
    try ctx.raw(.ok, ct, c.bytes);
}

pub fn download(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const id = ctx.param("id").?;
    const pre = a.ds.presignedUrl(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.redirect(pre.url);
}

pub fn downloadUrl(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const id = ctx.param("id").?;
    const pre = a.ds.presignedUrl(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.json(.ok, pre);
}

// Detail DTOs mirror the Java platform-lib records field-for-field so the
// frontend detail view + action buttons render (DetailDescriptor / FieldValue /
// ActionDescriptor / ItemTypeRef).
const ItemTypeRef = struct { serviceCode: []const u8 = "dst", itemCode: []const u8 = "data-object", itemKey: ?[]const u8 = null };
const FieldExtras = struct { editable: bool = false, required: bool = false };
const FieldValue = struct { name: []const u8, value: []const u8, extras: FieldExtras = .{} };
const GuardViolation = struct { code: []const u8, message: []const u8, effect: []const u8 };
const ActionParam = struct {};
const ActionMeta = struct { presignedDownload: ?bool = null, requiresPermission: ?[]const u8 = null };
const ActionDescriptor = struct {
    code: []const u8,
    label: []const u8,
    description: []const u8,
    icon: []const u8,
    httpMethod: []const u8,
    path: []const u8,
    bodyShape: []const u8 = "RAW",
    jobStatusPath: ?[]const u8 = null,
    parameters: []const ActionParam = &.{},
    confirmRequired: bool = false,
    dangerous: bool = false,
    navigateTo: ?[]const u8 = null,
    // FileExistsGuard (DOWNLOAD=HIDE, DELETE=BLOCK): detail loads the row first,
    // so the file always exists here → no violations.
    guardViolations: []const GuardViolation = &.{},
    metadata: ActionMeta = .{},
};
const DetailMeta = struct { isImage: bool, downloadUrl: []const u8 };
const Detail = struct {
    id: []const u8,
    itemType: ItemTypeRef = .{},
    values: []const FieldValue,
    actions: []const ActionDescriptor,
    metadata: DetailMeta,
};

pub fn detail(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "READ_DATA")) orelse return;
    const id = ctx.param("id").?;
    const m = a.ds.loadOrThrow(ctx.arena, id, p.project_space) catch |e| return handleServiceError(ctx, e);

    const arena = ctx.arena;
    const values = [_]FieldValue{
        .{ .name = "originalName", .value = m.originalName orelse "" },
        .{ .name = "contentType", .value = m.contentType orelse "" },
        .{ .name = "sizeBytes", .value = try std.fmt.allocPrint(arena, "{d}", .{m.sizeBytes}) },
        .{ .name = "sha256", .value = m.sha256 },
        .{ .name = "refCount", .value = try std.fmt.allocPrint(arena, "{d}", .{m.refCount}) },
        .{ .name = "createdBy", .value = m.createdBy },
        .{ .name = "createdAt", .value = m.createdAt orelse "" },
        .{ .name = "lastAccessed", .value = m.lastAccessed orelse "" },
        .{ .name = "location", .value = m.location },
    };
    const del_path = try std.fmt.allocPrint(arena, "/data/{s}", .{id});
    const dl_path = try std.fmt.allocPrint(arena, "/data/{s}/download-url", .{id});
    const actions = [_]ActionDescriptor{
        .{ .code = "DOWNLOAD", .label = "Download", .description = "Download the file directly from object storage via a presigned URL", .icon = "Download", .httpMethod = "GET", .path = dl_path, .metadata = .{ .presignedDownload = true } },
        .{ .code = "DELETE", .label = "Delete", .description = "Remove the file. Admin only.", .icon = "Trash2", .httpMethod = "DELETE", .path = del_path, .confirmRequired = true, .dangerous = true, .metadata = .{ .requiresPermission = "MANAGE_DATA" } },
    };
    const ct = m.contentType orelse "";
    const is_image = std.mem.startsWith(u8, ct, "image/");
    const dl_view = try std.fmt.allocPrint(arena, "/api/dst/data/{s}", .{id});

    const d = Detail{
        .id = m.id,
        .itemType = .{},
        .values = &values,
        .actions = &actions,
        .metadata = .{ .isImage = is_image, .downloadUrl = dl_view },
    };
    try ctx.json(.ok, d);
}

pub fn deleteData(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "MANAGE_DATA")) orelse return;
    const id = ctx.param("id").?;
    a.ds.delete(ctx.arena, id, p.user_id, p.project_space) catch |e| return handleServiceError(ctx, e);
    try ctx.sendStatus(.no_content);
}

pub fn stats(ctx: *Ctx) !void {
    const a = app(ctx);
    const p = (try gate(ctx, a, "MANAGE_DATA")) orelse return;
    const sql = if (p.is_admin)
        try std.fmt.allocPrint(ctx.arena, "SELECT count(*)::bigint, coalesce(sum(size_bytes),0)::bigint FROM {s}.data_object", .{a.schema})
    else
        try std.fmt.allocPrint(ctx.arena, "SELECT count(*)::bigint, coalesce(sum(size_bytes),0)::bigint FROM {s}.data_object WHERE project_space_id = $1", .{a.schema});
    const conn = try a.pool.acquire();
    defer a.pool.release(conn);
    var qr = (if (p.is_admin) try conn.row(sql, .{}) else try conn.row(sql, .{p.project_space})) orelse {
        return ctx.json(.ok, .{ .fileCount = @as(i64, 0), .totalBytes = @as(i64, 0) });
    };
    defer qr.deinit() catch {};
    try ctx.json(.ok, .{ .fileCount = try qr.get(i64, 0), .totalBytes = try qr.get(i64, 1) });
}

// ── S2S internal endpoints (X-Service-Secret, called by platform-api) ─────────

/// POST /internal/items/visible — federated item catalog (filtered descriptor).
pub fn visibleItems(ctx: *Ctx) !void {
    const a = app(ctx);
    try resource.visible(ctx, a.service_secret, a.authz);
}

/// GET /internal/ui/plugins — microfrontend declarations.
pub fn uiPlugins(ctx: *Ctx) !void {
    if (!resource.secretOk(ctx, app(ctx).service_secret)) return ctx.errorJson(.forbidden, "Invalid or missing service secret");
    try ui.plugins(ctx);
}

/// GET /ui/{file} — serve a prebuilt microfrontend bundle (public).
pub fn uiBundle(ctx: *Ctx) !void {
    try ui.serve(ctx, app(ctx).ui_dir);
}

const TypeField = struct { key: []const u8, label: []const u8, type: []const u8 };

pub fn itemType(ctx: *Ctx) !void {
    // Static schema for the data-object item type (public).
    const fields = [_]TypeField{
        .{ .key = "originalName", .label = "Name", .type = "string" },
        .{ .key = "contentType", .label = "Content Type", .type = "string" },
        .{ .key = "sizeBytes", .label = "Size", .type = "number" },
        .{ .key = "sha256", .label = "SHA-256", .type = "string" },
        .{ .key = "refCount", .label = "References", .type = "number" },
    };
    try ctx.json(.ok, .{ .key = ctx.param("key") orelse "data-object", .service = "dst", .fields = &fields });
}
