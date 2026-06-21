const std = @import("std");
const http = std.http;
const otel = @import("otel.zig");

pub const Method = http.Method;

/// A captured path parameter (from a `{name}` route segment).
const Param = struct { name: []const u8, value: []const u8 };

/// Per-request context handed to a handler. `arena` is freed after the request;
/// `app` is the service-wide state pointer registered on the Server.
pub const Ctx = struct {
    arena: std.mem.Allocator,
    request: *http.Server.Request,
    method: Method,
    path: []const u8,
    query: []const u8,
    app: ?*anyopaque,
    params: []const Param,
    responded: bool = false,
    status_code: u16 = 200,

    pub fn param(self: *Ctx, name: []const u8) ?[]const u8 {
        for (self.params) |p| {
            if (std.mem.eql(u8, p.name, name)) return p.value;
        }
        return null;
    }

    /// Case-insensitive header lookup on the inbound request.
    pub fn header(self: *Ctx, name: []const u8) ?[]const u8 {
        var it = self.request.iterateHeaders();
        while (it.next()) |h| {
            if (std.ascii.eqlIgnoreCase(h.name, name)) return h.value;
        }
        return null;
    }

    /// First value of a query parameter (`?k=v&...`), or null.
    pub fn queryParam(self: *Ctx, key: []const u8) ?[]const u8 {
        var it = std.mem.tokenizeScalar(u8, self.query, '&');
        while (it.next()) |pair| {
            const eq = std.mem.indexOfScalar(u8, pair, '=') orelse continue;
            if (std.mem.eql(u8, pair[0..eq], key)) return pair[eq + 1 ..];
        }
        return null;
    }

    /// Reads the full request body into the arena (bounded by max). The 0.15
    /// std.http body reader needs a scratch buffer; it lives only for this call
    /// (allocRemaining copies into the arena before returning).
    pub fn readBody(self: *Ctx, max: usize) ![]u8 {
        var scratch: [64 * 1024]u8 = undefined;
        const reader = try self.request.readerExpectContinue(&scratch);
        return reader.allocRemaining(self.arena, std.Io.Limit.limited(max));
    }

    pub fn raw(self: *Ctx, status: http.Status, content_type: []const u8, body: []const u8) !void {
        self.responded = true;
        self.status_code = @intFromEnum(status);
        try self.request.respond(body, .{
            .status = status,
            .extra_headers = &.{.{ .name = "content-type", .value = content_type }},
            // One request per connection: keep_alive=true makes std's respond run
            // discardBody to drain an unread request body for connection reuse — a
            // path that hits `unreachable` for body-bearing requests (POST) whose
            // handler didn't read the body, crashing under concurrency.
            .keep_alive = false,
        });
    }

    pub fn text(self: *Ctx, status: http.Status, body: []const u8) !void {
        try self.raw(status, "text/plain; charset=utf-8", body);
    }

    /// Empty-body response with an explicit status (e.g. 204 No Content).
    pub fn sendStatus(self: *Ctx, code: http.Status) !void {
        self.responded = true;
        self.status_code = @intFromEnum(code);
        try self.request.respond("", .{ .status = code, .keep_alive = false });
    }

    /// 302 redirect to `location`.
    pub fn redirect(self: *Ctx, location: []const u8) !void {
        self.responded = true;
        self.status_code = @intFromEnum(http.Status.found);
        try self.request.respond("", .{
            .status = .found,
            .extra_headers = &.{.{ .name = "location", .value = location }},
            .keep_alive = false,
        });
    }

    /// Serializes `value` to JSON (in the arena) and responds.
    pub fn json(self: *Ctx, status: http.Status, value: anytype) !void {
        const body = try std.fmt.allocPrint(self.arena, "{f}", .{std.json.fmt(value, .{})});
        try self.raw(status, "application/json", body);
    }

    /// Responds with a `{"error":"..."}` body.
    pub fn errorJson(self: *Ctx, status: http.Status, message: []const u8) !void {
        const body = try std.fmt.allocPrint(self.arena, "{{\"error\":{f}}}", .{std.json.fmt(message, .{})});
        try self.raw(status, "application/json", body);
    }
};

