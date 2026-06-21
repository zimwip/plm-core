package com.dst.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.event.PlmEventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Writes PLM events into {@code event_outbox} within the caller's DB transaction.
 * {@link DstOutboxPoller} delivers them to NATS after commit.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DstEventPublisher {

    private final DSLContext dsl;
    private final ObjectMapper objectMapper;

    public void itemCreated(String id, String userId, String projectSpaceId,
                            String originalName, String contentType,
                            long sizeBytes, String sha256) {
        enqueue("global.ITEM_CREATED", PlmEventEnvelope.of("ITEM_CREATED")
            .source("dst")
            .typeCode("data-object")
            .itemId(id)
            .userId(userId)
            .projectSpaceId(projectSpaceId)
            .payload(buildPayload(projectSpaceId, originalName, contentType, sizeBytes, sha256, userId))
            .build());
        log.debug("Event enqueued: ITEM_CREATED → id={}", id);
    }

    /** Search index payload — mirrors the {@code payload.fields[]} shape consumed by search-api extractors. */
    private Map<String, Object> buildPayload(String projectSpaceId, String originalName,
                                             String contentType, long sizeBytes,
                                             String sha256, String createdBy) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("typeCode", "data-object");
        payload.put("type", "data-object");
        payload.put("projectSpaceId", projectSpaceId != null ? projectSpaceId : "");
        payload.put("fields", List.of(
            field("originalName", "string", originalName),
            field("contentType",  "enum",   contentType),
            field("sizeBytes",    "number", sizeBytes),
            field("createdBy",    "string", createdBy),
            field("sha256",       "string", sha256)
        ));
        return payload;
    }

    private Map<String, Object> field(String name, String valueType, Object value) {
        Map<String, Object> f = new LinkedHashMap<>();
        f.put("name", name);
        f.put("valueType", valueType);
        f.put("values", value != null ? List.of(value) : List.of());
        return f;
    }

    public void itemDeleted(String id, String byUser) {
        enqueue("global.ITEM_DELETED", PlmEventEnvelope.of("ITEM_DELETED")
            .source("dst")
            .itemId(id)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: ITEM_DELETED → id={}", id);
    }

    @SuppressWarnings("unchecked")
    private void enqueue(String destination, Object payload) {
        try {
            String id = UUID.randomUUID().toString();
            var envelope = payload instanceof Map
                ? new LinkedHashMap<>((Map<String, Object>) payload)
                : new LinkedHashMap<>(Map.of("payload", payload));
            envelope.put("id", id);
            String json = objectMapper.writeValueAsString(envelope);
            dsl.execute(
                "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES (?,?,?,?)",
                id, destination, json, LocalDateTime.now()
            );
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox payload destination={} error={}", destination, e.getMessage(), e);
        }
    }
}
