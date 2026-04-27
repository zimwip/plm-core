package com.pno.domain.scope;

import com.plm.platform.authz.ScopeDefinitionHasher;
import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeRegistrationResponse.ScopeConflict;
import com.plm.platform.authz.dto.ScopeValueSourceDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Validates and persists scope registrations submitted by services at boot.
 *
 * <p>Conflict policy: a scope code is owned by whichever service first
 * registers it. Re-registration with the same {@code definition_hash} is
 * idempotent (refreshes {@code last_seen_at} on value sources). Re-registration
 * with a different hash throws {@link ScopeConflictException} → HTTP 409.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ScopeRegistrationService {

    private final DSLContext dsl;
    private final PermissionScopeRegistry registry;

    @Transactional
    public List<ScopeConflict> registerAll(String serviceCode, String instanceId, List<ScopeRegistration> scopes) {
        List<ScopeConflict> conflicts = new ArrayList<>();
        boolean anyChange = false;

        // Insert parent scopes before children: a child's FK to parent_scope_code
        // must already resolve. Existing rows in the DB count as resolved.
        List<ScopeRegistration> ordered = topologicalSort(scopes);

        for (ScopeRegistration s : ordered) {
            String submittedHash = ScopeDefinitionHasher.hash(s);
            String existingHash = dsl.select(org.jooq.impl.DSL.field("definition_hash", String.class))
                .from("permission_scope")
                .where("scope_code = ?", s.scopeCode())
                .fetchOne(org.jooq.impl.DSL.field("definition_hash", String.class));

            if (existingHash == null) {
                insertScope(s, serviceCode, submittedHash);
                anyChange = true;
            } else if (!existingHash.equals(submittedHash)) {
                String existingOwner = dsl.select(org.jooq.impl.DSL.field("owner_service", String.class))
                    .from("permission_scope")
                    .where("scope_code = ?", s.scopeCode())
                    .fetchOne(org.jooq.impl.DSL.field("owner_service", String.class));
                if (serviceCode.equals(existingOwner)) {
                    // Owner re-registering its own scope — overwrite hash + keys
                    // (handles V10 backfill sentinel and legitimate shape evolution).
                    updateScope(s, submittedHash);
                    anyChange = true;
                } else {
                    conflicts.add(new ScopeConflict(s.scopeCode(), existingHash, submittedHash, existingOwner));
                    continue;
                }
            }

            // Refresh / upsert value sources contributed by this caller. Other
            // services may also serve values for the same (scope, key); rows
            // are keyed by (scope_code, key_name, service_code).
            if (s.valueSources() != null) {
                for (ScopeValueSourceDefinition vs : s.valueSources()) {
                    upsertValueSource(s.scopeCode(), vs, serviceCode, instanceId);
                }
                anyChange = true;
            }
        }

        if (!conflicts.isEmpty()) throw new ScopeConflictException(conflicts);
        if (anyChange) registry.load();
        return conflicts;
    }

    /**
     * Sort scopes so that any parent referenced by another in the same batch is
     * processed first. Parents already in the DB are treated as resolved.
     */
    private List<ScopeRegistration> topologicalSort(List<ScopeRegistration> scopes) {
        java.util.Set<String> resolved = new java.util.HashSet<>();
        for (org.jooq.Record r : dsl.fetch("SELECT scope_code FROM permission_scope")) {
            resolved.add(r.get("scope_code", String.class));
        }
        List<ScopeRegistration> remaining = new ArrayList<>(scopes);
        List<ScopeRegistration> ordered = new ArrayList<>(scopes.size());
        boolean progressed = true;
        while (!remaining.isEmpty() && progressed) {
            progressed = false;
            java.util.Iterator<ScopeRegistration> it = remaining.iterator();
            while (it.hasNext()) {
                ScopeRegistration s = it.next();
                String parent = s.parentScopeCode();
                if (parent == null || resolved.contains(parent)) {
                    ordered.add(s);
                    resolved.add(s.scopeCode());
                    it.remove();
                    progressed = true;
                }
            }
        }
        if (!remaining.isEmpty()) {
            String missing = remaining.stream().map(ScopeRegistration::scopeCode).collect(java.util.stream.Collectors.joining(", "));
            throw new IllegalStateException("Scope registration: unresolved parent dependencies for " + missing);
        }
        return ordered;
    }

    private void insertScope(ScopeRegistration s, String ownerService, String hash) {
        dsl.execute(
            "INSERT INTO permission_scope (scope_code, parent_scope_code, description, definition_hash, owner_service, registered_at) VALUES (?,?,?,?,?,?)",
            s.scopeCode(), s.parentScopeCode(), s.description(), hash, ownerService, LocalDateTime.now()
        );
        if (s.keys() != null) {
            int pos = 1;
            for (ScopeKeyDefinition k : s.keys()) {
                dsl.execute(
                    "INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) VALUES (?,?,?,?)",
                    s.scopeCode(), pos++, k.name(), k.description()
                );
            }
        }
        log.info("Registered scope {} (owner={})", s.scopeCode(), ownerService);
    }

    private void updateScope(ScopeRegistration s, String hash) {
        dsl.execute(
            "UPDATE permission_scope SET parent_scope_code = ?, description = ?, definition_hash = ? WHERE scope_code = ?",
            s.parentScopeCode(), s.description(), hash, s.scopeCode()
        );
        // Replace keys — owner is authoritative on shape.
        dsl.execute("DELETE FROM permission_scope_key WHERE scope_code = ?", s.scopeCode());
        if (s.keys() != null) {
            int pos = 1;
            for (ScopeKeyDefinition k : s.keys()) {
                dsl.execute(
                    "INSERT INTO permission_scope_key (scope_code, key_position, key_name, description) VALUES (?,?,?,?)",
                    s.scopeCode(), pos++, k.name(), k.description()
                );
            }
        }
        log.info("Updated scope {} (hash refreshed)", s.scopeCode());
    }

    private void upsertValueSource(String scopeCode, ScopeValueSourceDefinition vs, String serviceCode, String instanceId) {
        int updated = dsl.execute(
            "UPDATE permission_scope_value_source SET endpoint_path = ?, instance_id = ?, last_seen_at = ? "
                + "WHERE scope_code = ? AND key_name = ? AND service_code = ?",
            vs.endpointPath(), instanceId, LocalDateTime.now(),
            scopeCode, vs.keyName(), serviceCode
        );
        if (updated == 0) {
            dsl.execute(
                "INSERT INTO permission_scope_value_source (id, scope_code, key_name, service_code, endpoint_path, instance_id, last_seen_at) VALUES (?,?,?,?,?,?,?)",
                UUID.randomUUID().toString(), scopeCode, vs.keyName(), serviceCode, vs.endpointPath(), instanceId, LocalDateTime.now()
            );
        }
    }
}
