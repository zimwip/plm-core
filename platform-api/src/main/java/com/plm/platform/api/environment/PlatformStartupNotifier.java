package com.plm.platform.api.environment;

import com.plm.platform.nats.PlmMessageBus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Publishes {@code env.global.PLATFORM_RESTARTED} on NATS when platform-api
 * comes up. Services listen and re-register immediately rather than waiting
 * for their periodic re-registration cycle.
 *
 * <p>Replaces the former {@code env.service.spe-api.SPE_RESTARTED} signal.
 */
@Slf4j
@Component
public class PlatformStartupNotifier {

    private final PlmMessageBus messageBus;

    public PlatformStartupNotifier(@Autowired(required = false) PlmMessageBus messageBus) {
        this.messageBus = messageBus;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        if (messageBus == null) {
            log.warn("NATS not available — PLATFORM_RESTARTED event not published");
            return;
        }
        try {
            messageBus.sendGlobal("PLATFORM_RESTARTED", Map.of(
                "startedAt", Instant.now().toString()
            ));
            log.info("PLATFORM_RESTARTED event published on NATS");
        } catch (Exception e) {
            log.warn("Failed to publish PLATFORM_RESTARTED: {}", e.getMessage());
        }
    }
}
