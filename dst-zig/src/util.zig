const std = @import("std");

/// Generates a random UUID v4 into `out` (>= 36 bytes); returns the slice.
pub fn genUuid(out: *[36]u8) []const u8 {
    var b: [16]u8 = undefined;
    std.crypto.random.bytes(&b);
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // variant
    const h0 = std.fmt.bytesToHex(b[0..4], .lower);
    const h1 = std.fmt.bytesToHex(b[4..6], .lower);
    const h2 = std.fmt.bytesToHex(b[6..8], .lower);
    const h3 = std.fmt.bytesToHex(b[8..10], .lower);
    const h4 = std.fmt.bytesToHex(b[10..16], .lower);
    _ = std.fmt.bufPrint(out, "{s}-{s}-{s}-{s}-{s}", .{ &h0, &h1, &h2, &h3, &h4 }) catch unreachable;
    return out[0..36];
}

/// ISO-8601 local-ish timestamp (UTC) "YYYY-MM-DDTHH:MM:SS" into `out` (>= 19).
pub fn isoNow(out: *[19]u8) []const u8 {
    const es: u64 = @intCast(std.time.timestamp());
    const eday = std.time.epoch.EpochSeconds{ .secs = es };
    const day = eday.getEpochDay();
    const yd = day.calculateYearDay();
    const md = yd.calculateMonthDay();
    const ds = eday.getDaySeconds();
    _ = std.fmt.bufPrint(out, "{d:0>4}-{d:0>2}-{d:0>2}T{d:0>2}:{d:0>2}:{d:0>2}", .{
        yd.year, md.month.numeric(), md.day_index + 1, ds.getHoursIntoDay(), ds.getMinutesIntoHour(), ds.getSecondsIntoMinute(),
    }) catch unreachable;
    return out[0..19];
}

test "genUuid shape" {
    var buf: [36]u8 = undefined;
    const id = genUuid(&buf);
    try std.testing.expectEqual(@as(usize, 36), id.len);
    try std.testing.expectEqual(@as(u8, '-'), id[8]);
    try std.testing.expectEqual(@as(u8, '4'), id[14]); // version nibble
}
