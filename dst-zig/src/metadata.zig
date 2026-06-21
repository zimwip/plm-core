const std = @import("std");

/// Metadata for a stored data object. Field names are camelCase to match the
/// Java `DataMetadata` record's Jackson JSON output. Strings are owned by the
/// allocator that built the value (typically the request arena).
pub const DataMetadata = struct {
    id: []const u8,
    sha256: []const u8,
    sizeBytes: i64,
    contentType: ?[]const u8,
    originalName: ?[]const u8,
    location: []const u8,
    createdBy: []const u8,
    createdAt: ?[]const u8,
    lastAccessed: ?[]const u8,
    projectSpaceId: ?[]const u8,
    refCount: i32,
};

/// Upload result — mirrors Java `DataUploadResult(metadata, duplicate)`.
pub const UploadResult = struct {
    metadata: DataMetadata,
    duplicate: bool,
};

// Field names match Java PresignedUrl(url, expiresInSeconds, size) — the
// frontend stepWorker reads `url` + `size` for the chunked Range download.
pub const PresignedUrl = struct {
    url: []const u8,
    expiresInSeconds: i64,
    size: i64,
};
