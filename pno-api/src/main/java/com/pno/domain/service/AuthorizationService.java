package com.pno.domain.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

/**
 * Legacy fixed-shape facade preserved for backwards compatibility with the
 * existing controllers ({@link com.pno.api.controller.AuthorizationController},
 * {@link com.pno.api.controller.InternalAuthorizationController}) and the psm-api
 * Casbin snapshot consumer.
 *
 * <p>All write paths apply the grant in every existing project_space (legacy
 * grants were projectSpace-agnostic; this preserves current effective
 * behavior). PR8 wires the frontend to the new {@code /access-rights/grants}
 * endpoint that takes an explicit {@code projectSpaceId}.
 */
@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final DSLContext dsl;
    private final DynamicAuthorizationService dynamic;

    // ── Permission catalog (read-only mirror; psm-admin owns the master) ──
    public List<Map<String, Object>> listPermissions() {
        return dsl.select().from("permission").orderBy(DSL.field("display_order"), DSL.field("permission_code"))
            .fetch().intoMaps();
    }

    public List<Map<String, Object>> listGlobalPermissions() {
        return dsl.select().from("permission")
            .where("scope = 'GLOBAL'")
            .orderBy(DSL.field("display_order"), DSL.field("permission_code"))
            .fetch().intoMaps();
    }

    // ── Policy queries (legacy flat shape) ──
    public List<Map<String, Object>> listAllPolicies() {
        return dynamic.listAllGrants();
    }

    public List<Map<String, Object>> getRolePolicies(String roleId) {
        return dynamic.listGrantsForRole(roleId);
    }

    public List<Map<String, Object>> getRoleGlobalPermissions(String roleId) {
        return dynamic.listGrantsForRoleAndScope(roleId, "GLOBAL");
    }

    public List<String> listPermissionCodesForRoles(Set<String> roleIds, boolean isAdmin) {
        if (isAdmin) {
            return dsl.select(DSL.field("permission_code")).from("permission")
                .where("scope = 'GLOBAL'")
                .orderBy(DSL.field("permission_code"))
                .fetch().getValues("permission_code", String.class);
        }
        return dynamic.listGlobalPermissionCodesForRoles(roleIds);
    }

    // ── Global grant CRUD (legacy facade — applies in every project_space) ──
    @Transactional
    public void addRoleGlobalPermission(String roleId, String permissionCode) {
        dynamic.addGrantAllSpaces(permissionCode, "GLOBAL", roleId, Map.of());
    }

    @Transactional
    public void removeRoleGlobalPermission(String roleId, String permissionCode) {
        dynamic.removeGrantAllSpaces(permissionCode, "GLOBAL", roleId, Map.of());
    }

    // ── Node-type scoped grants (legacy facade) ──
    public List<Map<String, Object>> getNodeTypeGrants(String nodeTypeId, String permissionCode, String transitionId) {
        // Filter from full set since legacy semantics ignore project_space.
        List<Map<String, Object>> all = dynamic.listAllGrants();
        return all.stream().filter(row -> {
            if (!permissionCode.equals(row.get("permission_code"))) return false;
            if (!nodeTypeId.equals(row.get("node_type_id"))) return false;
            String tx = (String) row.get("transition_id");
            if (transitionId != null && !transitionId.isBlank()) return transitionId.equals(tx);
            return tx == null;
        }).toList();
    }

    @Transactional
    public void addNodeTypeGrant(String nodeTypeId, String permissionCode, String roleId, String transitionId) {
        String scope = resolveScope(permissionCode);
        Map<String, String> keys = new HashMap<>();
        keys.put("nodeType", nodeTypeId);
        if (transitionId != null && !transitionId.isBlank()) keys.put("transition", transitionId);
        dynamic.addGrantAllSpaces(permissionCode, scope, roleId, keys);
    }

    @Transactional
    public void removeNodeTypeGrant(String nodeTypeId, String permissionCode, String roleId, String transitionId) {
        String scope = resolveScope(permissionCode);
        Map<String, String> keys = new HashMap<>();
        keys.put("nodeType", nodeTypeId);
        if (transitionId != null && !transitionId.isBlank()) keys.put("transition", transitionId);
        dynamic.removeGrantAllSpaces(permissionCode, scope, roleId, keys);
    }

    // ── Maintenance hooks called by cascades (transition delete, nodetype delete) ──
    @Transactional
    public int deleteByTransition(String transitionId) {
        return dynamic.purgeOrphanedGrants("transition", List.of(transitionId));
    }

    @Transactional
    public int deleteByNodeType(String nodeTypeId) {
        return dynamic.purgeOrphanedGrants("nodeType", List.of(nodeTypeId));
    }

    private String resolveScope(String permissionCode) {
        return dsl.select(DSL.field("scope")).from("permission")
            .where("permission_code = ?", permissionCode)
            .fetchOptional("scope", String.class)
            .orElse("NODE");
    }
}
