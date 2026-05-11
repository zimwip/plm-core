package com.plm.platform.api.registry;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory cross-service catalog of registered ActionHandlers and ActionGuards.
 * Rebuilt on service restart — no persistence required (services re-register on boot).
 */
@Slf4j
@Component
public class ActionCatalogRegistry {

    private final ConcurrentHashMap<String, ServiceActionCatalog> byService = new ConcurrentHashMap<>();

    public ServiceActionCatalog register(String serviceCode, List<HandlerEntry> handlers,
                                          List<GuardEntry> guards, List<EventEntry> events) {
        List<EventEntry> evts = events != null ? events : List.of();
        ServiceActionCatalog catalog = new ServiceActionCatalog(serviceCode, handlers, guards, evts, Instant.now());
        ServiceActionCatalog prev = byService.put(serviceCode, catalog);
        if (prev == null) {
            log.info("Action catalog registered: {} ({} handlers, {} guards, {} events)",
                serviceCode, handlers.size(), guards.size(), evts.size());
        } else {
            log.debug("Action catalog re-registered: {} ({} handlers, {} guards, {} events)",
                serviceCode, handlers.size(), guards.size(), evts.size());
        }
        return catalog;
    }

    public Collection<ServiceActionCatalog> all() {
        return List.copyOf(byService.values());
    }

    public Map<String, ServiceActionCatalog> byService() {
        return Map.copyOf(byService);
    }

    public record HandlerEntry(
        String code,
        String label,
        String module,
        String httpMethod,
        String pathTemplate,
        String bodyShape
    ) {}

    public record GuardEntry(
        String code,
        String label,
        String module
    ) {}

    public record EventEntry(
        String code,
        String description,
        String scope
    ) {}
}
