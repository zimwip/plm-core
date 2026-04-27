package com.pno.domain.service;

import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.pno.domain.scope.AuthorizationKeysFingerprint;
import com.pno.domain.scope.AuthorizationSnapshotVersion;
import com.pno.domain.scope.PermissionScopeRegistry;
import com.pno.infrastructure.event.OutboxEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Shape-agnostic CRUD over {@code authorization_policy} + {@code authorization_policy_key}.
 *
 * <p>Validates submitted keys against the scope's effective key list (own keys
 * + inherited from parent scope chain). Treats the in-memory
 * {@link PermissionScopeRegistry} as the authoritative shape descriptor.
 *
 * <p>This service is the new write/read path; {@link AuthorizationService}
 * adapts the legacy fixed-shape API to it.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicAuthorizationService {

    private final DSLContext dsl;
    private final PermissionScopeRegistry registry;
    private final AuthorizationSnapshotVersion versionStamp;
    private final OutboxEventPublisher eventPublisher;

    /** Idempotent insert. Returns the row id (existing or new). */
    @Transactional
    public String addGrant(String permissionCode, String scopeCode, String roleId,
                           String projectSpaceId, Map<String, String> keys) {
        validate(scopeCode, keys);
        String fingerprint = AuthorizationKeysFingerprint.compute(registry, scopeCode, keys);

        String existingId = dsl.fetchOptional(
            "SELECT id FROM authorization_policy WHERE permission_code=? AND scope_code=? AND role_id=? AND project_space_id=? AND keys_fingerprint=?",
            permissionCode, scopeCode, roleId, projectSpaceId, fingerprint
        ).map(r -> r.get("id", String.class)).orElse(null);
        if (existingId != null) return existingId;

        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO authorization_policy (id, permission_code, scope_code, role_id, project_space_id, keys_fingerprint) VALUES (?,?,?,?,?,?)",
            id, permissionCode, scopeCode, roleId, projectSpaceId, fingerprint
        );
        for (Map.Entry<String, String> e : keys.entrySet()) {
            dsl.execute(
                "INSERT INTO authorization_policy_key (policy_id, key_name, key_value) VALUES (?,?,?)",
                id, e.getKey(), e.getValue()
            );
        }
        publishChanged("GRANT_ADDED", permissionCode, scopeCode, roleId, projectSpaceId);
        return id;
    }

    @Transactional
    public int removeGrant(String permissionCode, String scopeCode, String roleId,
                           String projectSpaceId, Map<String, String> keys) {
        validate(scopeCode, keys);
        String fingerprint = AuthorizationKeysFingerprint.compute(registry, scopeCode, keys);
        int n = dsl.execute(
            "DELETE FROM authorization_policy WHERE permission_code=? AND scope_code=? AND role_id=? AND project_space_id=? AND keys_fingerprint=?",
            permissionCode, scopeCode, roleId, projectSpaceId, fingerprint
        );
        if (n > 0) publishChanged("GRANT_REMOVED", permissionCode, scopeCode, roleId, projectSpaceId);
        return n;
    }

    /**
     * Adds the same grant in every existing project_space. Used by the legacy
     * facade ({@link AuthorizationService}) which doesn't carry a projectSpace.
     */
    @Transactional
    public void addGrantAllSpaces(String permissionCode, String scopeCode, String roleId, Map<String, String> keys) {
        for (String spaceId : allProjectSpaceIds()) {
            addGrant(permissionCode, scopeCode, roleId, spaceId, keys);
        }
    }

    @Transactional
    public int removeGrantAllSpaces(String permissionCode, String scopeCode, String roleId, Map<String, String> keys) {
        int total = 0;
        for (String spaceId : allProjectSpaceIds()) {
            total += removeGrant(permissionCode, scopeCode, roleId, spaceId, keys);
        }
        return total;
    }

    /**
     * Cascade purge: delete any grant whose key/value is in {@code removedValues}
     * for {@code keyName}. Returns the number of policies deleted (cascades to
     * the sidecar key table via FK on delete).
     */
    @Transactional
    public int purgeOrphanedGrants(String keyName, java.util.Collection<String> removedValues) {
        if (removedValues == null || removedValues.isEmpty()) return 0;
        int total = 0;
        for (String v : removedValues) {
            total += dsl.execute(
                "DELETE FROM authorization_policy WHERE id IN ("
                    + "SELECT policy_id FROM authorization_policy_key WHERE key_name = ? AND key_value = ?)",
                keyName, v);
        }
        if (total > 0) publishChanged("GRANTS_PURGED", null, null, null, null);
        return total;
    }

    private void publishChanged(String reason, String permissionCode, String scopeCode, String roleId, String projectSpaceId) {
        long version = versionStamp.bump();
        java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
        payload.put("event", "AUTHORIZATION_CHANGED");
        payload.put("reason", reason);
        payload.put("version", version);
        if (permissionCode != null) payload.put("permissionCode", permissionCode);
        if (scopeCode != null)      payload.put("scopeCode", scopeCode);
        if (roleId != null)         payload.put("roleId", roleId);
        if (projectSpaceId != null) payload.put("projectSpaceId", projectSpaceId);
        eventPublisher.enqueue("global.AUTHORIZATION_CHANGED", payload);
    }

    /** Read all grants in flat (perm, scope, role, project_space, keys-as-map) form. */
    public List<Map<String, Object>> listAllGrants() {
        return projectFlat(dsl.fetch(flatSelect()));
    }

    public List<Map<String, Object>> listGrantsForRole(String roleId) {
        return projectFlat(dsl.fetch(flatSelect() + " WHERE ap.role_id = ?", roleId));
    }

    public List<Map<String, Object>> listGrantsForRoleAndScope(String roleId, String scopeCode) {
        return projectFlat(dsl.fetch(flatSelect() + " WHERE ap.role_id = ? AND ap.scope_code = ?", roleId, scopeCode));
    }

    public List<String> listGlobalPermissionCodesForRoles(java.util.Set<String> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) return List.of();
        String placeholders = String.join(",", java.util.Collections.nCopies(roleIds.size(), "?"));
        Object[] args = roleIds.toArray();
        return dsl.fetch(
                "SELECT DISTINCT permission_code FROM authorization_policy WHERE scope_code='GLOBAL' AND role_id IN ("
                    + placeholders + ") ORDER BY permission_code",
                args)
            .getValues("permission_code", String.class);
    }

    private void validate(String scopeCode, Map<String, String> keys) {
        if (registry.get(scopeCode) == null) {
            throw new IllegalArgumentException("Unknown scope: " + scopeCode);
        }
        List<ScopeKeyDefinition> expected = registry.effectiveKeys(scopeCode);
        if (expected.size() != keys.size()) {
            throw new IllegalArgumentException("Scope " + scopeCode + " expects keys "
                + expected.stream().map(ScopeKeyDefinition::name).toList()
                + " but got " + keys.keySet());
        }
        for (ScopeKeyDefinition k : expected) {
            String v = keys.get(k.name());
            if (v == null || v.isBlank()) {
                throw new IllegalArgumentException("Scope " + scopeCode + " key '" + k.name() + "' missing");
            }
        }
    }

    private List<String> allProjectSpaceIds() {
        return dsl.fetch("SELECT id FROM project_space").getValues("id", String.class);
    }

    private static String flatSelect() {
        return "SELECT ap.id, ap.permission_code, ap.scope_code AS scope, ap.role_id, ap.project_space_id, "
            + "k.key_name, k.key_value "
            + "FROM authorization_policy ap "
            + "LEFT JOIN authorization_policy_key k ON k.policy_id = ap.id";
    }

    private List<Map<String, Object>> projectFlat(org.jooq.Result<Record> rows) {
        Map<String, Map<String, Object>> byId = new LinkedHashMap<>();
        for (Record r : rows) {
            String id = r.get("id", String.class);
            Map<String, Object> row = byId.computeIfAbsent(id, key -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", key);
                m.put("permission_code", r.get("permission_code", String.class));
                m.put("scope", r.get("scope", String.class));
                m.put("role_id", r.get("role_id", String.class));
                m.put("project_space_id", r.get("project_space_id", String.class));
                m.put("keys", new LinkedHashMap<String, String>());
                return m;
            });
            String kName = r.get("key_name", String.class);
            if (kName != null) {
                @SuppressWarnings("unchecked")
                Map<String, String> keys = (Map<String, String>) row.get("keys");
                keys.put(kName, r.get("key_value", String.class));
            }
        }
        // Add the legacy column projections (node_type_id, transition_id) for
        // back-compat with the snapshot consumer (psm-api Casbin adapter).
        List<Map<String, Object>> out = new ArrayList<>(byId.values());
        for (Map<String, Object> row : out) {
            @SuppressWarnings("unchecked")
            Map<String, String> keys = (Map<String, String>) row.get("keys");
            row.put("node_type_id",  keys.get("nodeType"));
            row.put("transition_id", keys.get("transition"));
        }
        return out;
    }
}
