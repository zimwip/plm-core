package com.pno.infrastructure.event;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Writes a row into {@code event_outbox} inside the caller's DB transaction.
 * {@link OutboxPoller} picks it up after commit and publishes to NATS before
 * deletion. Use this for any pno event that must be atomic with a DB mutation
 * (grant CRUD, scope registry change). For fire-and-forget broadcasts that
 * don't need transactional guarantees, use {@code PlmMessageBus} directly.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxEventPublisher {

    private final DSLContext dsl;
    private final ObjectMapper objectMapper;

    public void enqueue(String destination, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            dsl.execute(
                "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), destination, json, LocalDateTime.now()
            );
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize outbox payload for destination={} error={}", destination, e.getMessage(), e);
        }
    }
}
