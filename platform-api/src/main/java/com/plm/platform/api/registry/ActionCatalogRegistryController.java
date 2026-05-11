package com.plm.platform.api.registry;

import com.plm.platform.api.actions.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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

    private final ActionCatalogRegistry    registry;
    private final DSLContext               dsl;
    private final ApplicationEventPublisher eventPublisher;

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
            persistToDB(request.serviceCode(), handlers, guards, contributions);
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

    /**
     * Idempotent upsert of handler/guard/contribution metadata into the platform DB.
     * Allows the Settings UI to display registered algorithms without a separate seed
     * migration per service.
     *
     * Uses deterministic IDs (prefix + serviceCode + code) so repeated calls
     * on restart are safe. ON CONFLICT clauses match H2 (PostgreSQL mode) and PostgreSQL.
     */
    @Transactional
    private void persistToDB(String svc,
                             List<ActionCatalogRegistry.HandlerEntry> handlers,
                             List<ActionCatalogRegistry.GuardEntry> guards,
                             List<ContributionInput> contributions) {

        String handlerTypeId = "sys-handler-" + svc;
        String guardTypeId   = "sys-guard-"   + svc;

        dsl.execute(
            "INSERT INTO algorithm_type (id, service_code, name, java_interface) VALUES (?,?,'Action Handler','ActionHandler') " +
            "ON CONFLICT (id) DO NOTHING",
            handlerTypeId, svc);
        dsl.execute(
            "INSERT INTO algorithm_type (id, service_code, name, java_interface) VALUES (?,?,'Action Guard','ActionGuard') " +
            "ON CONFLICT (id) DO NOTHING",
            guardTypeId, svc);

        for (ActionCatalogRegistry.HandlerEntry h : handlers) {
            String safe   = h.code().toLowerCase().replace('_', '-');
            String algId  = "alg-"   + svc + "-" + safe;
            String instId = "ainst-" + svc + "-" + safe;
            String lbl    = h.label() != null ? h.label() : h.code();
            String mod    = h.module();

            dsl.execute(
                "INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name) VALUES (?,?,?,?,?,?,?) " +
                "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                algId, svc, handlerTypeId, h.code(), lbl, h.code(), mod);
            dsl.execute(
                "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                "ON CONFLICT (id) DO NOTHING",
                instId, svc, algId, lbl);
        }

        for (ActionCatalogRegistry.GuardEntry g : guards) {
            String safe   = g.code().toLowerCase().replace('_', '-');
            String algId  = "alg-"   + svc + "-g-" + safe;
            String instId = "ainst-" + svc + "-g-" + safe;
            String lbl    = g.label() != null ? g.label() : g.code();
            String mod    = g.module();

            dsl.execute(
                "INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name) VALUES (?,?,?,?,?,?,?) " +
                "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                algId, svc, guardTypeId, g.code(), lbl, g.code(), mod);
            dsl.execute(
                "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                "ON CONFLICT (id) DO NOTHING",
                instId, svc, algId, lbl);
        }

        for (ContributionInput contrib : contributions) {
            if (contrib.algorithms() == null || contrib.algorithms().isEmpty()) continue;

            String typeId   = contrib.typeId();
            String typeName = contrib.typeName();
            String javaIface = contrib.javaInterface() != null ? contrib.javaInterface() : typeName;

            dsl.execute(
                "INSERT INTO algorithm_type (id, service_code, name, java_interface) VALUES (?,?,?,?) " +
                "ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name",
                typeId, svc, typeName, javaIface);

            for (AlgorithmInput a : contrib.algorithms()) {
                String safe   = a.code().toLowerCase().replace('_', '-');
                String algId  = "alg-"   + svc + "-c-" + safe;
                String instId = "ainst-" + svc + "-c-" + safe;
                String lbl    = a.label() != null ? a.label() : a.code();
                String mod    = a.module();

                try {
                    // Use (service_code, code) as conflict target — seed migrations may use a
                    // different id pattern (e.g. alg-psm-wrapper-lock vs alg-psm-c-wrapper-lock).
                    dsl.execute(
                        "INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name) VALUES (?,?,?,?,?,?,?) " +
                        "ON CONFLICT (service_code, code) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                        algId, svc, typeId, a.code(), lbl, a.code(), mod);

                    // Resolve the actual algorithm id (may differ from algId if conflict fired)
                    var rows = dsl.fetch("SELECT id FROM algorithm WHERE service_code = ? AND code = ?", svc, a.code());
                    String resolvedAlgId = rows.isEmpty() ? algId : rows.get(0).get("id", String.class);

                    // ON CONFLICT (id) handles concurrent duplicate inserts from multiple instances.
                    // Concurrent inserts racing on (service_code, name) are caught and ignored below.
                    dsl.execute(
                        "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                        "ON CONFLICT (id) DO NOTHING",
                        instId, svc, resolvedAlgId, lbl);
                } catch (Exception e) {
                    // Expected: concurrent registration from another instance, or name conflict
                    // with a differently-IDed seed row. Seed migrations are authoritative.
                    log.debug("Contribution {}/{} instance skipped (concurrent/seed conflict): {}", svc, a.code(), e.getMessage());
                }
            }
        }

        int algContribCount = contributions.stream()
            .mapToInt(c -> c.algorithms() == null ? 0 : c.algorithms().size())
            .sum();
        log.debug("Persisted {} handlers + {} guards + {} contribution algorithms to platform DB for service {}",
            handlers.size(), guards.size(), algContribCount, svc);
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
