package com.plm.admin.config;

import com.plm.platform.nats.NatsListenerFactory;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Subscribes to platform-api CONFIG_CHANGED events (emitted on each service
 * registration / catalog change) and EAGERLY rebuilds the config snapshot.
 *
 * <p>Rebuilding here — rather than lazily on the next consumer GET — is what
 * makes convergence reliable: {@link ConfigSnapshotBuilder#buildFullSnapshot()}
 * bumps the version only when content actually changed and, on bump, emits the
 * psa {@code CONFIG_CHANGED} (via its event → {@link ConfigPushService}). A
 * consumer that subscribed in time is told to re-pull; one that missed it still
 * reads the current version on its boot pull. No blind re-publish, so no notify
 * when nothing changed.
 */
@Slf4j
@Component
public class PlatformConfigRelay {

    private static final String PLATFORM_SUBJECT = "env.service.platform.CONFIG_CHANGED";

    private final NatsListenerFactory natsListenerFactory;
    private final ConfigSnapshotBuilder snapshotBuilder;

    public PlatformConfigRelay(
            org.springframework.beans.factory.ObjectProvider<NatsListenerFactory> natsProvider,
            ConfigSnapshotBuilder snapshotBuilder) {
        this.natsListenerFactory = natsProvider.getIfAvailable();
        this.snapshotBuilder = snapshotBuilder;
    }

    @PostConstruct
    public void subscribe() {
        if (natsListenerFactory == null) {
            log.debug("NATS not available — platform CONFIG_CHANGED relay disabled");
            return;
        }
        natsListenerFactory.subscribe(PLATFORM_SUBJECT, msg -> {
            log.info("Received platform CONFIG_CHANGED — rebuilding config snapshot");
            snapshotBuilder.buildFullSnapshot();
        });
        log.info("Subscribed to NATS subject: {} (eager rebuild on platform change)", PLATFORM_SUBJECT);
    }
}