pub const Handler = *const fn (*Ctx) anyerror!void;

const Route = struct {
    method: Method,
    pattern: []const u8,
    handler: Handler,
};

/// Minimal HTTP/1.1 server + router. One OS thread per connection; keep-alive
/// loop per connection. Routes match `{param}` segments. `/actuator/health` is
/// served automatically. Replaces Spring's dispatcher for the Zig lane.
pub const Server = struct {
    alloc: std.mem.Allocator,
    routes: std.ArrayListUnmanaged(Route) = .{},
    app: ?*anyopaque = null,
    not_found: ?Handler = null,
    tracer: ?*otel.Tracer = null,

    pub fn init(alloc: std.mem.Allocator, app: ?*anyopaque) Server {
        return .{ .alloc = alloc, .app = app };
    }

    pub fn deinit(self: *Server) void {
        self.routes.deinit(self.alloc);
    }

    pub fn route(self: *Server, method: Method, pattern: []const u8, handler: Handler) !void {
        try self.routes.append(self.alloc, .{ .method = method, .pattern = pattern, .handler = handler });
    }

    pub fn get(self: *Server, pattern: []const u8, h: Handler) !void {
        try self.route(.GET, pattern, h);
    }
    pub fn post(self: *Server, pattern: []const u8, h: Handler) !void {
        try self.route(.POST, pattern, h);
    }
    pub fn delete(self: *Server, pattern: []const u8, h: Handler) !void {
        try self.route(.DELETE, pattern, h);
    }

    /// Binds 0.0.0.0:port and serves forever (one thread per connection).
    pub fn listen(self: *Server, port: u16) !void {
        const addr = try std.net.Address.parseIp("0.0.0.0", port);
        var net_server = try addr.listen(.{ .reuse_address = true });
        defer net_server.deinit();
        std.log.info("http listening on :{d}", .{port});
        while (true) {
            const conn = net_server.accept() catch |e| {
                std.log.warn("accept failed: {}", .{e});
                continue;
            };
            const t = std.Thread.spawn(.{}, handleConn, .{ self, conn }) catch {
                conn.stream.close();
                continue;
            };
            t.detach();
        }
    }

    fn handleConn(self: *Server, conn: std.net.Server.Connection) void {
        defer conn.stream.close();
        // 0.15 std.http.Server is driven by *Io.Reader / *Io.Writer adapters over
        // the connection stream; each response is flushed explicitly.
        var read_buffer: [16 * 1024]u8 = undefined;
        var write_buffer: [16 * 1024]u8 = undefined;
        var sr = conn.stream.reader(&read_buffer);
        var sw = conn.stream.writer(&write_buffer);
        var server = http.Server.init(sr.interface(), &sw.interface);
        while (server.reader.state == .ready) {
            var request = server.receiveHead() catch return;
            self.dispatch(&request) catch return;
            server.out.flush() catch return;
        }
    }

    fn dispatch(self: *Server, request: *http.Server.Request) !void {
        var arena = std.heap.ArenaAllocator.init(self.alloc);
        defer arena.deinit();
        const a = arena.allocator();

        const target = request.head.target;
        const qmark = std.mem.indexOfScalar(u8, target, '?');
        const path = if (qmark) |i| target[0..i] else target;
        const query = if (qmark) |i| target[i + 1 ..] else "";
        const method = request.head.method;

        // Built-in health endpoint.
        if (method == .GET and std.mem.eql(u8, path, "/actuator/health")) {
            try request.respond("{\"status\":\"UP\"}", .{
                .status = .ok,
                .extra_headers = &.{.{ .name = "content-type", .value = "application/json" }},
                .keep_alive = false,
            });
            return;
        }

        // Start a server span (continuing any inbound trace); finalize on return.
        const span_name = std.fmt.allocPrint(a, "{s} {s}", .{ @tagName(method), path }) catch path;
        var span = if (self.tracer) |t| t.startServerSpan(span_name, headerValue(request, "traceparent")) else otel.Span{};
        var final_status: u16 = 404;
        defer if (self.tracer) |t| t.endServerSpan(&span, @tagName(method), path, final_status);

        var params_buf: [8]Param = undefined;
        for (self.routes.items) |r| {
            if (r.method != method) continue;
            const n = matchPattern(r.pattern, path, &params_buf) orelse continue;
            var ctx = Ctx{
                .arena = a,
                .request = request,
                .method = method,
                .path = path,
                .query = query,
                .app = self.app,
                .params = params_buf[0..n],
            };
            r.handler(&ctx) catch |e| {
                if (!ctx.responded) {
                    request.respond("{\"error\":\"internal error\"}", .{
                        .status = .internal_server_error,
                        .extra_headers = &.{.{ .name = "content-type", .value = "application/json" }},
                        .keep_alive = false,
                    }) catch {};
                    ctx.status_code = 500;
                }
                std.log.warn("handler error {s} {s}: {}", .{ @tagName(method), path, e });
            };
            final_status = ctx.status_code;
            return;
        }

        if (self.not_found) |nf| {
            var ctx = Ctx{ .arena = a, .request = request, .method = method, .path = path, .query = query, .app = self.app, .params = &.{} };
            nf(&ctx) catch {};
            final_status = ctx.status_code;
            return;
        }
        request.respond("{\"error\":\"not found\"}", .{
            .status = .not_found,
            .extra_headers = &.{.{ .name = "content-type", .value = "application/json" }},
            .keep_alive = false,
        }) catch {};
    }

    /// Case-insensitive lookup of an inbound request header value.
    fn headerValue(request: *http.Server.Request, name: []const u8) ?[]const u8 {
        var it = request.iterateHeaders();
        while (it.next()) |h| {
            if (std.ascii.eqlIgnoreCase(h.name, name)) return h.value;
        }
        return null;
    }
};

