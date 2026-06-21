const std = @import("std");

/// Parsed header of a NATS `MSG` protocol line (payload follows on the next
/// line). Format: `MSG <subject> <sid> [reply-to] <nbytes>`.
pub const MsgHeader = struct {
    subject: []const u8,
    sid: []const u8,
    reply: ?[]const u8,
    nbytes: usize,
};

pub fn parseMsgHeader(line: []const u8) !MsgHeader {
    // line excludes the trailing CRLF and the leading "MSG ".
    var it = std.mem.tokenizeScalar(u8, line, ' ');
    const subject = it.next() orelse return error.BadFrame;
    const sid = it.next() orelse return error.BadFrame;
    const a = it.next() orelse return error.BadFrame;
    const b = it.next();
    if (b) |nb| {
        return .{ .subject = subject, .sid = sid, .reply = a, .nbytes = try std.fmt.parseInt(usize, nb, 10) };
    }
    return .{ .subject = subject, .sid = sid, .reply = null, .nbytes = try std.fmt.parseInt(usize, a, 10) };
}

/// Per-subscription callback. `ctx` is the opaque pointer registered alongside.
pub const Handler = *const fn (ctx: ?*anyopaque, payload: []const u8) void;

const Subscription = struct {
    subject: []const u8,
    sid: []const u8,
    handler: Handler,
    ctx: ?*anyopaque,
};

