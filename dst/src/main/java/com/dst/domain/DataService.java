package com.dst.domain;

import com.dst.domain.storage.BinaryStorage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * CRUD around stored binary data. SHA-256 is computed during the upload stream
 * (no second pass over the bytes) and persisted alongside the row metadata.
 *
 * <p>Every action is logged at INFO so the standard application log gives an
 * append-only audit trail without a separate audit table.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DataService {

    private final DSLContext dsl;
    private final BinaryStorage storage;

    @Transactional
    public DataMetadata upload(String userId, String originalName, String contentType, InputStream in) {
        String id = UUID.randomUUID().toString();
        BinaryStorage.StoreResult res = storage.store(id, in);
        LocalDateTime now = LocalDateTime.now();
        dsl.execute("""
            INSERT INTO data_object
              (id, sha256, size_bytes, content_type, original_name, location, created_by, created_at)
            VALUES (?,?,?,?,?,?,?,?)
            """,
            id, res.sha256Hex(), res.sizeBytes(), contentType, originalName, res.location(), userId, now);
        log.info("DATA upload id={} sha256={} size={} contentType={} by={}",
            id, res.sha256Hex(), res.sizeBytes(), contentType, userId);
        return new DataMetadata(id, res.sha256Hex(), res.sizeBytes(), contentType, originalName,
            res.location(), userId, now, null);
    }

    /**
     * Page through stored data objects, most recent first. Listing is unfiltered
     * within READ_DATA scope — the frontend navigation tree pages through it via
     * the federated browse catalog ({@code /api/platform/browse}).
     */
    public List<DataMetadata> list(int page, int size) {
        int offset = Math.max(0, page) * Math.max(1, size);
        List<DataMetadata> out = new ArrayList<>();
        for (Record r : dsl.fetch(
                "SELECT * FROM data_object ORDER BY created_at DESC LIMIT ? OFFSET ?",
                Math.max(1, size), offset)) {
            out.add(new DataMetadata(
                r.get("id", String.class),
                r.get("sha256", String.class),
                r.get("size_bytes", Long.class),
                r.get("content_type", String.class),
                r.get("original_name", String.class),
                r.get("location", String.class),
                r.get("created_by", String.class),
                r.get("created_at", LocalDateTime.class),
                r.get("last_accessed", LocalDateTime.class)
            ));
        }
        return out;
    }

    public DataMetadata getMetadata(String id, String userId) {
        DataMetadata m = loadOrThrow(id);
        log.info("DATA metadata id={} by={}", id, userId);
        return m;
    }

    @Transactional
    public DataMetadata download(String id, String userId) {
        DataMetadata m = loadOrThrow(id);
        LocalDateTime now = LocalDateTime.now();
        dsl.execute("UPDATE data_object SET last_accessed = ? WHERE id = ?", now, id);
        log.info("DATA download id={} sha256={} size={} by={}", id, m.sha256(), m.sizeBytes(), userId);
        return new DataMetadata(m.id(), m.sha256(), m.sizeBytes(), m.contentType(), m.originalName(),
            m.location(), m.createdBy(), m.createdAt(), now);
    }

    public InputStream openStream(String location) {
        return storage.open(location);
    }

    @Transactional
    public void delete(String id, String userId) {
        DataMetadata m = loadOrThrow(id);
        dsl.execute("DELETE FROM data_object WHERE id = ?", id);
        storage.delete(m.location());
        log.info("DATA delete id={} sha256={} by={}", id, m.sha256(), userId);
    }

    private DataMetadata loadOrThrow(String id) {
        Record r = dsl.fetchOne("SELECT * FROM data_object WHERE id = ?", id);
        if (r == null) throw new IllegalArgumentException("Data not found: " + id);
        return new DataMetadata(
            r.get("id", String.class),
            r.get("sha256", String.class),
            r.get("size_bytes", Long.class),
            r.get("content_type", String.class),
            r.get("original_name", String.class),
            r.get("location", String.class),
            r.get("created_by", String.class),
            r.get("created_at", LocalDateTime.class),
            r.get("last_accessed", LocalDateTime.class)
        );
    }
}