/// Matches a route pattern against a path. `{name}` segments capture into
/// `out`. Returns the captured count, or null on no match.
pub fn matchPattern(pattern: []const u8, path: []const u8, out: []Param) ?usize {
    var pit = std.mem.splitScalar(u8, std.mem.trim(u8, pattern, "/"), '/');
    var sit = std.mem.splitScalar(u8, std.mem.trim(u8, path, "/"), '/');
    var n: usize = 0;
    while (true) {
        const pseg = pit.next();
        const sseg = sit.next();
        if (pseg == null and sseg == null) return n;
        if (pseg == null or sseg == null) return null;
        const p = pseg.?;
        const s = sseg.?;
        if (p.len >= 2 and p[0] == '{' and p[p.len - 1] == '}') {
            if (s.len == 0) return null;
            if (n >= out.len) return null;
            out[n] = .{ .name = p[1 .. p.len - 1], .value = s };
            n += 1;
        } else if (!std.mem.eql(u8, p, s)) {
            return null;
        }
    }
}

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

test "matchPattern captures params and rejects mismatch" {
    var buf: [8]Param = undefined;
    const n = matchPattern("/data/{id}/metadata", "/data/abc123/metadata", &buf).?;
    try testing.expectEqual(@as(usize, 1), n);
    try testing.expectEqualStrings("id", buf[0].name);
    try testing.expectEqualStrings("abc123", buf[0].value);

    try testing.expect(matchPattern("/data/{id}", "/data", &buf) == null);
    try testing.expect(matchPattern("/data", "/other", &buf) == null);
    try testing.expectEqual(@as(usize, 0), matchPattern("/data", "/data", &buf).?);
}
