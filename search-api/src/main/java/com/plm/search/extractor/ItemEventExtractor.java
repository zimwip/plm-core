package com.plm.search.extractor;

import com.plm.search.model.DynamicField;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Extracts search index entries from standard PLM item events (global.ITEM_CREATED,
 * global.ITEM_UPDATED, global.ITEM_DELETED). One implementation per source service.
 *
 * Register as a Spring bean — NatsEventConsumer auto-discovers all implementations.
 */
public interface ItemEventExtractor {

    /** Source service code this extractor handles (e.g. "psm", "dst"). */
    String sourceCode();

    /**
     * Extract an index entry from an ITEM_CREATED or ITEM_UPDATED event.
     * Returns empty if the event lacks a payload or required fields.
     */
    Optional<IndexEntry> extractUpsert(Map<String, Object> event);

    /**
     * Extract the item ID to delete from an ITEM_DELETED event.
     * Returns empty if the ID cannot be determined.
     */
    Optional<String> extractDelete(Map<String, Object> event);

    record IndexEntry(String id, String serviceCode, String itemCode,
                      String type, String projectSpaceId,
                      String sourceJson, List<DynamicField> fields) {}
}
