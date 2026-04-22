package com.spe.gateway;

import com.spe.registry.RegistryEvents;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Route set changes only when a service appears / disappears (first instance in,
 * last instance out). Individual instance churn is handled by
 * {@link SvcLoadBalancerFilter} without a route refresh.
 */
@Component
public class RegistryRouteRefresher {

    private final ApplicationEventPublisher publisher;

    public RegistryRouteRefresher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @EventListener(RegistryEvents.ServiceAppearedEvent.class)
    public void onAppeared(RegistryEvents.ServiceAppearedEvent ev) {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }

    @EventListener(RegistryEvents.ServiceDisappearedEvent.class)
    public void onDisappeared(RegistryEvents.ServiceDisappearedEvent ev) {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
