package com.plm.admin.config;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Publishes config change notifications to NATS so psm-data instances
 * can refresh their config cache by pulling a fresh snapshot.
 *
 * Replaces the previous HTTP push approach (DataInstanceRegistry + REST POST).
 * Subject: env.service.psa.CONFIG_CHANGED
 */
@Slf4j
@Component
public class ConfigPushService {

    private final PlmMessageBus messageBus;
    private final ConfigSnapshotBuilder snapshotBuilder;

    public ConfigPushService(PlmMessageBus messageBus, ConfigSnapshotBuilder snapshotBuilder) {
        this.messageBus = messageBus;
        this.snapshotBuilder = snapshotBuilder;
    }

    @EventListener
    public void onConfigChanged(ConfigChangedEvent event) {
        try {
            messageBus.sendInternal("psa", "CONFIG_CHANGED", event);
            log.debug("Published CONFIG_CHANGED to NATS: {}", event);
        } catch (Exception e) {
            log.warn("Failed to publish CONFIG_CHANGED to NATS: {}", e.getMessage());
        }
    }

    /**
     * Boot: build the initial snapshot eagerly once psm-admin is fully up. The
     * build's emit-on-bump publishes psa CONFIG_CHANGED through {@link #onConfigChanged}
     * (single notify path), so a consumer that started before us — and stayed
     * UNCONFIGURED after its best-effort pull — is told to refresh now.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void announceReady() {
        log.info("psm-admin ready — building initial config snapshot + announcing");
        snapshotBuilder.buildFullSnapshot();
    }
}
