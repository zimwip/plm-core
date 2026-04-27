package com.plm.admin.metadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * CRUD for entity_metadata table.
 * Simplified version of psm-api's MetadataService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MetadataService {

    private final DSLContext dsl;

    public Map<String, String> getMetadata(String targetType, String targetId) {
        Map<String, String> result = new LinkedHashMap<>();
        dsl.select(DSL.field("meta_key"), DSL.field("meta_value"))
            .from("entity_metadata")
            .where("target_type = ?", targetType)
            .and("target_id = ?", targetId)
            .fetch()
            .forEach(r -> result.put(
                r.get("meta_key", String.class),
                r.get("meta_value", String.class)));
        return result;
    }

    @Transactional
    public void setAll(String targetType, String targetId, Map<String, String> metadata) {
        for (Map.Entry<String, String> entry : metadata.entrySet()) {
            set(targetType, targetId, entry.getKey(), entry.getValue());
        }
    }

    @Transactional
    public void set(String targetType, String targetId, String key, String value) {
        Record existing = dsl.select(DSL.field("id"))
            .from("entity_metadata")
            .where("target_type = ?", targetType)
            .and("target_id = ?", targetId)
            .and("meta_key = ?", key)
            .fetchOne();

        if (existing != null) {
            dsl.execute(
                "UPDATE entity_metadata SET meta_value = ? WHERE id = ?",
                value, existing.get("id", String.class));
        } else {
            dsl.execute(
                "INSERT INTO entity_metadata (id, target_type, target_id, meta_key, meta_value) VALUES (?,?,?,?,?)",
                UUID.randomUUID().toString(), targetType, targetId, key, value);
        }
    }

    @Transactional
    public void removeAll(String targetType, String targetId) {
        dsl.execute(
            "DELETE FROM entity_metadata WHERE target_type = ? AND target_id = ?",
            targetType, targetId);
    }

    /** Returns distinct meta_key values, optionally filtered by target_type. */
    public List<String> listDistinctKeys(String targetType) {
        String sql = targetType == null || targetType.isBlank()
            ? "SELECT DISTINCT meta_key FROM entity_metadata ORDER BY meta_key"
            : "SELECT DISTINCT meta_key FROM entity_metadata WHERE target_type = ? ORDER BY meta_key";
        return (targetType == null || targetType.isBlank()
            ? dsl.fetch(sql)
            : dsl.fetch(sql, targetType))
            .getValues("meta_key", String.class);
    }
}
