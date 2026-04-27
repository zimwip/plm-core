package com.spe.status;

import com.plm.platform.nats.PlmMessageBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;

/**
 * Publishes an SPE_RESTARTED event on NATS when the gateway starts.
 *
 * Services listening on env.service.spe-api.SPE_RESTARTED will
 * re-register themselves immediately instead of waiting for the
 * next periodic re-registration cycle.
 */
@Component
public class SpeStartupNotifier {

    private static final Logger log = LoggerFactory.getLogger(SpeStartupNotifier.class);

    private final PlmMessageBus messageBus;

    public SpeStartupNotifier(@Autowired(required = false) PlmMessageBus messageBus) {
        this.messageBus = messageBus;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        if (messageBus == null) {
            log.warn("NATS not available — SPE_RESTARTED event not published");
            return;
        }
        try {
            messageBus.sendInternal("spe-api", "SPE_RESTARTED", Map.of(
                    "event", "SPE_RESTARTED",
                    "at", Instant.now().toString()
            ));
            log.info("SPE_RESTARTED event published on NATS");
        } catch (Exception e) {
            log.warn("Failed to publish SPE_RESTARTED: {}", e.getMessage());
        }
    }
}
