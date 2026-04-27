package com.plm.admin.config;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
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

    public ConfigPushService(PlmMessageBus messageBus) {
        this.messageBus = messageBus;
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
}
