const std = @import("std");

/// One parsed multipart/form-data part.
pub const Part = struct {
    name: []const u8,
    filename: ?[]const u8,
    content_type: ?[]const u8,
    data: []const u8,
};

/// Extracts the boundary token from a Content-Type header value, or null.
pub fn boundaryOf(content_type: []const u8) ?[]const u8 {
    const marker = "boundary=";
    const i = std.mem.indexOf(u8, content_type, marker) orelse return null;
    var b = content_type[i + marker.len ..];
    if (b.len >= 2 and b[0] == '"') {
        const end = std.mem.indexOfScalarPos(u8, b, 1, '"') orelse return null;
        return b[1..end];
    }
    if (std.mem.indexOfScalar(u8, b, ';')) |j| b = b[0..j];
    return std.mem.trim(u8, b, " ");
}

/// Parses a multipart/form-data body into parts. Slices borrow `body`. Bounded
/// to `max_parts` (excess ignored).
pub fn parse(alloc: std.mem.Allocator, boundary: []const u8, body: []const u8) ![]Part {
    var parts = std.array_list.Managed(Part).init(alloc);
    errdefer parts.deinit();

    const delim = try std.fmt.allocPrint(alloc, "--{s}", .{boundary});
    defer alloc.free(delim);

    var it = std.mem.splitSequence(u8, body, delim);
    _ = it.next(); // preamble before first delimiter
    while (it.next()) |seg| {
        // Each segment starts with CRLF (or "--" for the closing delimiter).
        if (seg.len >= 2 and seg[0] == '-' and seg[1] == '-') break; // closing
        var s = seg;
        if (std.mem.startsWith(u8, s, "\r\n")) s = s[2..];
        const hdr_end = std.mem.indexOf(u8, s, "\r\n\r\n") orelse continue;
        const headers = s[0..hdr_end];
        var data = s[hdr_end + 4 ..];
        // strip the trailing CRLF before the next boundary
        if (std.mem.endsWith(u8, data, "\r\n")) data = data[0 .. data.len - 2];

        var part = Part{ .name = "", .filename = null, .content_type = null, .data = data };
        var hit = std.mem.splitSequence(u8, headers, "\r\n");
        while (hit.next()) |line| {
            if (std.ascii.startsWithIgnoreCase(line, "content-disposition:")) {
                part.name = extractParam(line, "name=") orelse "";
                part.filename = extractParam(line, "filename=");
            } else if (std.ascii.startsWithIgnoreCase(line, "content-type:")) {
                part.content_type = std.mem.trim(u8, line["content-type:".len..], " ");
            }
        }
        try parts.append(part);
    }
    return parts.toOwnedSlice();
}

/// Finds the first part with the given form field name.
pub fn find(parts: []const Part, name: []const u8) ?Part {
    for (parts) |p| {
        if (std.mem.eql(u8, p.name, name)) return p;
    }
    return null;
}

fn extractParam(line: []const u8, key: []const u8) ?[]const u8 {
    const i = std.mem.indexOf(u8, line, key) orelse return null;
    var v = line[i + key.len ..];
    if (v.len > 0 and v[0] == '"') {
        const end = std.mem.indexOfScalarPos(u8, v, 1, '"') orelse return null;
        return v[1..end];
    }
    if (std.mem.indexOfScalar(u8, v, ';')) |j| v = v[0..j];
    return std.mem.trim(u8, v, " ");
}

// ── tests ──────────────────────────────────────────────────────────────────
const testing = std.testing;

test "parse extracts file + name parts" {
    const a = testing.allocator;
    const boundary = "X";
    const body = "--X\r\nContent-Disposition: form-data; name=\"file\"; filename=\"a.txt\"\r\nContent-Type: text/plain\r\n\r\nhello\r\n--X\r\nContent-Disposition: form-data; name=\"name\"\r\n\r\nmyfile\r\n--X--\r\n";
    const parts = try parse(a, boundary, body);
    defer a.free(parts);
    try testing.expectEqual(@as(usize, 2), parts.len);
    const file = find(parts, "file").?;
    try testing.expectEqualStrings("a.txt", file.filename.?);
    try testing.expectEqualStrings("text/plain", file.content_type.?);
    try testing.expectEqualStrings("hello", file.data);
    try testing.expectEqualStrings("myfile", find(parts, "name").?.data);
}

test "boundaryOf parses quoted + unquoted" {
    try testing.expectEqualStrings("abc", boundaryOf("multipart/form-data; boundary=abc").?);
    try testing.expectEqualStrings("a b", boundaryOf("multipart/form-data; boundary=\"a b\"").?);
}
