package com.plm.permission.internal;

import com.plm.permission.PermissionRegistry;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for PSM permissions and attribute views.
 *
 * Manages:
 *   - Global permission grants (MANAGE_METAMODEL, MANAGE_ROLES, MANAGE_BASELINES, READ)
 *   - Attribute views (attribute_view + view_attribute_override)
 *
 * All mutating operations require MANAGE_ROLES permission.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionAdminService {

    private final DSLContext          dsl;
    private final SecurityContextPort secCtx;
    private final PermissionRegistry  permissionRegistry;
    private final PolicyService       policyService;

    /**
     * Returns the full permission catalog from the {@code permission} table.
     */
    public List<Map<String, Object>> listPermissions() {
        return permissionRegistry.all().stream()
            .sorted((a, b) -> {
                int cmp = a.scope().name().compareTo(b.scope().name());
                return cmp != 0 ? cmp : Integer.compare(a.displayOrder(), b.displayOrder());
            })
            .map(e -> Map.<String, Object>of(
                "permissionCode", e.code(),
                "scope",          e.scope().name(),
                "displayName",    e.displayName(),
                "description",    e.description() != null ? e.description() : ""))
            .toList();
    }

    /**
     * Returns permissions with scope=GLOBAL from the permission catalog.
     */
    public List<Map<String, Object>> listGlobalPermissions() {
        return permissionRegistry.listByScope(com.plm.shared.authorization.PermissionScope.GLOBAL)
            .stream()
            .map(e -> Map.<String, Object>of(
                "permissionCode", e.code(),
                "displayName",    e.displayName(),
                "description",    e.description() != null ? e.description() : ""))
            .toList();
    }

    /**
     * Returns GLOBAL permission codes the current user can execute.
     */
    public List<String> getExecutableGlobalPermissions() {
        var ctx = secCtx.currentUser();
        var globalPerms = permissionRegistry.listByScope(com.plm.shared.authorization.PermissionScope.GLOBAL);

        if (ctx.isAdmin()) {
            return globalPerms.stream().map(PermissionRegistry.PermissionEntry::code).toList();
        }

        if (ctx.getRoleIds().isEmpty()) return List.of();

        List<String> result = new ArrayList<>();
        for (var perm : globalPerms) {
            if (policyService.canExecute(perm.code(), "GLOBAL", null, null)) {
                result.add(perm.code());
            }
        }
        return result;
    }

    /**
     * Returns ALL authorization_policy rows for a role in the active project space.
     * Frontend slices by scope locally.
     */
    public List<Map<String, Object>> getRolePolicies(String roleId) {
        String psId = secCtx.currentProjectSpaceId();
        var q = dsl.select(
                DSL.field("id"),
                DSL.field("permission_code"),
                DSL.field("scope"),
                DSL.field("node_type_id"),
                DSL.field("transition_id"))
            .from("authorization_policy")
            .where("role_id = ?", roleId);
        if (psId != null) q = q.and("project_space_id = ?", psId);
        return q.fetch().map(r -> {
            var m = new java.util.LinkedHashMap<String, Object>();
            m.put("id",             r.get("id",              String.class));
            m.put("permissionCode", r.get("permission_code", String.class));
            m.put("scope",          r.get("scope",           String.class));
            m.put("nodeTypeId",     r.get("node_type_id",    String.class));
            m.put("transitionId",   r.get("transition_id",   String.class));
            return (Map<String, Object>) m;
        });
    }

    /**
     * Lists all global permission grants for a given role in the active project space.
     */
    public List<Map<String, Object>> getRoleGlobalPermissions(String roleId) {
        String psId = secCtx.currentProjectSpaceId();
        var q = dsl.select(
                DSL.field("id"),
                DSL.field("permission_code"),
                DSL.field("scope"))
            .from("authorization_policy")
            .where("scope = 'GLOBAL'")
            .and("role_id = ?", roleId)
            .and("node_type_id IS NULL");
        if (psId != null) q = q.and("project_space_id = ?", psId);
        return q.fetch().map(r -> Map.<String, Object>of(
            "id",             r.get("id",              String.class),
            "permissionCode", r.get("permission_code", String.class)));
    }

    /**
     * Grants a GLOBAL permission to a role in the active project space.
     * Idempotent — silently succeeds if the row already exists.
     */
    @PlmPermission("MANAGE_ROLES")
    public void addRoleGlobalPermission(String roleId, String permissionCode) {
        String psId = secCtx.currentProjectSpaceId();
        if (psId == null) throw new IllegalStateException("Project space required");

        int exists = dsl.fetchCount(
            dsl.selectOne().from("authorization_policy")
                .where("permission_code = ?", permissionCode)
                .and("project_space_id = ?", psId)
                .and("role_id = ?", roleId)
                .and("node_type_id IS NULL"));
        if (exists > 0) return;

        dsl.execute(
            "INSERT INTO authorization_policy (id, permission_code, scope, project_space_id, role_id, node_type_id, transition_id) VALUES (?,?,?,?,?,NULL,NULL)",
            UUID.randomUUID().toString(), permissionCode, "GLOBAL", psId, roleId);
        policyService.reloadPolicies();
        log.info("Global permission granted: permission={} role={} space={}", permissionCode, roleId, psId);
    }

    /**
     * Revokes a GLOBAL permission from a role in the active project space.
     */
    @PlmPermission("MANAGE_ROLES")
    public void removeRoleGlobalPermission(String roleId, String permissionCode) {
        String psId = secCtx.currentProjectSpaceId();
        if (psId == null) throw new IllegalStateException("Project space required");
        dsl.execute(
            "DELETE FROM authorization_policy WHERE permission_code = ? AND role_id = ? AND node_type_id IS NULL AND project_space_id = ?",
            permissionCode, roleId, psId);
        policyService.reloadPolicies();
        log.info("Global permission revoked: permission={} role={} space={}", permissionCode, roleId, psId);
    }

    // ================================================================
    // PERMISSION CATALOG CRUD
    // ================================================================

    /**
     * Creates a new permission in the catalog.
     * Fails if the permission code already exists.
     */
    @PlmPermission("MANAGE_ROLES")
    public void createPermission(String permissionCode, String scope, String displayName,
                                 String description, int displayOrder) {
        if (permissionRegistry.exists(permissionCode)) {
            throw new com.plm.shared.exception.PlmFunctionalException(
                "Permission '" + permissionCode + "' already exists", 409);
        }
        dsl.execute(
            "INSERT INTO permission (permission_code, scope, display_name, description, display_order) VALUES (?,?,?,?,?)",
            permissionCode, scope, displayName, description, displayOrder);
        permissionRegistry.reload();
        log.info("Permission created: code={} scope={}", permissionCode, scope);
    }

    /**
     * Updates display metadata for an existing permission.
     */
    @PlmPermission("MANAGE_ROLES")
    public void updatePermission(String permissionCode, String displayName, String description,
                                 Integer displayOrder) {
        if (!permissionRegistry.exists(permissionCode)) {
            throw new com.plm.shared.exception.PlmFunctionalException(
                "Permission '" + permissionCode + "' not found", 404);
        }
        var updates = new ArrayList<String>();
        var params  = new ArrayList<Object>();
        if (displayName != null)  { updates.add("display_name = ?");  params.add(displayName); }
        if (description != null)  { updates.add("description = ?");   params.add(description); }
        if (displayOrder != null) { updates.add("display_order = ?"); params.add(displayOrder); }
        if (updates.isEmpty()) return;

        params.add(permissionCode);
        dsl.execute("UPDATE permission SET " + String.join(", ", updates) + " WHERE permission_code = ?",
            params.toArray());
        permissionRegistry.reload();
        log.info("Permission updated: code={}", permissionCode);
    }

    // ================================================================
    // VIEWS
    // ================================================================

    @PlmPermission("MANAGE_ROLES")
    public String createView(String nodeTypeId, String name, String description,
                             String eligibleRoleId, String eligibleStateId, int priority) {
        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO attribute_view
              (ID, NODE_TYPE_ID, NAME, DESCRIPTION, ELIGIBLE_ROLE_ID, ELIGIBLE_STATE_ID, PRIORITY)
            VALUES (?,?,?,?,?,?,?)
            """,
            id, nodeTypeId, name, description, eligibleRoleId, eligibleStateId, priority
        );
        log.info("AttributeView '{}' created for nodeType={}", name, nodeTypeId);
        return id;
    }

    @PlmPermission("MANAGE_ROLES")
    public void setViewOverride(String viewId, String attributeDefId,
                                Boolean visible, Boolean editable,
                                Integer displayOrder, String displaySection) {
        dsl.execute(
            "DELETE FROM view_attribute_override WHERE view_id = ? AND attribute_def_id = ?",
            viewId, attributeDefId
        );
        dsl.execute("""
            INSERT INTO view_attribute_override
              (ID, VIEW_ID, ATTRIBUTE_DEF_ID, VISIBLE, EDITABLE, DISPLAY_ORDER, DISPLAY_SECTION)
            VALUES (?,?,?,?,?,?,?)
            """,
            UUID.randomUUID().toString(), viewId, attributeDefId,
            visible   != null ? (visible   ? 1 : 0) : null,
            editable  != null ? (editable  ? 1 : 0) : null,
            displayOrder, displaySection
        );
    }
}
