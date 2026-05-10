package com.dst.domain;

import com.dst.domain.storage.BinaryStorage;
import com.plm.platform.authz.PlmPermission;
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
 * <p>Every stored object is scoped to a {@code projectSpaceId}. Non-admin callers
 * can only access objects owned by their active project space.
 *
 * <p>Deduplication: if the SHA-256 already exists in the same project space the
 * just-written file is discarded, the existing row's ref_count is incremented,
 * and the upload result carries {@code duplicate=true}.
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

    @PlmPermission("WRITE_DATA")
    @Transactional
    public DataUploadResult upload(String userId, String projectSpaceId,
                                   String originalName, String contentType, InputStream in) {
        String id = UUID.randomUUID().toString();
        BinaryStorage.StoreResult res = storage.store(id, in);

        Record existing = dsl.fetchOne(
            "SELECT * FROM data_object WHERE sha256 = ? AND project_space_id = ?",
            res.sha256Hex(), projectSpaceId);

        if (existing != null) {
            storage.delete(res.location());
            String existingId = existing.get("id", String.class);
            dsl.execute("UPDATE data_object SET ref_count = ref_count + 1 WHERE id = ?", existingId);
            DataMetadata m = loadOrThrow(existingId, projectSpaceId);
            log.info("DATA upload-dup id={} sha256={} ref_count={} by={} ps={}",
                m.id(), m.sha256(), m.refCount(), userId, projectSpaceId);
            return new DataUploadResult(m, true);
        }

        LocalDateTime now = LocalDateTime.now();
        dsl.execute("""
            INSERT INTO data_object
              (id, sha256, size_bytes, content_type, original_name, location,
               created_by, created_at, project_space_id, ref_count)
            VALUES (?,?,?,?,?,?,?,?,?,?)
            """,
            id, res.sha256Hex(), res.sizeBytes(), contentType, originalName,
            res.location(), userId, now, projectSpaceId, 1);
        log.info("DATA upload id={} sha256={} size={} contentType={} by={} ps={}",
            id, res.sha256Hex(), res.sizeBytes(), contentType, userId, projectSpaceId);
        return new DataUploadResult(
            new DataMetadata(id, res.sha256Hex(), res.sizeBytes(), contentType, originalName,
                res.location(), userId, now, null, projectSpaceId, 1),
            false);
    }

    @PlmPermission("WRITE_DATA")
    @Transactional
    public DataMetadata reference(String id, String userId, String projectSpaceId) {
        loadOrThrow(id, projectSpaceId);
        dsl.execute("UPDATE data_object SET ref_count = ref_count + 1 WHERE id = ?", id);
        DataMetadata m = loadOrThrow(id, projectSpaceId);
        log.info("DATA ref id={} ref_count={} by={} ps={}", id, m.refCount(), userId, projectSpaceId);
        return m;
    }

    @PlmPermission("WRITE_DATA")
    @Transactional
    public void unreference(String id, String userId, String projectSpaceId) {
        DataMetadata m = loadOrThrow(id, projectSpaceId);
        if (m.refCount() <= 1) {
            dsl.execute("DELETE FROM data_object WHERE id = ?", id);
            storage.delete(m.location());
            log.info("DATA unref-gc id={} sha256={} by={} ps={}", id, m.sha256(), userId, projectSpaceId);
        } else {
            dsl.execute("UPDATE data_object SET ref_count = ref_count - 1 WHERE id = ?", id);
            log.info("DATA unref id={} ref_count={} by={} ps={}", id, m.refCount() - 1, userId, projectSpaceId);
        }
    }

    @PlmPermission("READ_DATA")
    public List<DataMetadata> list(String projectSpaceId, int page, int size) {
        int offset = Math.max(0, page) * Math.max(1, size);
        List<DataMetadata> out = new ArrayList<>();
        for (Record r : dsl.fetch(
                "SELECT * FROM data_object WHERE project_space_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
                projectSpaceId, Math.max(1, size), offset)) {
            out.add(toMetadata(r));
        }
        return out;
    }

    @PlmPermission("READ_DATA")
    public DataMetadata getMetadata(String id, String userId, String projectSpaceId) {
        DataMetadata m = loadOrThrow(id, projectSpaceId);
        log.info("DATA metadata id={} by={} ps={}", id, userId, projectSpaceId);
        return m;
    }

    @PlmPermission("READ_DATA")
    @Transactional
    public DataMetadata download(String id, String userId, String projectSpaceId) {
        DataMetadata m = loadOrThrow(id, projectSpaceId);
        LocalDateTime now = LocalDateTime.now();
        dsl.execute("UPDATE data_object SET last_accessed = ? WHERE id = ?", now, id);
        log.info("DATA download id={} sha256={} size={} by={} ps={}", id, m.sha256(), m.sizeBytes(), userId, projectSpaceId);
        return new DataMetadata(m.id(), m.sha256(), m.sizeBytes(), m.contentType(), m.originalName(),
            m.location(), m.createdBy(), m.createdAt(), now, m.projectSpaceId(), m.refCount());
    }

    public InputStream openStream(String location) {
        return storage.open(location);
    }

    @PlmPermission("MANAGE_DATA")
    @Transactional
    public void delete(String id, String userId, String projectSpaceId) {
        DataMetadata m = loadOrThrow(id, projectSpaceId);
        dsl.execute("DELETE FROM data_object WHERE id = ?", id);
        storage.delete(m.location());
        log.info("DATA delete id={} sha256={} by={} ps={}", id, m.sha256(), userId, projectSpaceId);
    }

    private DataMetadata loadOrThrow(String id, String projectSpaceId) {
        Record r = dsl.fetchOne(
            "SELECT * FROM data_object WHERE id = ? AND project_space_id = ?", id, projectSpaceId);
        if (r == null) throw new IllegalArgumentException("Data not found: " + id);
        return toMetadata(r);
    }

    private static DataMetadata toMetadata(Record r) {
        return new DataMetadata(
            r.get("id", String.class),
            r.get("sha256", String.class),
            r.get("size_bytes", Long.class),
            r.get("content_type", String.class),
            r.get("original_name", String.class),
            r.get("location", String.class),
            r.get("created_by", String.class),
            r.get("created_at", LocalDateTime.class),
            r.get("last_accessed", LocalDateTime.class),
            r.get("project_space_id", String.class),
            r.get("ref_count", Integer.class)
        );
    }
}
