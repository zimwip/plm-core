package com.dst.domain.storage;

import java.io.InputStream;

/**
 * Pluggable binary storage. Today: {@link LocalFileStorage} on a mounted volume.
 * Tomorrow: drop-in S3 implementation behind the same contract.
 */
public interface BinaryStorage {

    /**
     * Persist the input stream and return the storage-specific location string
     * (filesystem path, S3 key, ...). Caller supplies the id used to derive the
     * location.
     */
    StoreResult store(String id, InputStream in);

    /** Open the stored bytes for reading. */
    InputStream open(String location);

    /** Remove the stored bytes. */
    void delete(String location);

    record StoreResult(String location, long sizeBytes, String sha256Hex) {}
}
