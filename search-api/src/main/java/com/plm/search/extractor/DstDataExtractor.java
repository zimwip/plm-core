package com.plm.search.extractor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.search.model.DynamicField;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Extracts dst data-object (uploaded file) data from standard ITEM_CREATED/ITEM_DELETED events.
 *
 * Expects {@code event.payload} to contain the payload built by
 * {@code DstEventPublisher.buildPayload(...)} in dst:
 *   type, projectSpaceId, fields[] (originalName, contentType, sizeBytes, createdBy, sha256)
 */
@Component
@RequiredArgsConstructor
public class DstDataExtractor implements ItemEventExtractor {

    private final ObjectMapper objectMapper;

    @Override
    public String sourceCode() { return "dst"; }

    @Override
    @SuppressWarnings("unchecked")
    public Optional<IndexEntry> extractUpsert(Map<String, Object> event) {
        Object payloadRaw = event.get("payload");
        if (!(payloadRaw instanceof Map<?, ?> rawMap)) return Optional.empty();
        Map<String, Object> payload = (Map<String, Object>) rawMap;

        String id = (String) event.getOrDefault("itemId", event.get("nodeId"));
        if (id == null || id.isBlank()) return Optional.empty();

        String serviceCode    = (String) event.getOrDefault("source", "dst");
        String itemCode       = (String) payload.getOrDefault("typeCode",
                                    event.getOrDefault("typeCode", "data-object"));
        String type           = (String) payload.getOrDefault("type",
                                    event.getOrDefault("typeCode", "data-object"));
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

        // Flatten attribute values so the frontend can display them without extra fetches
        for (Map<String, Object> fm : rawFields) {
            String fname = (String) fm.get("name");
            if (fname == null || fname.isBlank()) continue;
            @SuppressWarnings("unchecked")
            List<Object> vals = fm.get("values") instanceof List<?> vl ? (List<Object>) vl : List.of();
            if (!vals.isEmpty()) src.put(fname, vals.size() == 1 ? vals.get(0) : vals);
        }

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
