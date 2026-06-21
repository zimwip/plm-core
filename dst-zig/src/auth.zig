const std = @import("std");
const platform = @import("platform_lib");

/// The authenticated caller, extracted from the forward JWT (typ=fwd) that
/// spe-api injects on the Authorization header. Mirrors DstUserContext + the
/// @PlmPermission gate: admins implicitly hold every permission.
pub const Principal = struct {
    user_id: []const u8,
    project_space: []const u8,
    username: []const u8,
    is_admin: bool,
    perms: []const []const u8, // GLOBAL-scope perms carried by the token
    role_ids: []const []const u8, // active-project roles (DATA perms resolved via DataAuthz)

    /// GLOBAL-scope check (token `perms`); DATA-scope perms are resolved from
    /// roles by the handler via DataAuthz.
    pub fn hasPerm(self: Principal, code: []const u8) bool {
        if (self.is_admin) return true;
        for (self.perms) |p| {
            if (std.mem.eql(u8, p, code)) return true;
        }
        return false;
    }
};

pub const Error = error{Unauthorized};

/// Verifies the Authorization bearer and builds a Principal whose strings are
/// owned by `alloc` (the request arena). Accepts forward tokens (typ=fwd, the
/// normal gateway path) AND operation tokens (typ=op, used by async S2S jobs
/// like cad-api imports) — mirrors Java PlmAuthFilter. For op tokens the
/// X-Job-Id header must equal the token's `jid` claim.
pub fn authenticate(alloc: std.mem.Allocator, ctx: anytype, codec: *const platform.Codec) !Principal {
    const authz = ctx.header("authorization") orelse return Error.Unauthorized;
    const token = platform.context.bearerToken(authz);
    if (token.len == 0) return Error.Unauthorized;

    var v = codec.verify(alloc, token, std.time.timestamp()) catch return Error.Unauthorized;
    defer v.deinit();
    if (v.userId().len == 0) return Error.Unauthorized;

    const typ = v.str("typ") orelse "";
    const is_fwd = std.mem.eql(u8, typ, platform.jwt.typ_forward);
    const is_op = std.mem.eql(u8, typ, platform.jwt.typ_op);
    if (!is_fwd and !is_op) return Error.Unauthorized;

    // Operation tokens are bound to a job: X-Job-Id must match the jid claim.
    if (is_op) {
        const jid = v.str("jid") orelse "";
        const header_jid = ctx.header("x-job-id") orelse "";
        if (jid.len == 0 or !std.mem.eql(u8, header_jid, jid)) return Error.Unauthorized;
    }

    return .{
        .user_id = try alloc.dupe(u8, v.userId()),
        .project_space = try alloc.dupe(u8, v.projectSpace()),
        .username = try alloc.dupe(u8, v.username()),
        .is_admin = v.isAdmin(),
        .perms = try v.strArray(alloc, "perms"),
        .role_ids = try v.strArray(alloc, "roleIds"),
    };
}
