const std = @import("std");

/// InstanceID is the deterministic id = first 10 hex chars of SHA-1(baseURL),
/// matching spe-api / platform-lib-go so a re-registering instance replaces its
/// own entry. Writes into `out` (>= 10 bytes) and returns the slice.
pub fn instanceId(base_url: []const u8, out: []u8) []const u8 {
    std.debug.assert(out.len >= 10);
    var digest: [std.crypto.hash.Sha1.digest_length]u8 = undefined;
    std.crypto.hash.Sha1.hash(base_url, &digest, .{});
    const hex = "0123456789abcdef";
    var i: usize = 0;
    while (i < 5) : (i += 1) {
        out[i * 2] = hex[digest[i] >> 4];
        out[i * 2 + 1] = hex[digest[i] & 0x0f];
    }
    return out[0..10];
}

test "instanceId is first 10 hex chars of sha1" {
    var buf: [10]u8 = undefined;
    const id = instanceId("http://dst:8086", &buf);
    try std.testing.expectEqual(@as(usize, 10), id.len);
    // deterministic: same input → same id
    var buf2: [10]u8 = undefined;
    try std.testing.expectEqualStrings(id, instanceId("http://dst:8086", &buf2));
    // sanity vs a known sha1: sha1("abc") = a9993e364706816aba3e25717850c26c9cd0d89d
    var buf3: [10]u8 = undefined;
    try std.testing.expectEqualStrings("a9993e3647", instanceId("abc", &buf3));
}
