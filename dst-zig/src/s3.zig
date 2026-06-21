const std = @import("std");
const Sha256 = std.crypto.hash.sha2.Sha256;
const HmacSha256 = std.crypto.auth.hmac.sha2.HmacSha256;

/// AWS Signature V4 helpers + a minimal path-style S3 client (PUT/GET/DELETE +
/// presigned GET). Hand-rolled to keep the pure-Zig story (no aws-sdk). Targets
/// Garage (S3-compatible), path-style addressing: `<endpoint>/<bucket>/<key>`.

fn hmac(key: []const u8, msg: []const u8) [32]u8 {
    var out: [32]u8 = undefined;
    HmacSha256.create(&out, msg, key);
    return out;
}

fn sha256(data: []const u8) [32]u8 {
    var out: [32]u8 = undefined;
    Sha256.hash(data, &out, .{});
    return out;
}

/// Lowercase hex of bytes into `out` (len must be 2*bytes.len). Returns the slice.
pub fn hexLower(out: []u8, bytes: []const u8) []const u8 {
    const tbl = "0123456789abcdef";
    for (bytes, 0..) |b, i| {
        out[i * 2] = tbl[b >> 4];
        out[i * 2 + 1] = tbl[b & 0x0f];
    }
    return out[0 .. bytes.len * 2];
}

pub fn sha256Hex(out: *[64]u8, data: []const u8) []const u8 {
    return hexLower(out, &sha256(data));
}

/// SigV4 signing key: HMAC chain over date→region→service→aws4_request.
pub fn signingKey(secret: []const u8, datestamp: []const u8, region: []const u8, service: []const u8) [32]u8 {
    var k0_buf: [256]u8 = undefined;
    const k0 = std.fmt.bufPrint(&k0_buf, "AWS4{s}", .{secret}) catch unreachable;
    const k_date = hmac(k0, datestamp);
    const k_region = hmac(&k_date, region);
    const k_service = hmac(&k_region, service);
    return hmac(&k_service, "aws4_request");
}

const DateParts = struct {
    amz: [16]u8, // YYYYMMDDTHHMMSSZ
    stamp: [8]u8, // YYYYMMDD
};

/// Formats an epoch-seconds timestamp into AWS amz-date + datestamp (UTC).
pub fn formatDate(epoch_s: i64) DateParts {
    const es: u64 = @intCast(epoch_s);
    const eday = std.time.epoch.EpochSeconds{ .secs = es };
    const day = eday.getEpochDay();
    const yd = day.calculateYearDay();
    const md = yd.calculateMonthDay();
    const ds = eday.getDaySeconds();
    var p: DateParts = undefined;
    _ = std.fmt.bufPrint(&p.stamp, "{d:0>4}{d:0>2}{d:0>2}", .{ yd.year, md.month.numeric(), md.day_index + 1 }) catch unreachable;
    _ = std.fmt.bufPrint(&p.amz, "{d:0>4}{d:0>2}{d:0>2}T{d:0>2}{d:0>2}{d:0>2}Z", .{
        yd.year, md.month.numeric(), md.day_index + 1, ds.getHoursIntoDay(), ds.getMinutesIntoHour(), ds.getSecondsIntoMinute(),
    }) catch unreachable;
    return p;
}

const Url = struct { scheme: []const u8, hostport: []const u8, host: []const u8 };

fn parseUrl(url: []const u8) Url {
    var rest = url;
    var scheme: []const u8 = "http";
    if (std.mem.indexOf(u8, rest, "://")) |i| {
        scheme = rest[0..i];
        rest = rest[i + 3 ..];
    }
    if (std.mem.indexOfScalar(u8, rest, '/')) |i| rest = rest[0..i];
    var host = rest;
    if (std.mem.indexOfScalar(u8, rest, ':')) |i| host = rest[0..i];
    return .{ .scheme = scheme, .hostport = rest, .host = host };
}

pub const StoreResult = struct {
    location: []const u8, // = key (owned by caller's alloc)
    size_bytes: i64,
    sha256_hex: [64]u8,
};

