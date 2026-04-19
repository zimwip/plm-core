package com.plm.permission.internal;

import com.plm.shared.authorization.PlmAction;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for PSM permissions and attribute views.
 *
 * Manages:
 *   - Global action permissions (MANAGE_METAMODEL, MANAGE_ROLES, MANAGE_BASELINES)
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

    /**
     * Lists all global permission rows for a given role in the active project space.
     * Read-only; open to all authenticated users so the Access Rights section is
     * visible to everyone (reader access, as per the UI design).
     */
    public List<Map<String, Object>> getRoleGlobalPermissions(String roleId) {
        String psId = secCtx.currentProjectSpaceId();
        var q = dsl.select(
                DSL.field("ap.id").as("id"),
                DSL.field("ap.action_id").as("action_id"),
                DSL.field("a.action_code").as("action_code"),
                DSL.field("a.display_name").as("display_name"))
            .from("action_permission ap")
            .join("action a").on("a.id = ap.action_id")
            .where("a.scope = 'GLOBAL'")
            .and("ap.role_id = ?", roleId)
            .and("ap.node_type_id IS NULL");
        if (psId != null) q = q.and("ap.project_space_id = ?", psId);
        return q.fetch().map(r -> Map.<String, Object>of(
            "id",          r.get("id",           String.class),
            "actionId",    r.get("action_id",    String.class),
            "actionCode",  r.get("action_code",  String.class),
            "displayName", r.get("display_name", String.class)));
    }

    /**
     * Grants a GLOBAL action to a role in the active project space.
     * Idempotent — silently succeeds if the row already exists.
     * Requires {@code MANAGE_ROLES} permission.
     */
    @PlmAction("MANAGE_ROLES")
    public void addRoleGlobalPermission(String roleId, String actionId) {
        String psId = secCtx.currentProjectSpaceId();
        if (psId == null) throw new IllegalStateException("Project space required");

        String scope = dsl.select(DSL.field("scope"))
            .from("action")
            .where("id = ?", actionId)
            .fetchOne(DSL.field("scope"), String.class);
        if (!"GLOBAL".equals(scope))
            throw new IllegalArgumentException("Action " + actionId + " is not a GLOBAL action");

        int exists = dsl.fetchCount(
            dsl.selectOne().from("action_permission")
                .where("action_id = ?", actionId)
                .and("project_space_id = ?", psId)
                .and("role_id = ?", roleId)
                .and("node_type_id IS NULL"));
        if (exists > 0) return;

        dsl.execute(
            "INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES (?,?,?,?,NULL,NULL)",
            UUID.randomUUID().toString(), actionId, psId, roleId);
        log.info("Global permission granted: action={} role={} space={}", actionId, roleId, psId);
    }

    /**
     * Revokes a GLOBAL action from a role in the active project space.
     * Requires {@code MANAGE_ROLES} permission.
     */
    @PlmAction("MANAGE_ROLES")
    public void removeRoleGlobalPermission(String roleId, String actionId) {
        String psId = secCtx.currentProjectSpaceId();
        if (psId == null) throw new IllegalStateException("Project space required");
        dsl.execute(
            "DELETE FROM action_permission WHERE action_id = ? AND role_id = ? AND node_type_id IS NULL AND project_space_id = ?",
            actionId, roleId, psId);
        log.info("Global permission revoked: action={} role={} space={}", actionId, roleId, psId);
    }

    @PlmAction("MANAGE_ROLES")
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

    @PlmAction("MANAGE_ROLES")
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
