package com.dst.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
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

    public void itemCreated(String id, String userId, String projectSpaceId) {
        enqueue("global.ITEM_CREATED", Map.of(
            "event",          "ITEM_CREATED",
            "source",         "dst",
            "typeCode",       "data-object",
            "itemId",         id,
            "userId",         userId,
            "projectSpaceId", projectSpaceId != null ? projectSpaceId : "",
            "at",             LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEM_CREATED → id={}", id);
    }

    public void itemDeleted(String id, String userId) {
        enqueue("global.ITEM_DELETED", Map.of(
            "event",  "ITEM_DELETED",
            "nodeId", id,
            "byUser", userId,
            "at",     LocalDateTime.now().toString()
        ));
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