pub const Client = struct {
    alloc: std.mem.Allocator,
    http: std.http.Client,
    endpoint: []const u8,
    public_endpoint: []const u8,
    region: []const u8,
    bucket: []const u8,
    access_key: []const u8,
    secret_key: []const u8,

    pub fn init(alloc: std.mem.Allocator, cfg: anytype) Client {
        return .{
            .alloc = alloc,
            .http = .{ .allocator = alloc },
            .endpoint = cfg.s3_endpoint,
            .public_endpoint = cfg.s3_public_endpoint,
            .region = cfg.s3_region,
            .bucket = cfg.s3_bucket,
            .access_key = cfg.s3_access_key,
            .secret_key = cfg.s3_secret_key,
        };
    }

    pub fn deinit(self: *Client) void {
        self.http.deinit();
    }

    /// PUT bytes under `key`; computes SHA-256 of the payload (the dedup key).
    pub fn store(self: *Client, key: []const u8, body: []const u8, content_type: []const u8) !StoreResult {
        var res: StoreResult = .{ .location = key, .size_bytes = @intCast(body.len), .sha256_hex = undefined };
        _ = sha256Hex(&res.sha256_hex, body);
        try self.signedRequest(.PUT, key, body, content_type, null);
        return res;
    }

    pub fn delete(self: *Client, key: []const u8) void {
        self.signedRequest(.DELETE, key, "", null, null) catch |e| {
            std.log.warn("s3 delete {s} failed: {}", .{ key, e });
        };
    }

    /// GET object bytes into the caller's allocator.
    pub fn get(self: *Client, alloc: std.mem.Allocator, key: []const u8) ![]u8 {
        var aw = std.Io.Writer.Allocating.init(alloc);
        errdefer aw.deinit();
        try self.signedRequest(.GET, key, "", null, &aw.writer);
        return aw.toOwnedSlice();
    }

    fn signedRequest(self: *Client, method: std.http.Method, key: []const u8, body: []const u8, content_type: ?[]const u8, out: ?*std.Io.Writer) !void {
        const u = parseUrl(self.endpoint);
        const dt = formatDate(std.time.timestamp());

        var payload_hash: [64]u8 = undefined;
        _ = sha256Hex(&payload_hash, body);

        const canonical_uri = try std.fmt.allocPrint(self.alloc, "/{s}/{s}", .{ self.bucket, key });
        defer self.alloc.free(canonical_uri);

        // SignedHeaders = host;x-amz-content-sha256;x-amz-date (content-type sent unsigned).
        const canonical_headers = try std.fmt.allocPrint(self.alloc, "host:{s}\nx-amz-content-sha256:{s}\nx-amz-date:{s}\n", .{ u.hostport, payload_hash, dt.amz });
        defer self.alloc.free(canonical_headers);
        const signed_headers = "host;x-amz-content-sha256;x-amz-date";

        const canonical_request = try std.fmt.allocPrint(self.alloc, "{s}\n{s}\n\n{s}\n{s}\n{s}", .{
            @tagName(method), canonical_uri, canonical_headers, signed_headers, payload_hash,
        });
        defer self.alloc.free(canonical_request);

        var cr_hash: [64]u8 = undefined;
        _ = sha256Hex(&cr_hash, canonical_request);
        const scope = try std.fmt.allocPrint(self.alloc, "{s}/{s}/s3/aws4_request", .{ dt.stamp, self.region });
        defer self.alloc.free(scope);
        const string_to_sign = try std.fmt.allocPrint(self.alloc, "AWS4-HMAC-SHA256\n{s}\n{s}\n{s}", .{ dt.amz, scope, cr_hash });
        defer self.alloc.free(string_to_sign);

        const sk = signingKey(self.secret_key, &dt.stamp, self.region, "s3");
        const sig = hmac(&sk, string_to_sign);
        var sig_hex: [64]u8 = undefined;
        _ = hexLower(&sig_hex, &sig);

        const authz = try std.fmt.allocPrint(self.alloc, "AWS4-HMAC-SHA256 Credential={s}/{s}, SignedHeaders={s}, Signature={s}", .{ self.access_key, scope, signed_headers, sig_hex });
        defer self.alloc.free(authz);

        const full_url = try std.fmt.allocPrint(self.alloc, "{s}{s}", .{ self.endpoint, canonical_uri });
        defer self.alloc.free(full_url);

        var extra = std.array_list.Managed(std.http.Header).init(self.alloc);
        defer extra.deinit();
        try extra.append(.{ .name = "x-amz-content-sha256", .value = &payload_hash });
        try extra.append(.{ .name = "x-amz-date", .value = &dt.amz });
        try extra.append(.{ .name = "Authorization", .value = authz });

        const std_headers: std.http.Client.Request.Headers = if (content_type) |ct|
            .{ .content_type = .{ .override = ct } }
        else
            .{};

        // 0.15 fetch drains the response body via discardRemaining when
        // response_writer is null — and that path segfaults on a response with a
        // body (garage's PUT/DELETE replies). Always give it a writer; discard
        // into a local one when the caller doesn't want the bytes.
        var discard = std.Io.Writer.Allocating.init(self.alloc);
        defer discard.deinit();
        const result = try self.http.fetch(.{
            .location = .{ .url = full_url },
            .method = method,
            .payload = if (body.len > 0) body else null,
            .extra_headers = extra.items,
            .headers = std_headers,
            .response_writer = out orelse &discard.writer,
            // Garage's DELETE replies 204 (no content-length); with keep-alive the
            // 0.15 body reader blocks waiting for bytes that never arrive. Closing
            // the connection gives the reader a clean EOF.
            .keep_alive = false,
        });
        if (@intFromEnum(result.status) >= 300) return error.S3Error;
    }

    /// Builds a presigned GET URL (query-string SigV4) against the public
    /// endpoint, valid for `ttl_s` seconds. Caller frees.
    pub fn presignedGetUrl(self: *Client, alloc: std.mem.Allocator, key: []const u8, ttl_s: i64) ![]u8 {
        const u = parseUrl(self.public_endpoint);
        const dt = formatDate(std.time.timestamp());
        const canonical_uri = try std.fmt.allocPrint(alloc, "/{s}/{s}", .{ self.bucket, key });
        defer alloc.free(canonical_uri);

        const credential = try std.fmt.allocPrint(alloc, "{s}/{s}/{s}/s3/aws4_request", .{ self.access_key, dt.stamp, self.region });
        defer alloc.free(credential);
        // URL-encode the credential's slashes for the query string.
        const cred_enc = try urlEncode(alloc, credential);
        defer alloc.free(cred_enc);

        // Canonical query string: params sorted by key (already alphabetical here).
        const canonical_query = try std.fmt.allocPrint(alloc, "X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential={s}&X-Amz-Date={s}&X-Amz-Expires={d}&X-Amz-SignedHeaders=host", .{ cred_enc, dt.amz, ttl_s });
        defer alloc.free(canonical_query);

        const canonical_headers = try std.fmt.allocPrint(alloc, "host:{s}\n", .{u.hostport});
        defer alloc.free(canonical_headers);

        const canonical_request = try std.fmt.allocPrint(alloc, "GET\n{s}\n{s}\n{s}\nhost\nUNSIGNED-PAYLOAD", .{ canonical_uri, canonical_query, canonical_headers });
        defer alloc.free(canonical_request);

        var cr_hash: [64]u8 = undefined;
        _ = sha256Hex(&cr_hash, canonical_request);
        const scope = try std.fmt.allocPrint(alloc, "{s}/{s}/s3/aws4_request", .{ dt.stamp, self.region });
        defer alloc.free(scope);
        const string_to_sign = try std.fmt.allocPrint(alloc, "AWS4-HMAC-SHA256\n{s}\n{s}\n{s}", .{ dt.amz, scope, cr_hash });
        defer alloc.free(string_to_sign);

        const sk = signingKey(self.secret_key, &dt.stamp, self.region, "s3");
        const sig = hmac(&sk, string_to_sign);
        var sig_hex: [64]u8 = undefined;
        _ = hexLower(&sig_hex, &sig);

        return std.fmt.allocPrint(alloc, "{s}{s}?{s}&X-Amz-Signature={s}", .{ self.public_endpoint, canonical_uri, canonical_query, sig_hex });
    }
};

