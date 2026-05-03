package com.plm.platform.api.actions;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Publishes platform CONFIG_CHANGED to NATS.
 *
 * Two listeners on the same event:
 * - BEFORE_COMMIT: writes to event_outbox within the active transaction →
 *   outbox row is atomically committed with the config change, so OutboxPoller
 *   can replay it if the NATS publish below fails.
 * - Regular @EventListener: best-effort direct NATS publish for low latency.
 *
 * Subject: env.service.platform.CONFIG_CHANGED
 */
@Slf4j
@Component
class ConfigChangedPublisher {

    private static final String SUBJECT = "env.service.platform.CONFIG_CHANGED";

    private final DSLContext dsl;
    private final ObjectProvider<PlmMessageBus> messageBusProvider;

    ConfigChangedPublisher(DSLContext dsl, ObjectProvider<PlmMessageBus> messageBusProvider) {
        this.dsl = dsl;
        this.messageBusProvider = messageBusProvider;
    }

    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void writeOutbox(ConfigChangedEvent event) {
        String payload = event.entityType() + ":" + event.entityId();
        dsl.execute(
            "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES (?,?,?,?)",
            UUID.randomUUID().toString(), SUBJECT, payload, LocalDateTime.now());
    }

    @EventListener
    public void publishToNats(ConfigChangedEvent event) {
        PlmMessageBus bus = messageBusProvider.getIfAvailable();
        if (bus == null) return;
        try {
            bus.sendInternal("platform", "CONFIG_CHANGED", event);
            log.debug("Published CONFIG_CHANGED to NATS: {}", event);
        } catch (Exception e) {
            log.warn("Direct NATS publish failed, OutboxPoller will retry: {}", e.getMessage());
        }
    }
}
