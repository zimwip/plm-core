package com.plm.platform.api.registry;

import com.plm.platform.api.registry.ActionCatalogRegistryController.AlgorithmInput;
import com.plm.platform.api.registry.ActionCatalogRegistryController.ContributionInput;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Persists handler/guard/contribution catalog metadata into the platform DB.
 *
 * Extracted from {@link ActionCatalogRegistryController} to keep SQL out of the
 * controller layer. Intentionally NOT {@code @Transactional}: registration is a
 * best-effort, idempotent upsert that must tolerate partial failure and concurrent
 * races between service instances. Each statement auto-commits independently — a
 * single enclosing transaction would let the first conflict abort every later
 * statement ("current transaction is aborted").
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionCatalogPersistenceService {

    private final DSLContext dsl;

    /**
     * Idempotent upsert of handler/guard/contribution metadata into the platform DB.
     * Allows the Settings UI to display registered algorithms without a separate seed
     * migration per service.
     *
     * Uses deterministic IDs (prefix + serviceCode + code) so repeated calls
     * on restart are safe. ON CONFLICT clauses match H2 (PostgreSQL mode) and PostgreSQL.
     */
    public void persistToDB(String svc,
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
}
