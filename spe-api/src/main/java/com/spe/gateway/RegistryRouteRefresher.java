package com.spe.gateway;

import com.spe.registry.RegistryEvents;
import org.springframework.cloud.gateway.event.RefreshRoutesEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class RegistryRouteRefresher {

    private final ApplicationEventPublisher publisher;

    public RegistryRouteRefresher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    @EventListener(RegistryEvents.ServiceRegisteredEvent.class)
    public void onRegistered(RegistryEvents.ServiceRegisteredEvent ev) {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }

    @EventListener(RegistryEvents.ServiceDeregisteredEvent.class)
    public void onDeregistered(RegistryEvents.ServiceDeregisteredEvent ev) {
        publisher.publishEvent(new RefreshRoutesEvent(this));
    }
}
