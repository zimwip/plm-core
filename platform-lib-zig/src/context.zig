const std = @import("std");

/// RequestContext carries inbound request state forwarded on outbound S2S calls
/// — the Zig analogue of the Java ServiceClientTokenContext ThreadLocal. Zig has
/// no ThreadLocal idiom for this; a *RequestContext is threaded explicitly
/// through handlers and into ServiceClient calls. Fields are slices borrowed
/// from the request arena (valid for the request's lifetime).
pub const RequestContext = struct {
    // Forwarded on outbound calls.
    bearer: []const u8 = "",
    project_space: []const u8 = "",
    job_id: []const u8 = "",
    traceparent: []const u8 = "",
    tracestate: []const u8 = "",

    // Identity of the inbound caller (read by handlers; not re-sent as headers
    // — the bearer already carries it).
    user_id: []const u8 = "",
    username: []const u8 = "",
    is_admin: bool = false,
};

/// Extracts the token from an "Authorization: Bearer <t>" header value.
pub fn bearerToken(authorization: []const u8) []const u8 {
    const prefix = "Bearer ";
    if (std.mem.startsWith(u8, authorization, prefix)) {
        return std.mem.trim(u8, authorization[prefix.len..], " ");
    }
    return "";
}

test "bearerToken strips the Bearer prefix" {
    try std.testing.expectEqualStrings("abc.def.ghi", bearerToken("Bearer abc.def.ghi"));
    try std.testing.expectEqualStrings("", bearerToken("Basic xyz"));
    try std.testing.expectEqualStrings("", bearerToken(""));
}