/// A thin NATS client — the analogue of platform-lib-go's Bus. Hand-rolled text
/// protocol over a TCP socket: CONNECT/SUB/PUB/PING-PONG with a background
/// reader thread and automatic reconnect (re-SUBs on reconnect).
pub const Bus = struct {
    alloc: std.mem.Allocator,
    host: []const u8,
    port: u16,
    name: []const u8,

    mutex: std.Thread.Mutex = .{},
    stream: ?std.net.Stream = null,
    subs: std.ArrayListUnmanaged(Subscription) = .{},
    next_sid: usize = 1,
    running: std.atomic.Value(bool) = std.atomic.Value(bool).init(true),
    reader: ?std.Thread = null,

    /// Parses `nats://host:port` (scheme optional) into a Bus (not yet connected).
    pub fn init(alloc: std.mem.Allocator, url: []const u8, name: []const u8) !Bus {
        var rest = url;
        if (std.mem.indexOf(u8, rest, "://")) |i| rest = rest[i + 3 ..];
        var host: []const u8 = rest;
        var port: u16 = 4222;
        if (std.mem.lastIndexOfScalar(u8, rest, ':')) |i| {
            host = rest[0..i];
            port = try std.fmt.parseInt(u16, rest[i + 1 ..], 10);
        }
        return .{
            .alloc = alloc,
            .host = try alloc.dupe(u8, host),
            .port = port,
            .name = try alloc.dupe(u8, name),
        };
    }

    pub fn deinit(self: *Bus) void {
        self.running.store(false, .seq_cst);
        if (self.stream) |s| s.close();
        if (self.reader) |t| t.join();
        for (self.subs.items) |sub| {
            self.alloc.free(sub.subject);
            self.alloc.free(sub.sid);
        }
        self.subs.deinit(self.alloc);
        self.alloc.free(self.host);
        self.alloc.free(self.name);
    }

    fn connectOnce(self: *Bus) !void {
        const stream = try std.net.tcpConnectToHost(self.alloc, self.host, self.port);
        errdefer stream.close();
        // Server greets with INFO; we don't need to parse it for a plaintext,
        // no-auth dev broker. Send CONNECT then re-SUB everything.
        var buf: [512]u8 = undefined;
        const connect = try std.fmt.bufPrint(&buf, "CONNECT {{\"name\":\"{s}\",\"verbose\":false,\"pedantic\":false}}\r\nPING\r\n", .{self.name});
        try stream.writeAll(connect);
        self.mutex.lock();
        self.stream = stream;
        for (self.subs.items) |sub| {
            const line = try std.fmt.bufPrint(&buf, "SUB {s} {s}\r\n", .{ sub.subject, sub.sid });
            try stream.writeAll(line);
        }
        self.mutex.unlock();
    }

    /// Connects (with retry) and starts the background reader.
    pub fn start(self: *Bus) !void {
        try self.connectWithRetry();
        self.reader = try std.Thread.spawn(.{}, readLoop, .{self});
    }

    fn connectWithRetry(self: *Bus) !void {
        var attempt: usize = 0;
        while (self.running.load(.seq_cst)) : (attempt += 1) {
            self.connectOnce() catch {
                std.Thread.sleep(2 * std.time.ns_per_s);
                continue;
            };
            return;
        }
        return error.Stopped;
    }

    pub fn subscribe(self: *Bus, subject: []const u8, handler: Handler, ctx: ?*anyopaque) !void {
        self.mutex.lock();
        defer self.mutex.unlock();
        const sid = try std.fmt.allocPrint(self.alloc, "{d}", .{self.next_sid});
        self.next_sid += 1;
        try self.subs.append(self.alloc, .{
            .subject = try self.alloc.dupe(u8, subject),
            .sid = sid,
            .handler = handler,
            .ctx = ctx,
        });
        if (self.stream) |s| {
            var buf: [256]u8 = undefined;
            const line = try std.fmt.bufPrint(&buf, "SUB {s} {s}\r\n", .{ subject, sid });
            s.writeAll(line) catch {};
        }
    }

    pub fn publish(self: *Bus, subject: []const u8, payload: []const u8) !void {
        self.mutex.lock();
        defer self.mutex.unlock();
        const s = self.stream orelse return error.NotConnected;
        var hdr: [256]u8 = undefined;
        const line = try std.fmt.bufPrint(&hdr, "PUB {s} {d}\r\n", .{ subject, payload.len });
        try s.writeAll(line);
        try s.writeAll(payload);
        try s.writeAll("\r\n");
    }

    fn dispatch(self: *Bus, h: MsgHeader, payload: []const u8) void {
        self.mutex.lock();
        const subs = self.subs.items;
        // Copy matching handlers out before unlocking to avoid holding the lock
        // across user code.
        var matched: [16]Subscription = undefined;
        var n: usize = 0;
        for (subs) |sub| {
            if (std.mem.eql(u8, sub.sid, h.sid) and n < matched.len) {
                matched[n] = sub;
                n += 1;
            }
        }
        self.mutex.unlock();
        for (matched[0..n]) |sub| sub.handler(sub.ctx, payload);
    }

    fn readLoop(self: *Bus) void {
        var rbuf = std.array_list.Managed(u8).init(self.alloc);
        defer rbuf.deinit();
        var tmp: [4096]u8 = undefined;

        while (self.running.load(.seq_cst)) {
            const stream = self.stream orelse {
                self.connectWithRetry() catch return;
                continue;
            };
            const nread = stream.read(&tmp) catch {
                // connection dropped: reconnect
                self.mutex.lock();
                if (self.stream) |s| s.close();
                self.stream = null;
                self.mutex.unlock();
                if (!self.running.load(.seq_cst)) return;
                self.connectWithRetry() catch return;
                continue;
            };
            if (nread == 0) {
                self.mutex.lock();
                self.stream = null;
                self.mutex.unlock();
                self.connectWithRetry() catch return;
                continue;
            }
            rbuf.appendSlice(tmp[0..nread]) catch return;
            self.drain(&rbuf) catch return;
        }
    }

    // Consumes complete protocol frames from rbuf.
    fn drain(self: *Bus, rbuf: *std.array_list.Managed(u8)) !void {
        while (true) {
            const data = rbuf.items;
            const nl = std.mem.indexOfScalar(u8, data, '\n') orelse return;
            const line = std.mem.trimRight(u8, data[0..nl], "\r");

            if (std.mem.startsWith(u8, line, "MSG ")) {
                const h = try parseMsgHeader(line[4..]);
                // Need the full payload (nbytes) + trailing CRLF after the header line.
                const payload_start = nl + 1;
                const payload_end = payload_start + h.nbytes;
                if (data.len < payload_end + 2) return; // wait for more bytes
                const payload = data[payload_start..payload_end];
                self.dispatch(h, payload);
                rbuf.replaceRange(0, payload_end + 2, &.{}) catch {};
                continue;
            } else if (std.mem.eql(u8, line, "PING")) {
                self.mutex.lock();
                if (self.stream) |s| s.writeAll("PONG\r\n") catch {};
                self.mutex.unlock();
            }
            // PONG / INFO / +OK / -ERR: skip the line.
            rbuf.replaceRange(0, nl + 1, &.{}) catch {};
        }
    }
};

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

test "parseMsgHeader with and without reply-to" {
    const h1 = try parseMsgHeader("env.global.PLATFORM_RESTARTED 3 11");
    try testing.expectEqualStrings("env.global.PLATFORM_RESTARTED", h1.subject);
    try testing.expectEqualStrings("3", h1.sid);
    try testing.expect(h1.reply == null);
    try testing.expectEqual(@as(usize, 11), h1.nbytes);

    const h2 = try parseMsgHeader("foo.bar 7 _INBOX.xyz 42");
    try testing.expectEqualStrings("foo.bar", h2.subject);
    try testing.expectEqualStrings("_INBOX.xyz", h2.reply.?);
    try testing.expectEqual(@as(usize, 42), h2.nbytes);
}

test "url parse host:port" {
    var bus = try Bus.init(testing.allocator, "nats://nats:4222", "dst");
    defer bus.deinit();
    try testing.expectEqualStrings("nats", bus.host);
    try testing.expectEqual(@as(u16, 4222), bus.port);
}
