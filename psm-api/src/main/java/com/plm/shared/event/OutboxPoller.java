package com.plm.shared.event;

import com.plm.platform.nats.PlmMessageBus;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls event_outbox and delivers pending events via NATS, then deletes them.
 *
 * Runs every 200 ms. Each poll is its own DB transaction: events are deleted only
 * after the NATS publish succeeds, guaranteeing at-least-once delivery.
 *
 * Uses FOR UPDATE SKIP LOCKED for multi-instance safety — two psm-api replicas
 * polling the same DB won't double-deliver the same event.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
public class OutboxPoller {

    private final DSLContext dsl;
    private final PlmMessageBus messageBus;

    public OutboxPoller(DSLContext dsl, PlmMessageBus messageBus) {
        this.dsl = dsl;
        this.messageBus = messageBus;
    }

    // Derived DSL without execute listeners — avoids flooding logs with the
    // high-frequency outbox SELECT (5/s at 200 ms interval).
    private DSLContext quietDsl;

    @PostConstruct
    void init() {
        org.jooq.Configuration cfg = dsl.configuration();
        quietDsl = DSL.using(
            cfg.connectionProvider(),
            cfg.dialect(),
            new org.jooq.conf.Settings().withExecuteLogging(false)
        );
    }

    @Scheduled(fixedDelayString = "${plm.outbox.poll-interval-ms:200}")
    @Transactional
    public void poll() {
        List<Record> pending = quietDsl.fetch(
            "SELECT id, destination, payload FROM event_outbox ORDER BY created_at LIMIT 50 FOR UPDATE SKIP LOCKED"
        );

        if (pending.isEmpty()) return;

        for (Record r : pending) {
            String id          = r.get("id",          String.class);
            String destination = r.get("destination", String.class);
            String payload     = r.get("payload",     String.class);
            try {
                messageBus.publishRaw(destination, payload);
                quietDsl.execute("DELETE FROM event_outbox WHERE id = ?", id);
            } catch (Exception e) {
                log.warn("Failed to deliver outbox event id={} destination={}: {}", id, destination, e.getMessage());
                // Leave the row; it will be retried on the next poll cycle.
            }
        }

        log.debug("OutboxPoller delivered {} event(s)", pending.size());
    }
}
