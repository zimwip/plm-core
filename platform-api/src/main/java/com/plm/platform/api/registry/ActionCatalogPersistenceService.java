package com.plm.platform.api.registry;

import com.plm.platform.api.registry.ActionCatalogRegistryController.AlgorithmInput;
import com.plm.platform.api.registry.ActionCatalogRegistryController.ContributionInput;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
     * <p>Computes a fingerprint of the incoming catalog and compares it against the
     * rows already stored for {@code svc}. When every incoming row is already present
     * (the common case: replica boots, PLATFORM_RESTARTED re-register, identical
     * payloads) the method writes nothing and returns {@code false}, so the caller can
     * skip the CONFIG_CHANGED broadcast. Only a genuine catalog change runs the upserts.
     *
     * <p>Uses deterministic IDs (prefix + serviceCode + code) and conflict targets that
     * match the real unique constraints ({@code uq_algorithm_code} on (service_code, code),
     * {@code uq_algorithm_instance_name} on (service_code, name)) so repeated calls never
     * raise a duplicate-key error — including against differently-IDed seed rows.
     *
     * @return {@code true} if the catalog changed and rows were written; {@code false} if
     *         the stored catalog already covered the incoming payload (no-op).
     */
    public boolean persistToDB(String svc,
                               List<ActionCatalogRegistry.HandlerEntry> handlers,
                               List<ActionCatalogRegistry.GuardEntry> guards,
                               List<ContributionInput> contributions) {

        String handlerTypeId = "sys-handler-" + svc;
        String guardTypeId   = "sys-guard-"   + svc;

        Set<String> incoming = incomingFingerprint(svc, handlerTypeId, guardTypeId, handlers, guards, contributions);
        Set<String> current  = currentFingerprint(svc);
        if (current.containsAll(incoming)) {
            log.debug("Action catalog unchanged for service {} — skipping persist", svc);
            return false;
        }

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
                "ON CONFLICT (service_code, code) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                algId, svc, handlerTypeId, h.code(), lbl, h.code(), mod);
            dsl.execute(
                "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                "ON CONFLICT (service_code, name) DO NOTHING",
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
                "ON CONFLICT (service_code, code) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                algId, svc, guardTypeId, g.code(), lbl, g.code(), mod);
            dsl.execute(
                "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                "ON CONFLICT (service_code, name) DO NOTHING",
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

                // (service_code, code) conflict target — seed migrations may use a
                // different id pattern (e.g. alg-psm-wrapper-lock vs alg-psm-c-wrapper-lock).
                dsl.execute(
                    "INSERT INTO algorithm (id, service_code, algorithm_type_id, code, name, handler_ref, module_name) VALUES (?,?,?,?,?,?,?) " +
                    "ON CONFLICT (service_code, code) DO UPDATE SET name = EXCLUDED.name, module_name = EXCLUDED.module_name",
                    algId, svc, typeId, a.code(), lbl, a.code(), mod);

                // Resolve the actual algorithm id (may differ from algId if conflict fired)
                var rows = dsl.fetch("SELECT id FROM algorithm WHERE service_code = ? AND code = ?", svc, a.code());
                String resolvedAlgId = rows.isEmpty() ? algId : rows.get(0).get("id", String.class);

                // (service_code, name) conflict target — matches uq_algorithm_instance_name,
                // so a name already held by a differently-IDed seed row is a clean no-op.
                dsl.execute(
                    "INSERT INTO algorithm_instance (id, service_code, algorithm_id, name) VALUES (?,?,?,?) " +
                    "ON CONFLICT (service_code, name) DO NOTHING",
                    instId, svc, resolvedAlgId, lbl);
            }
        }

        int algContribCount = contributions.stream()
            .mapToInt(c -> c.algorithms() == null ? 0 : c.algorithms().size())
            .sum();
        log.debug("Persisted {} handlers + {} guards + {} contribution algorithms to platform DB for service {}",
            handlers.size(), guards.size(), algContribCount, svc);
        return true;
    }

    /** Canonical lines describing every row this payload would write for {@code svc}. */
    private Set<String> incomingFingerprint(String svc, String handlerTypeId, String guardTypeId,
                                            List<ActionCatalogRegistry.HandlerEntry> handlers,
                                            List<ActionCatalogRegistry.GuardEntry> guards,
                                            List<ContributionInput> contributions) {
        Set<String> lines = new LinkedHashSet<>();
        lines.add("type|" + handlerTypeId + "|Action Handler");
        lines.add("type|" + guardTypeId + "|Action Guard");

        for (ActionCatalogRegistry.HandlerEntry h : handlers) {
            String lbl = h.label() != null ? h.label() : h.code();
            lines.add("alg|" + h.code() + "|" + lbl + "|" + nz(h.module()) + "|" + handlerTypeId);
            lines.add("inst|" + lbl);
        }
        for (ActionCatalogRegistry.GuardEntry g : guards) {
            String lbl = g.label() != null ? g.label() : g.code();
            lines.add("alg|" + g.code() + "|" + lbl + "|" + nz(g.module()) + "|" + guardTypeId);
            lines.add("inst|" + lbl);
        }
        for (ContributionInput contrib : contributions) {
            if (contrib.algorithms() == null || contrib.algorithms().isEmpty()) continue;
            lines.add("type|" + contrib.typeId() + "|" + contrib.typeName());
            for (AlgorithmInput a : contrib.algorithms()) {
                String lbl = a.label() != null ? a.label() : a.code();
                lines.add("alg|" + a.code() + "|" + lbl + "|" + nz(a.module()) + "|" + contrib.typeId());
                lines.add("inst|" + lbl);
            }
        }
        return lines;
    }

    /** Same-shape lines for the rows already stored for {@code svc}. */
    private Set<String> currentFingerprint(String svc) {
        Set<String> lines = new LinkedHashSet<>();
        for (Record r : dsl.fetch("SELECT id, name FROM algorithm_type WHERE service_code = ?", svc)) {
            lines.add("type|" + r.get("id", String.class) + "|" + r.get("name", String.class));
        }
        for (Record r : dsl.fetch(
                "SELECT code, name, module_name, algorithm_type_id FROM algorithm WHERE service_code = ?", svc)) {
            lines.add("alg|" + r.get("code", String.class) + "|" + r.get("name", String.class) + "|"
                + nz(r.get("module_name", String.class)) + "|" + r.get("algorithm_type_id", String.class));
        }
        for (Record r : dsl.fetch("SELECT name FROM algorithm_instance WHERE service_code = ?", svc)) {
            lines.add("inst|" + r.get("name", String.class));
        }
        return lines;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