/// RFC-3986 percent-encode (unreserved chars pass through). Caller frees.
fn urlEncode(alloc: std.mem.Allocator, s: []const u8) ![]u8 {
    var out = std.array_list.Managed(u8).init(alloc);
    errdefer out.deinit();
    for (s) |c| {
        if (std.ascii.isAlphanumeric(c) or c == '-' or c == '_' or c == '.' or c == '~') {
            try out.append(c);
        } else {
            try out.writer().print("%{X:0>2}", .{c});
        }
    }
    return out.toOwnedSlice();
}

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

test "SigV4 signing key matches AWS documented vector" {
    // AWS docs "deriving the signing key" example.
    const sk = signingKey("wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY", "20120215", "us-east-1", "iam");
    var hex: [64]u8 = undefined;
    _ = hexLower(&hex, &sk);
    try testing.expectEqualStrings("f4780e2d9f65fa895f9c67b32ce1baf0b0d8a43505a000a1a9e090d414db404d", &hex);
}

test "formatDate produces amz + datestamp" {
    // 2012-02-15T00:00:00Z = 1329264000
    const dt = formatDate(1329264000);
    try testing.expectEqualStrings("20120215", &dt.stamp);
    try testing.expectEqualStrings("20120215T000000Z", &dt.amz);
}

test "urlEncode escapes slashes" {
    const e = try urlEncode(testing.allocator, "AK/20120215/us-east-1");
    defer testing.allocator.free(e);
    try testing.expectEqualStrings("AK%2F20120215%2Fus-east-1", e);
}
