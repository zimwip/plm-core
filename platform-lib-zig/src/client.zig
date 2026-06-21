const std = @import("std");
const http = std.http;
const Registry = @import("registry.zig").Registry;
const RequestContext = @import("context.zig").RequestContext;

/// Joins an instance base URL and a bare, root-relative path, collapsing a
/// double slash at the seam. Caller frees.
pub fn joinUrl(alloc: std.mem.Allocator, base: []const u8, path: []const u8) ![]u8 {
    const b = std.mem.trimRight(u8, base, "/");
    if (path.len == 0) return alloc.dupe(u8, b);
    if (path[0] == '/') return std.fmt.allocPrint(alloc, "{s}{s}", .{ b, path });
    return std.fmt.allocPrint(alloc, "{s}/{s}", .{ b, path });
}

/// A buffered S2S response. `body` is owned by the caller's allocator.
pub const Response = struct {
    status: u16,
    body: []u8,
};

/// ServiceClient resolves a logical serviceCode to a live instance via the
/// Registry and performs S2S calls, attaching the service secret and forwarding
/// the inbound RequestContext (auth + trace). Retries on transport errors and
/// 5xx only; 4xx is terminal. Port of platform-lib-go's ServiceClient.
///
/// Paths are BARE, root-relative (e.g. "/nodes", "/internal/config/snapshot").
pub const ServiceClient = struct {
    base: std.mem.Allocator,
    http: http.Client,
    reg: *Registry,
    secret: []const u8,
    max_retries: usize = 3,
    mutex: std.Thread.Mutex = .{},

    pub fn init(base: std.mem.Allocator, reg: *Registry, secret: []const u8) ServiceClient {
        return .{ .base = base, .http = .{ .allocator = base }, .reg = reg, .secret = secret };
    }

    pub fn deinit(self: *ServiceClient) void {
        self.http.deinit();
    }

    /// GET/POST/etc against serviceCode + bare path; buffers the body into
    /// `alloc`. Returns the final Response (any status) or a transport error
    /// after exhausting retries.
    pub fn request(
        self: *ServiceClient,
        alloc: std.mem.Allocator,
        method: http.Method,
        service_code: []const u8,
        path: []const u8,
        payload: ?[]const u8,
        content_type: ?[]const u8,
        rc: ?*const RequestContext,
    ) !Response {
        _ = self.reg.awaitPopulated(15 * std.time.ns_per_s);

        var attempt: usize = 0;
        while (true) : (attempt += 1) {
            const inst = self.reg.pickInstance(service_code) orelse return error.NoInstance;
            const url = try joinUrl(alloc, inst.baseUrl, path);
            defer alloc.free(url);

            // Build forwarded headers.
            var headers = std.array_list.Managed(http.Header).init(alloc);
            defer headers.deinit();
            try headers.append(.{ .name = "X-Service-Secret", .value = self.secret });
            var bearer_buf: ?[]u8 = null;
            defer if (bearer_buf) |b| alloc.free(b);
            if (rc) |c| {
                if (c.bearer.len > 0) {
                    bearer_buf = try std.fmt.allocPrint(alloc, "Bearer {s}", .{c.bearer});
                    try headers.append(.{ .name = "Authorization", .value = bearer_buf.? });
                }
                if (c.project_space.len > 0) try headers.append(.{ .name = "X-PLM-ProjectSpace", .value = c.project_space });
                if (c.job_id.len > 0) try headers.append(.{ .name = "X-Job-Id", .value = c.job_id });
                if (c.traceparent.len > 0) try headers.append(.{ .name = "traceparent", .value = c.traceparent });
                if (c.tracestate.len > 0) try headers.append(.{ .name = "tracestate", .value = c.tracestate });
            }

            var aw = std.Io.Writer.Allocating.init(alloc);
            const std_headers: http.Client.Request.Headers = if (content_type) |ct|
                .{ .content_type = .{ .override = ct } }
            else
                .{};

            const result = self.http.fetch(.{
                .location = .{ .url = url },
                .method = method,
                .payload = payload,
                .extra_headers = headers.items,
                .headers = std_headers,
                .response_writer = &aw.writer,
            }) catch |e| {
                aw.deinit();
                if (attempt < self.max_retries) {
                    backoff(attempt);
                    continue;
                }
                return e;
            };

            const status: u16 = @intFromEnum(result.status);
            if (status >= 500 and attempt < self.max_retries) {
                aw.deinit();
                backoff(attempt);
                continue;
            }
            return .{ .status = status, .body = try aw.toOwnedSlice() };
        }
    }

    /// GET + JSON-parse into T. Caller frees the returned Parsed(T).
    pub fn getJson(
        self: *ServiceClient,
        comptime T: type,
        alloc: std.mem.Allocator,
        service_code: []const u8,
        path: []const u8,
        rc: ?*const RequestContext,
    ) !std.json.Parsed(T) {
        const resp = try self.request(alloc, .GET, service_code, path, null, null, rc);
        defer alloc.free(resp.body);
        if (resp.status >= 400) return error.UpstreamError;
        return std.json.parseFromSlice(T, alloc, resp.body, .{ .ignore_unknown_fields = true });
    }
};

fn backoff(attempt: usize) void {
    const ms: u64 = @as(u64, 100) * (@as(u64, 1) << @intCast(attempt));
    std.Thread.sleep(ms * std.time.ns_per_ms);
}

test "joinUrl collapses the seam slash" {
    const a = std.testing.allocator;
    const url1 = try joinUrl(a, "http://psm:8080/", "/nodes");
    defer a.free(url1);
    try std.testing.expectEqualStrings("http://psm:8080/nodes", url1);
    const url2 = try joinUrl(a, "http://psm:8080", "nodes");
    defer a.free(url2);
    try std.testing.expectEqualStrings("http://psm:8080/nodes", url2);
}
