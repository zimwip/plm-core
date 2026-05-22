package com.plm.platform.api.registry;

import com.plm.platform.api.actions.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Cross-service action/guard catalog registry.
 *
 * POST /internal/registry/actions — called by each service at startup to register its handlers/guards.
 * GET  /registry/actions          — discovery endpoint for the full catalog by serviceCode.
 *
 * On registration the handler/guard metadata is also persisted to the DB so the
 * platform Settings UI (ActionsCatalogSection) can display it without the service
 * needing to send a separate seed migration.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class ActionCatalogRegistryController {

    private final ActionCatalogRegistry        registry;
    private final ActionCatalogPersistenceService persistenceService;
    private final ApplicationEventPublisher    eventPublisher;

    @PostMapping("/internal/registry/actions")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        if (request.serviceCode() == null || request.serviceCode().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "serviceCode is required"));
        }

        List<ActionCatalogRegistry.HandlerEntry> handlers = request.handlers() == null
            ? List.of()
            : request.handlers().stream()
                .map(h -> new ActionCatalogRegistry.HandlerEntry(
                    h.code(), h.label(), h.module(), h.httpMethod(), h.pathTemplate(), h.bodyShape()))
                .toList();

        List<ActionCatalogRegistry.GuardEntry> guards = request.guards() == null
            ? List.of()
            : request.guards().stream()
                .map(g -> new ActionCatalogRegistry.GuardEntry(g.code(), g.label(), g.module()))
                .toList();

        List<ContributionInput> contributions = request.contributions() == null ? List.of() : request.contributions();

        List<ActionCatalogRegistry.EventEntry> events = request.events() == null
            ? List.of()
            : request.events().stream()
                .map(e -> new ActionCatalogRegistry.EventEntry(e.code(), e.description(), e.scope()))
                .toList();

        ServiceActionCatalog catalog = registry.register(request.serviceCode(), handlers, guards, events);

        try {
            persistenceService.persistToDB(request.serviceCode(), handlers, guards, contributions);
        } catch (Exception e) {
            log.warn("Registration DB persist failed for service {}: {}", request.serviceCode(), e.getMessage());
        }

        // Notify psm-admin (via PlatformConfigRelay) so it rebuilds its config snapshot.
        // Fires after persistToDB regardless of success — psm-admin re-fetches from our DB.
        if (!handlers.isEmpty() || !guards.isEmpty() || !contributions.isEmpty()) {
            try {
                eventPublisher.publishEvent(new ConfigChangedEvent("REGISTER", "ACTION_CATALOG", request.serviceCode()));
            } catch (Exception e) {
                log.warn("Failed to publish CONFIG_CHANGED after registration for {}: {}", request.serviceCode(), e.getMessage());
            }
        }

        int algCount = contributions.stream()
            .mapToInt(c -> c.algorithms() == null ? 0 : c.algorithms().size())
            .sum();

        return ResponseEntity.ok(Map.of(
            "serviceCode", catalog.serviceCode(),
            "handlerCount", catalog.handlers().size(),
            "guardCount", catalog.guards().size(),
            "eventCount", catalog.events().size(),
            "contributionAlgorithmCount", algCount,
            "registeredAt", catalog.registeredAt().toString()
        ));
    }

    @GetMapping("/registry/actions")
    public ResponseEntity<Map<String, Object>> catalog() {
        Map<String, Object> services = registry.byService().entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> {
                    ServiceActionCatalog c = e.getValue();
                    return Map.of(
                        "handlers", c.handlers(),
                        "guards",   c.guards(),
                        "events",   c.events(),
                        "registeredAt", c.registeredAt().toString()
                    );
                }
            ));
        return ResponseEntity.ok(Map.of("services", services));
    }

    record RegisterRequest(
        String serviceCode,
        List<HandlerInput> handlers,
        List<GuardInput> guards,
        List<ContributionInput> contributions,
        List<EventInput> events
    ) {}

    record HandlerInput(String code, String label, String module, String httpMethod, String pathTemplate, String bodyShape) {}
    record GuardInput(String code, String label, String module) {}
    record ContributionInput(String typeId, String typeName, String javaInterface, List<AlgorithmInput> algorithms) {}
    record AlgorithmInput(String code, String label, String module) {}
    record EventInput(String code, String description, String scope) {}
}
