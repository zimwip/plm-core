package com.spe.gateway;

import com.plm.platform.environment.EnvironmentSnapshotRefreshedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Triggers a Spring Cloud Gateway route refresh after
 * {@link com.plm.platform.environment.EnvironmentSubscriber} has updated
 * the local registry snapshot. Listening to the in-process
 * {@link EnvironmentSnapshotRefreshedEvent} (rather than the NATS subject
 * directly) avoids a race: the registry is guaranteed to be up to date
 * before routes rebuild.
 */
@Slf4j
@Component
public class RegistryRouteRefresher {

    private final ApplicationEventPublisher publisher;

    public RegistryRouteRefresher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @EventListener
    public void onSnapshotRefreshed(EnvironmentSnapshotRefreshedEvent ev) {
        log.debug("Route refresh triggered by snapshot v{}", ev.snapshotVersion());
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
