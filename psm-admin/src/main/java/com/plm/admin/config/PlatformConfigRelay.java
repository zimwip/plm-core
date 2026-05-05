package com.plm.admin.config;

import com.plm.platform.nats.NatsListenerFactory;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Component;

/**
 * Subscribes to platform-api CONFIG_CHANGED events and republishes them
 * as psa CONFIG_CHANGED so psm-api cache refreshes when platform actions change.
 */
@Slf4j
@Component
public class PlatformConfigRelay {

    private static final String PLATFORM_SUBJECT = "env.service.platform.CONFIG_CHANGED";

    private final NatsListenerFactory natsListenerFactory;
    private final ApplicationEventPublisher eventPublisher;

    public PlatformConfigRelay(
            org.springframework.beans.factory.ObjectProvider<NatsListenerFactory> natsProvider,
            ApplicationEventPublisher eventPublisher) {
        this.natsListenerFactory = natsProvider.getIfAvailable();
        this.eventPublisher = eventPublisher;
    }

    @PostConstruct
    public void subscribe() {
        if (natsListenerFactory == null) {
            log.debug("NATS not available — platform CONFIG_CHANGED relay disabled");
            return;
        }
        natsListenerFactory.subscribe(PLATFORM_SUBJECT, msg -> {
            log.info("Received platform CONFIG_CHANGED — relaying as psa CONFIG_CHANGED");
            eventPublisher.publishEvent(new ConfigChangedEvent("RELAY", "PLATFORM_CONFIG", "platform"));
        });
        log.info("Subscribed to NATS subject: {} (relay to psa)", PLATFORM_SUBJECT);
    }
}
