package com.plm.search.extractor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.search.model.DynamicField;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Extracts PSM node data from standard ITEM_CREATED/ITEM_UPDATED events.
 *
 * Expects {@code event.payload} to contain the node payload built by
 * {@code SearchEventPublisher.buildNodePayload(nodeId)} in psm-api:
 *   type, projectSpaceId, logicalId, revision, iteration, fields[]
 */
@Component
@RequiredArgsConstructor
public class PsmNodeExtractor implements ItemEventExtractor {

    private final ObjectMapper objectMapper;

    @Override
    public String sourceCode() { return "psm"; }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<IndexEntry> extractUpsert(Map<String, Object> event) {
        Object payloadRaw = event.get("payload");
        if (!(payloadRaw instanceof Map<?, ?> rawMap)) return Optional.empty();
        Map<String, Object> payload = (Map<String, Object>) rawMap;

        String id = (String) event.getOrDefault("itemId", event.get("nodeId"));
        if (id == null || id.isBlank()) return Optional.empty();

        String serviceCode    = (String) event.getOrDefault("source", "psm");
        String itemCode       = (String) payload.getOrDefault("typeCode",
                                    event.getOrDefault("typeCode", ""));
        String type           = (String) payload.getOrDefault("type",
                                    event.getOrDefault("typeCode", ""));
        String projectSpaceId = (String) payload.getOrDefault("projectSpaceId",
                                    event.getOrDefault("projectSpaceId", ""));

        List<Map<String, Object>> rawFields = payload.get("fields") instanceof List<?> list
            ? (List<Map<String, Object>>) list : List.of();

        List<DynamicField> fields = rawFields.stream()
            .filter(fm -> fm.get("name") != null)
            .map(fm -> new DynamicField(
                (String) fm.get("name"),
                (String) fm.getOrDefault("valueType", "string"),
                fm.get("values") instanceof List<?> vl ? (List<Object>) vl : List.of()
            ))
            .toList();

        Map<String, Object> src = new LinkedHashMap<>();
        src.put("id",             id);
        src.put("type",           type);
        src.put("projectSpaceId", projectSpaceId);
        src.put("logicalId",      payload.getOrDefault("logicalId",  ""));
        src.put("revision",       payload.getOrDefault("revision",   ""));
        src.put("iteration",      payload.getOrDefault("iteration",  0));

        String sourceJson;
        try {
            sourceJson = objectMapper.writeValueAsString(src);
        } catch (Exception e) {
            sourceJson = "{}";
        }

        return Optional.of(new IndexEntry(id, serviceCode, itemCode, type, projectSpaceId, sourceJson, fields));
    }

    @Override
    public Optional<String> extractDelete(Map<String, Object> event) {
        String id = (String) event.getOrDefault("itemId", event.get("nodeId"));
        return Optional.ofNullable(id).filter(s -> !s.isBlank());
    }
}
