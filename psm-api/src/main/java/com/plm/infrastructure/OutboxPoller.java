package com.plm.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls event_outbox and delivers pending events via WebSocket, then deletes them.
 *
 * Runs every 200 ms. Each poll is its own DB transaction: events are deleted only
 * after the WebSocket send succeeds, guaranteeing at-least-once delivery.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OutboxPoller {

    private final DSLContext dsl;
    private final SimpMessagingTemplate messaging;

    @Scheduled(fixedDelay = 200)
    @Transactional
    public void poll() {
        List<Record> pending = dsl.fetch(
            "SELECT id, destination, payload FROM event_outbox ORDER BY created_at LIMIT 50"
        );

        if (pending.isEmpty()) return;

        for (Record r : pending) {
            String id          = r.get("id",          String.class);
            String destination = r.get("destination", String.class);
            String payload     = r.get("payload",     String.class);
            try {
                messaging.convertAndSend(destination, payload);
                dsl.execute("DELETE FROM event_outbox WHERE id = ?", id);
            } catch (Exception e) {
                log.warn("Failed to deliver outbox event id={} destination={}: {}", id, destination, e.getMessage());
                // Leave the row; it will be retried on the next poll cycle.
            }
        }

        log.debug("OutboxPoller delivered {} event(s)", pending.size());
    }
}
