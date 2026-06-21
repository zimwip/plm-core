const std = @import("std");
const HmacSha256 = std.crypto.auth.hmac.sha2.HmacSha256;
const b64 = std.base64.url_safe_no_pad.Decoder;

/// Token types carried by the `typ` claim (mirrors platform-lib-go).
pub const typ_forward = "fwd";
pub const typ_session = "session";
pub const typ_op = "op";

pub const Error = error{
    Malformed,
    BadSignature,
    WrongTokenType,
    Expired,
    SecretTooShort,
};

/// Codec verifies HS256 JWTs minted by spe-api. Key = plm.service.secret
/// (>= 32 bytes, the HS256 minimum the Java side enforces).
pub const Codec = struct {
    secret: []const u8,
    clock_skew_s: i64 = 60,

    pub fn init(secret: []const u8, clock_skew_s: i64) Error!Codec {
        if (secret.len < 32) return Error.SecretTooShort;
        return .{ .secret = secret, .clock_skew_s = clock_skew_s };
    }

    /// Verified owns the parsed claims arena; call deinit when done.
    pub const Verified = struct {
        parsed: std.json.Parsed(std.json.Value),

        pub fn deinit(self: *Verified) void {
            self.parsed.deinit();
        }

        pub fn str(self: Verified, key: []const u8) ?[]const u8 {
            const obj = self.parsed.value.object;
            const v = obj.get(key) orelse return null;
            return switch (v) {
                .string => |s| s,
                else => null,
            };
        }

        pub fn boolean(self: Verified, key: []const u8) bool {
            const v = self.parsed.value.object.get(key) orelse return false;
            return switch (v) {
                .bool => |b| b,
                else => false,
            };
        }

        /// Copies a string-array claim (roleIds, perms) into an owned slice.
        pub fn strArray(self: Verified, alloc: std.mem.Allocator, key: []const u8) ![]const []const u8 {
            const v = self.parsed.value.object.get(key) orelse return &.{};
            const arr = switch (v) {
                .array => |a| a,
                else => return &.{},
            };
            var out = try std.array_list.Managed([]const u8).initCapacity(alloc, arr.items.len);
            for (arr.items) |e| switch (e) {
                .string => |s| try out.append(try alloc.dupe(u8, s)),
                else => {},
            };
            return out.toOwnedSlice();
        }

        pub fn userId(self: Verified) []const u8 {
            return self.str("sub") orelse "";
        }
        pub fn projectSpace(self: Verified) []const u8 {
            return self.str("ps") orelse "";
        }
        pub fn username(self: Verified) []const u8 {
            return self.str("username") orelse "";
        }
        pub fn isAdmin(self: Verified) bool {
            return self.boolean("isAdmin");
        }
    };

    /// Verifies signature + exp and returns the parsed claims. Caller frees via
    /// Verified.deinit.
    pub fn verify(self: Codec, alloc: std.mem.Allocator, token: []const u8, now_s: i64) !Verified {
        // Split header.payload.signature.
        var it = std.mem.splitScalar(u8, token, '.');
        const header_b64 = it.next() orelse return Error.Malformed;
        const payload_b64 = it.next() orelse return Error.Malformed;
        const sig_b64 = it.next() orelse return Error.Malformed;
        if (it.next() != null) return Error.Malformed;

        // signing input = header.payload (the raw bytes, pre-decode).
        const signing_len = header_b64.len + 1 + payload_b64.len;
        const signing_input = token[0..signing_len];

        // Recompute HMAC and constant-time compare against the supplied sig.
        var expected: [HmacSha256.mac_length]u8 = undefined;
        HmacSha256.create(&expected, signing_input, self.secret);

        var got: [HmacSha256.mac_length]u8 = undefined;
        const sig_len = b64.calcSizeForSlice(sig_b64) catch return Error.Malformed;
        if (sig_len != got.len) return Error.BadSignature;
        b64.decode(&got, sig_b64) catch return Error.Malformed;
        if (!std.crypto.timing_safe.eql([HmacSha256.mac_length]u8, expected, got)) {
            return Error.BadSignature;
        }

        // Decode + parse the payload claims.
        const claims_len = b64.calcSizeForSlice(payload_b64) catch return Error.Malformed;
        const claims_buf = try alloc.alloc(u8, claims_len);
        defer alloc.free(claims_buf);
        b64.decode(claims_buf, payload_b64) catch return Error.Malformed;

        var parsed = try std.json.parseFromSlice(std.json.Value, alloc, claims_buf, .{});
        errdefer parsed.deinit();
        if (parsed.value != .object) return Error.Malformed;

        // exp check (seconds since epoch), with clock skew leeway.
        if (parsed.value.object.get("exp")) |exp_v| {
            const exp: i64 = switch (exp_v) {
                .integer => |i| i,
                .float => |f| @intFromFloat(f),
                else => 0,
            };
            if (exp != 0 and now_s > exp + self.clock_skew_s) return Error.Expired;
        }

        return .{ .parsed = parsed };
    }

    /// Verifies and asserts the `typ` claim equals `expected_typ`.
    pub fn verifyTyped(self: Codec, alloc: std.mem.Allocator, token: []const u8, now_s: i64, expected_typ: []const u8) !Verified {
        var v = try self.verify(alloc, token, now_s);
        errdefer v.deinit();
        const t = v.str("typ") orelse "";
        if (!std.mem.eql(u8, t, expected_typ)) return Error.WrongTokenType;
        return v;
    }
};

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;
const b64enc = std.base64.url_safe_no_pad.Encoder;

