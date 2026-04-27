package com.pno.infrastructure.event;

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
 * Polls {@code event_outbox} and delivers pending events via NATS, then deletes
 * them. Ports the psm-api implementation. Runs every 200 ms; events are deleted
 * only after the publish succeeds, giving at-least-once delivery.
 *
 * <p>Uses {@code FOR UPDATE SKIP LOCKED} so multiple pno-api replicas (if any)
 * never double-deliver the same event.
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "plm.nats", name = "enabled", havingValue = "true")
public class OutboxPoller {

    private final DSLContext dsl;
    private final PlmMessageBus messageBus;
    private DSLContext quietDsl;

    public OutboxPoller(DSLContext dsl, PlmMessageBus messageBus) {
        this.dsl = dsl;
        this.messageBus = messageBus;
    }

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
            }
        }

        log.debug("OutboxPoller delivered {} event(s)", pending.size());
    }
}
