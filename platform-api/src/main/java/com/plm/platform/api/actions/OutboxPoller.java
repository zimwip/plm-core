package com.plm.platform.api.actions;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Polls event_outbox and publishes any pending CONFIG_CHANGED events to NATS.
 * Backstop for cases where the direct NATS publish in ConfigChangedPublisher
 * failed (e.g. NATS temporarily unavailable). Deletes each row after
 * successful publish to ensure at-least-once delivery.
 */
@Slf4j
@Component
public class OutboxPoller {

    private final DSLContext dsl;
    private final ObjectProvider<PlmMessageBus> messageBusProvider;

    OutboxPoller(DSLContext dsl, ObjectProvider<PlmMessageBus> messageBusProvider) {
        this.dsl = dsl;
        this.messageBusProvider = messageBusProvider;
    }

    @Scheduled(fixedDelay = 5_000, initialDelay = 10_000)
    @Transactional
    public void poll() {
        PlmMessageBus bus = messageBusProvider.getIfAvailable();
        if (bus == null) return;

        List<Record> rows = dsl.fetch(
            "SELECT id, destination, payload FROM event_outbox ORDER BY created_at LIMIT 50");
        if (rows.isEmpty()) return;

        int published = 0;
        for (Record row : rows) {
            String id          = row.get("id", String.class);
            String destination = row.get("destination", String.class);
            String payload     = row.get("payload", String.class);
            try {
                bus.publishRaw(destination, payload);
                dsl.execute("DELETE FROM event_outbox WHERE id = ?", id);
                published++;
            } catch (Exception e) {
                log.warn("Outbox publish failed for {} — will retry: {}", id, e.getMessage());
            }
        }
        if (published > 0) {
            log.debug("Outbox: published {} pending event(s)", published);
        }
    }
}
