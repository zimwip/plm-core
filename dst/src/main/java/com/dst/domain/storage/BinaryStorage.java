package com.dst.domain.storage;

import java.io.InputStream;
import java.time.Duration;

/**
 * Pluggable binary storage. Backed by an S3-compatible object store
 * ({@link S3BinaryStorage} → Garage).
 */
public interface BinaryStorage {

    /**
     * Persist the input stream and return the storage-specific location string
     * (the S3 object key). Caller supplies the id used to derive the location
     * and the content length (S3 needs it up front).
     */
    StoreResult store(String id, InputStream in, long contentLength, String contentType);

    /** Remove the stored bytes. */
    void delete(String location);

    /**
     * Build a time-limited presigned GET URL the browser can hit directly.
     * The URL forces an {@code attachment} download with the given filename.
     */
    String presignedGetUrl(String location, String filename, Duration ttl);

    record StoreResult(String location, long sizeBytes, String sha256Hex) {}
}
