package com.plm.shared.metadata;

import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Generic key/value metadata attached to any entity via target_type + target_id.
 *
 * Maintains an in-memory cache loaded at startup. Cache is invalidated
 * via {@link #evictCache()} on any mutation.
 */
@Slf4j
@Service
public class MetadataService {

    private final DSLContext dsl;

    /** (target_type, target_id) → { key → value } */
    private Map<TargetKey, Map<String, String>> cache = Map.of();
    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public MetadataService(DSLContext dsl) {
        this.dsl = dsl;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadCache() {
        rebuildCache();
    }

    // ================================================================
    // Read API (cached)
    // ================================================================

    /** Returns all metadata for a given target, or empty map. */
    public Map<String, String> getMetadata(String targetType, String targetId) {
        cacheLock.readLock().lock();
        try {
            return cache.getOrDefault(new TargetKey(targetType, targetId), Map.of());
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    /** Returns a single metadata value, or null. */
    public String getValue(String targetType, String targetId, String metaKey) {
        return getMetadata(targetType, targetId).get(metaKey);
    }

    /** Returns true if the metadata key exists and equals "true". */
    public boolean isTrue(String targetType, String targetId, String metaKey) {
        return "true".equals(getValue(targetType, targetId, metaKey));
    }

    // ================================================================
    // Write API
    // ================================================================

    public void setValue(String targetType, String targetId, String metaKey, String metaValue) {
        dsl.execute(
            "DELETE FROM entity_metadata WHERE target_type = ? AND target_id = ? AND meta_key = ?",
            targetType, targetId, metaKey);
        if (metaValue != null) {
            dsl.execute(
                "INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES (?,?,?,?,?)",
                UUID.randomUUID().toString(), targetType, targetId, metaKey, metaValue);
        }
        evictCache();
    }

    public void removeValue(String targetType, String targetId, String metaKey) {
        dsl.execute(
            "DELETE FROM entity_metadata WHERE target_type = ? AND target_id = ? AND meta_key = ?",
            targetType, targetId, metaKey);
        evictCache();
    }

    /** Removes all metadata for a given target. */
    public void removeAll(String targetType, String targetId) {
        dsl.execute(
            "DELETE FROM entity_metadata WHERE target_type = ? AND target_id = ?",
            targetType, targetId);
        evictCache();
    }

    /**
     * Bulk-set metadata for a target. Replaces all existing metadata with the given map.
     */
    public void setAll(String targetType, String targetId, Map<String, String> metadata) {
        dsl.execute(
            "DELETE FROM entity_metadata WHERE target_type = ? AND target_id = ?",
            targetType, targetId);
        for (var entry : metadata.entrySet()) {
            if (entry.getValue() != null) {
                dsl.execute(
                    "INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES (?,?,?,?,?)",
                    UUID.randomUUID().toString(), targetType, targetId, entry.getKey(), entry.getValue());
            }
        }
        evictCache();
    }

    public void evictCache() {
        rebuildCache();
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<TargetKey, Map<String, String>> newCache = new HashMap<>();

        List<Record> rows = dsl.fetch(
            "SELECT target_type, target_id, meta_key, meta_value FROM entity_metadata");

        for (Record row : rows) {
            TargetKey key = new TargetKey(
                row.get("target_type", String.class),
                row.get("target_id", String.class));
            newCache.computeIfAbsent(key, k -> new HashMap<>())
                .put(row.get("meta_key", String.class), row.get("meta_value", String.class));
        }

        // Make inner maps immutable
        Map<TargetKey, Map<String, String>> immutable = new HashMap<>();
        newCache.forEach((k, v) -> immutable.put(k, Map.copyOf(v)));

        cacheLock.writeLock().lock();
        try {
            cache = Map.copyOf(immutable);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Metadata cache loaded: {} targets, {} entries",
            immutable.size(), rows.size());
    }

    record TargetKey(String targetType, String targetId) {}
}
