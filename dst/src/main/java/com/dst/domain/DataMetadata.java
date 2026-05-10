package com.dst.domain;

import java.time.LocalDateTime;

/**
 * Metadata returned for a stored data object. The {@code location} field is
 * implementation-detail (filesystem path today, future S3 key) and may be
 * elided from public responses if needed.
 */
public record DataMetadata(
    String id,
    String sha256,
    long sizeBytes,
    String contentType,
    String originalName,
    String location,
    String createdBy,
    LocalDateTime createdAt,
    LocalDateTime lastAccessed,
    String projectSpaceId,
    int refCount
) {}