fn mintHs256(alloc: std.mem.Allocator, secret: []const u8, payload_json: []const u8) ![]u8 {
    const header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    var buf = std.array_list.Managed(u8).init(alloc);
    errdefer buf.deinit();
    var tmp: [512]u8 = undefined;

    const h = b64enc.encode(&tmp, header);
    try buf.appendSlice(h);
    try buf.append('.');
    const p = b64enc.encode(tmp[0..b64enc.calcSize(payload_json.len)], payload_json);
    try buf.appendSlice(p);

    var mac: [HmacSha256.mac_length]u8 = undefined;
    HmacSha256.create(&mac, buf.items, secret);
    try buf.append('.');
    const s = b64enc.encode(&tmp, &mac);
    try buf.appendSlice(s);
    return buf.toOwnedSlice();
}

test "verify accepts a well-formed HS256 forward token" {
    const alloc = testing.allocator;
    const secret = "0123456789abcdef0123456789abcdef"; // 32 bytes
    const payload = "{\"typ\":\"fwd\",\"sub\":\"u1\",\"ps\":\"space1\",\"username\":\"alice\",\"isAdmin\":true,\"perms\":[\"READ_DATA\",\"WRITE_DATA\"],\"exp\":9999999999}";
    const token = try mintHs256(alloc, secret, payload);
    defer alloc.free(token);

    const codec = try Codec.init(secret, 60);
    var v = try codec.verifyTyped(alloc, token, 1000, typ_forward);
    defer v.deinit();

    try testing.expectEqualStrings("u1", v.userId());
    try testing.expectEqualStrings("space1", v.projectSpace());
    try testing.expectEqualStrings("alice", v.username());
    try testing.expect(v.isAdmin());

    const perms = try v.strArray(alloc, "perms");
    defer {
        for (perms) |p| alloc.free(p);
        alloc.free(perms);
    }
    try testing.expectEqual(@as(usize, 2), perms.len);
    try testing.expectEqualStrings("READ_DATA", perms[0]);
}

test "verify rejects a tampered signature" {
    const alloc = testing.allocator;
    const secret = "0123456789abcdef0123456789abcdef";
    const token = try mintHs256(alloc, secret, "{\"typ\":\"fwd\",\"sub\":\"u1\"}");
    defer alloc.free(token);
    // flip the last char of the signature
    token[token.len - 1] = if (token[token.len - 1] == 'A') 'B' else 'A';
    const codec = try Codec.init(secret, 60);
    try testing.expectError(Error.BadSignature, codec.verify(alloc, token, 1000));
}

test "verify rejects wrong token type and expiry" {
    const alloc = testing.allocator;
    const secret = "0123456789abcdef0123456789abcdef";
    const codec = try Codec.init(secret, 60);

    const sess = try mintHs256(alloc, secret, "{\"typ\":\"session\",\"sub\":\"u1\",\"exp\":9999999999}");
    defer alloc.free(sess);
    try testing.expectError(Error.WrongTokenType, codec.verifyTyped(alloc, sess, 1000, typ_forward));

    const old = try mintHs256(alloc, secret, "{\"typ\":\"fwd\",\"sub\":\"u1\",\"exp\":500}");
    defer alloc.free(old);
    try testing.expectError(Error.Expired, codec.verify(alloc, old, 1000));
}

test "init rejects short secret" {
    try testing.expectError(Error.SecretTooShort, Codec.init("tooshort", 60));
}
