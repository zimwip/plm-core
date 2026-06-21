const std = @import("std");

/// W3C trace context carried by the `traceparent` header:
/// `00-<32 hex trace-id>-<16 hex span-id>-<2 hex flags>`.
pub const TraceContext = struct {
    trace_id: [16]u8,
    span_id: [8]u8,
    flags: u8,

    pub fn parse(traceparent: []const u8) ?TraceContext {
        var it = std.mem.splitScalar(u8, traceparent, '-');
        const ver = it.next() orelse return null;
        const tid = it.next() orelse return null;
        const sid = it.next() orelse return null;
        const fl = it.next() orelse return null;
        if (ver.len != 2 or tid.len != 32 or sid.len != 16 or fl.len != 2) return null;
        var tc: TraceContext = undefined;
        _ = std.fmt.hexToBytes(&tc.trace_id, tid) catch return null;
        _ = std.fmt.hexToBytes(&tc.span_id, sid) catch return null;
        var flags_buf: [1]u8 = undefined;
        _ = std.fmt.hexToBytes(&flags_buf, fl) catch return null;
        tc.flags = flags_buf[0];
        return tc;
    }

    /// Formats the `traceparent` header value into `out` (>= 55 bytes).
    pub fn format(self: TraceContext, out: []u8) []const u8 {
        const tid = std.fmt.bytesToHex(self.trace_id, .lower);
        const sid = std.fmt.bytesToHex(self.span_id, .lower);
        return std.fmt.bufPrint(out, "00-{s}-{s}-{x:0>2}", .{ &tid, &sid, self.flags }) catch unreachable;
    }
};

/// A server span. Created by startServerSpan, finished by endServerSpan.
pub const Span = struct {
    trace_id: [16]u8 = undefined,
    span_id: [8]u8 = undefined,
    parent_id: ?[8]u8 = null,
    start_ns: i128 = 0,
    sampled: bool = false,
};

