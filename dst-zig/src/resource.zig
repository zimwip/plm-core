const std = @import("std");
const platform = @import("platform_lib");
const Ctx = platform.httpx.Ctx;
const DataAuthz = @import("authz.zig").DataAuthz;

// Federated item catalog — pull model: platform-api POSTs an ItemVisibilityContext
// to /internal/items/visible and dst returns the filtered descriptor list.
// Mirrors DataItemContribution + DataItemVisibility.

// Field names match the Java platform-lib ItemParameter record — the frontend
// reads by name (e.g. gates the file picker on widgetType === 'FILE').
const ItemParameter = struct {
    name: []const u8,
    label: []const u8,
    dataType: []const u8,
    required: bool,
    defaultValue: ?[]const u8 = null,
    allowedValues: ?[]const u8 = null,
    widgetType: []const u8,
    validationRegex: ?[]const u8 = null,
    tooltip: ?[]const u8 = null,
    displayOrder: i32,
    displaySection: ?[]const u8 = null,
};
const CreateAction = struct {
    httpMethod: []const u8 = "POST",
    path: []const u8 = "/data",
    contentType: []const u8 = "multipart/form-data",
    bodyShape: []const u8 = "MULTIPART",
    parameters: []const ItemParameter,
    name: []const u8 = "Upload file",
    description: []const u8 = "Upload a binary file to the data store",
    displayCategory: []const u8 = "PRIMARY",
    displayOrder: i32 = 0,
};
const ListShape = struct { idField: []const u8 = "id", labelField: []const u8 = "originalName", iconField: ?[]const u8 = null };
const ListAction = struct {
    httpMethod: []const u8 = "GET",
    path: []const u8 = "/data",
    pageParam: []const u8 = "page",
    sizeParam: []const u8 = "size",
    queryParams: []const []const u8 = &.{},
    itemShape: ListShape = .{},
    name: []const u8 = "Browse files",
    description: []const u8 = "View and search uploaded data files",
    displayCategory: []const u8 = "SECONDARY",
    displayOrder: i32 = 10,
};
const GetAction = struct {
    httpMethod: []const u8 = "GET",
    path: []const u8 = "/data/{id}/detail",
    name: []const u8 = "Open",
    description: []const u8 = "View file details",
    displayCategory: []const u8 = "SECONDARY",
    displayOrder: i32 = 20,
};
const ImportAction = struct {
    path: []const u8 = "/data",
    acceptedTypes: []const u8 = "*",
    name: []const u8 = "Import file",
    description: []const u8 = "Upload any file to the data store",
    displayOrder: i32 = 0,
    jobStatusPath: ?[]const u8 = null,
    parameters: []const ItemParameter = &.{},
};
const ItemDescriptor = struct {
    serviceCode: []const u8 = "dst",
    itemCode: []const u8 = "data-object",
    itemKey: ?[]const u8 = null,
    displayName: []const u8 = "Data file",
    description: []const u8 = "Binary blobs hosted in the dst service",
    icon: []const u8 = "FileText",
    color: []const u8 = "#6366f1",
    sourceLabel: []const u8 = "DATA",
    panelSection: []const u8 = "MAIN",
    priority: i32 = 500,
    create: ?CreateAction,
    list: ?ListAction,
    get: ?GetAction,
    importActions: []const ImportAction,
    events: []const []const u8 = &.{ "CREATED", "UPDATED" },
};

const VisibilityContext = struct {
    userId: ?[]const u8 = null,
    projectSpaceId: ?[]const u8 = null,
    admin: bool = false,
    roleIds: ?[]const []const u8 = null,
    globalPerms: ?[]const []const u8 = null,
};

const params = [_]ItemParameter{
    .{ .name = "file", .label = "File", .dataType = "FILE", .required = true, .widgetType = "FILE", .tooltip = "Binary content to upload", .displayOrder = 1 },
    .{ .name = "name", .label = "Display name", .dataType = "STRING", .required = false, .widgetType = "TEXT", .tooltip = "Optional override for the file name stored as metadata", .displayOrder = 2 },
};
const import_actions = [_]ImportAction{.{}};

/// POST /internal/items/visible (S2S). Verifies the service secret, then returns
/// the data-object descriptor with actions filtered per the caller's perms.
pub fn visible(ctx: *Ctx, service_secret: []const u8, authz: *DataAuthz) !void {
    if (!secretOk(ctx, service_secret)) return ctx.errorJson(.forbidden, "Invalid or missing service secret");

    const body = try ctx.readBody(64 * 1024);
    const parsed = std.json.parseFromSlice(VisibilityContext, ctx.arena, body, .{ .ignore_unknown_fields = true }) catch {
        return ctx.json(.ok, .{});
    };
    defer parsed.deinit();
    const vc = parsed.value;

    const empty = [_]ItemDescriptor{};

    if (vc.admin) {
        return ctx.json(.ok, [_]ItemDescriptor{fullDescriptor()});
    }
    // Business service: items scoped per project space.
    const ps = vc.projectSpaceId orelse return ctx.json(.ok, empty);
    if (ps.len == 0) return ctx.json(.ok, empty);

    // DATA-scope perms are role-based (not in the GLOBAL globalPerms); resolve
    // can-read/can-write from the caller's roles via pno's grants.
    const roles = vc.roleIds orelse &.{};
    const can_write = authz.anyRoleGrants(roles, "WRITE_DATA");
    const can_read = authz.anyRoleGrants(roles, "READ_DATA");
    if (!can_write and !can_read) return ctx.json(.ok, empty);

    var d = fullDescriptor();
    if (!can_write) d.create = null;
    if (!can_read) {
        d.list = null;
        d.get = null;
    }
    try ctx.json(.ok, [_]ItemDescriptor{d});
}

fn fullDescriptor() ItemDescriptor {
    return .{
        .create = CreateAction{ .parameters = &params },
        .list = ListAction{},
        .get = GetAction{},
        .importActions = &import_actions,
    };
}

pub fn secretOk(ctx: *Ctx, service_secret: []const u8) bool {
    const got = ctx.header("x-service-secret") orelse return false;
    return std.mem.eql(u8, got, service_secret);
}