/// Minimal OpenTelemetry tracer: builds server spans and batch-exports them as
/// OTLP/HTTP **JSON** to `<endpoint>/v1/traces` (the Jaeger collector accepts
/// JSON). Hand-rolled — the zig-o11y SDK v0.1.0 GP-faults under this server's
/// concurrent load. A single background flusher drains finished spans every
/// second; span creation/end only touch a mutex-guarded queue (no per-request
/// network, no shared exporter state), so it is safe under concurrency.
pub const Tracer = struct {
    alloc: std.mem.Allocator,
    http: std.http.Client,
    endpoint: []const u8, // e.g. http://jaeger:4318
    service_name: []const u8,
    enabled: bool = false,
    mutex: std.Thread.Mutex = .{},
    queue: std.array_list.Managed([]u8) = undefined,
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    flusher: ?std.Thread = null,

    pub fn init(alloc: std.mem.Allocator, endpoint: []const u8, service_name: []const u8) Tracer {
        return .{
            .alloc = alloc,
            .http = .{ .allocator = alloc },
            .endpoint = endpoint,
            .service_name = service_name,
            .enabled = endpoint.len > 0,
            .queue = std.array_list.Managed([]u8).init(alloc),
        };
    }

    pub fn enabledp(self: *const Tracer) bool {
        return self.enabled;
    }

    pub fn start(self: *Tracer) !void {
        if (!self.enabled) return;
        self.flusher = try std.Thread.spawn(.{}, flushLoop, .{self});
    }

    pub fn deinit(self: *Tracer) void {
        self.running.store(false, .seq_cst);
        if (self.flusher) |t| t.join();
        self.flushOnce();
        for (self.queue.items) |s| self.alloc.free(s);
        self.queue.deinit();
        self.http.deinit();
    }

    /// Begins a server span, continuing the trace from an inbound `traceparent`
    /// header when present (its span becomes the parent), else minting a fresh one.
    pub fn startServerSpan(self: *Tracer, name: []const u8, traceparent_header: ?[]const u8) Span {
        _ = name;
        if (!self.enabled) return .{};
        var span = Span{ .start_ns = std.time.nanoTimestamp(), .sampled = true };
        if (traceparent_header) |tp| {
            if (TraceContext.parse(tp)) |tc| {
                span.trace_id = tc.trace_id;
                span.parent_id = tc.span_id;
                span.sampled = (tc.flags & 1) != 0;
                std.crypto.random.bytes(&span.span_id);
                return span;
            }
        }
        std.crypto.random.bytes(&span.trace_id);
        std.crypto.random.bytes(&span.span_id);
        return span;
    }

    /// Finalizes a server span: renders it to OTLP/JSON and queues it for export.
    pub fn endServerSpan(self: *Tracer, span: *Span, method: []const u8, path: []const u8, status_code: u16) void {
        if (!self.enabled or !span.sampled) return;
        const end_ns = std.time.nanoTimestamp();
        const otel_status: u8 = if (status_code >= 500) 2 else 1; // ERROR : OK

        const tid = std.fmt.bytesToHex(span.trace_id, .lower);
        const sid = std.fmt.bytesToHex(span.span_id, .lower);
        var parent_json: []const u8 = "";
        var parent_buf: [60]u8 = undefined;
        if (span.parent_id) |pid| {
            const phex = std.fmt.bytesToHex(pid, .lower);
            parent_json = std.fmt.bufPrint(&parent_buf, ",\"parentSpanId\":\"{s}\"", .{&phex}) catch "";
        }
        const name = std.fmt.allocPrint(self.alloc, "{s} {s}", .{ method, path }) catch return;
        defer self.alloc.free(name);

        const json = std.fmt.allocPrint(self.alloc,
            \\{{"traceId":"{s}","spanId":"{s}"{s},"name":{f},"kind":2,"startTimeUnixNano":"{d}","endTimeUnixNano":"{d}","attributes":[{{"key":"http.request.method","value":{{"stringValue":{f}}}}},{{"key":"url.path","value":{{"stringValue":{f}}}}},{{"key":"http.response.status_code","value":{{"intValue":"{d}"}}}}],"status":{{"code":{d}}}}}
        , .{
            &tid,                          &sid,
            parent_json,                   std.json.fmt(name, .{}),
            @as(u64, @intCast(span.start_ns)), @as(u64, @intCast(end_ns)),
            std.json.fmt(method, .{}),     std.json.fmt(path, .{}),
            status_code,                   otel_status,
        }) catch return;

        self.mutex.lock();
        defer self.mutex.unlock();
        self.queue.append(json) catch self.alloc.free(json);
    }

    fn flushLoop(self: *Tracer) void {
        while (self.running.load(.seq_cst)) {
            std.Thread.sleep(1 * std.time.ns_per_s);
            self.flushOnce();
        }
    }

    fn flushOnce(self: *Tracer) void {
        self.mutex.lock();
        if (self.queue.items.len == 0) {
            self.mutex.unlock();
            return;
        }
        const spans = self.queue.toOwnedSlice() catch {
            self.mutex.unlock();
            return;
        };
        self.mutex.unlock();
        defer {
            for (spans) |s| self.alloc.free(s);
            self.alloc.free(spans);
        }

        var body = std.array_list.Managed(u8).init(self.alloc);
        defer body.deinit();
        const w = body.writer();
        w.print(
            \\{{"resourceSpans":[{{"resource":{{"attributes":[{{"key":"service.name","value":{{"stringValue":{f}}}}}]}},"scopeSpans":[{{"scope":{{"name":"platform-lib-zig"}},"spans":[
        , .{std.json.fmt(self.service_name, .{})}) catch return;
        for (spans, 0..) |s, i| {
            if (i > 0) w.writeByte(',') catch return;
            w.writeAll(s) catch return;
        }
        w.writeAll("]}]}]}") catch return;

        const url = std.fmt.allocPrint(self.alloc, "{s}/v1/traces", .{std.mem.trimRight(u8, self.endpoint, "/")}) catch return;
        defer self.alloc.free(url);
        var discard = std.Io.Writer.Allocating.init(self.alloc);
        defer discard.deinit();
        _ = self.http.fetch(.{
            .location = .{ .url = url },
            .method = .POST,
            .payload = body.items,
            .headers = .{ .content_type = .{ .override = "application/json" } },
            .response_writer = &discard.writer,
            .keep_alive = false,
        }) catch |e| std.log.debug("otel export failed: {}", .{e});
    }
};

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

test "traceparent round-trip" {
    const tp = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const tc = TraceContext.parse(tp).?;
    try testing.expectEqual(@as(u8, 1), tc.flags);
    var out: [64]u8 = undefined;
    try testing.expectEqualStrings(tp, tc.format(&out));
}

test "traceparent rejects malformed" {
    try testing.expect(TraceContext.parse("garbage") == null);
    try testing.expect(TraceContext.parse("00-tooshort-x-01") == null);
}

test "disabled tracer is a no-op" {
    var tr = Tracer.init(testing.allocator, "", "dst");
    defer tr.deinit();
    try testing.expect(!tr.enabledp());
    var span = tr.startServerSpan("GET /data", null);
    tr.endServerSpan(&span, "GET", "/data", 200);
    try testing.expect(!span.sampled);
}
