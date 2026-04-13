package com.plm.domain.service;

import com.plm.domain.action.ActionPermissionService;
import com.plm.infrastructure.security.PlmAction;
import com.plm.infrastructure.security.PlmProjectSpaceContext;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Vérification des permissions PLM basées sur les rôles.
 *
 * Toutes les vérifications de permission passent désormais par action_permission,
 * en déléguant à ActionPermissionService pour la logique d'allowlist.
 *
 * Hiérarchie de résolution :
 *   1. Admin → tout est permis
 *   2. action_permission (via node_type_action) → droits structurels (read/write/sign)
 *   3. État lifecycle → restreint editable/required sur les attributs
 *   4. Vue active → restreint encore la visibilité/édition
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final DSLContext              dsl;
    private final ActionPermissionService actionPermissionService;

    // ================================================================
    // PERMISSIONS NOEUDS — backed by action_permission
    // ================================================================

    public void assertCanRead(String nodeId) {
        if (!checkPermission(nodeId, "act-read")) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot READ node " + nodeId);
        }
    }

    public void assertCanUpdateNode(String nodeId) {
        if (!checkPermission(nodeId, "act-update-node")) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot UPDATE node " + nodeId);
        }
    }

    public void assertCanSign(String nodeId) {
        if (!checkPermission(nodeId, "act-sign")) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot SIGN node " + nodeId);
        }
    }

    // ================================================================
    // PERMISSIONS TRANSITIONS — backed by action_permission
    // ================================================================

    /**
     * Vérifie que l'utilisateur courant a le droit de déclencher une transition.
     * Délègue à ActionPermissionService en résolvant le node_type_action correspondant.
     * Si aucun node_type_action n'est trouvé → ouvert à tous (comportement par défaut).
     */
    public void assertCanTransition(String transitionId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return;

        String ntaId = dsl.select(DSL.field("id"))
            .from("node_type_action")
            .where("transition_id = ?", transitionId)
            .and("status = 'ENABLED'")
            .limit(1)
            .fetchOne(DSL.field("id"), String.class);

        if (ntaId == null) return; // no action registered → open to all

        if (!actionPermissionService.canExecute(ntaId)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot trigger transition " + transitionId);
        }
    }

    // ================================================================
    // VUES - résolution de la vue active
    // ================================================================

    /**
     * Résout la vue active pour un utilisateur dans un état donné.
     *
     * Algorithme :
     *  1. Chercher une vue éligible (role_id ∩ user_roles ET state_id = currentState)
     *  2. Si plusieurs vues éligibles → prendre celle avec la priorité la plus haute
     *  3. Si aucune vue → retourner null (comportement par défaut)
     */
    public String resolveActiveView(String nodeTypeId, String currentStateId) {
        PlmUserContext ctx = PlmSecurityContext.get();

        // Vue spécifique rôle + état
        var view = dsl.select()
            .from("attribute_view")
            .where("node_type_id = ?", nodeTypeId)
            .and(
                // Vue avec rôle ET état spécifiques
                DSL.field("eligible_role_id").in(ctx.getRoleIds())
                   .and(DSL.field("eligible_state_id").eq(currentStateId))
                .or(
                // Vue avec rôle seulement (état NULL = tous les états)
                    DSL.field("eligible_role_id").in(ctx.getRoleIds())
                       .and(DSL.field("eligible_state_id").isNull())
                )
                .or(
                // Vue avec état seulement (rôle NULL = tous les rôles)
                    DSL.field("eligible_role_id").isNull()
                       .and(DSL.field("eligible_state_id").eq(currentStateId))
                )
            )
            .orderBy(DSL.field("priority").desc())
            .limit(1)
            .fetchOne();

        return view != null ? view.get("id", String.class) : null;
    }

    /**
     * Applique les overrides d'une vue sur un attribut.
     *
     * Règle fondamentale : un override ne peut que RESTREINDRE.
     * Si la règle d'état dit editable=false, la vue ne peut pas dire editable=true.
     */
    public AttributeOverride applyViewOverride(
        String viewId,
        String attributeDefId,
        boolean stateEditable,
        boolean stateVisible,
        int stateDisplayOrder,
        String stateDisplaySection
    ) {
        if (viewId == null) {
            return new AttributeOverride(stateEditable, stateVisible, stateDisplayOrder, stateDisplaySection);
        }

        var override = dsl.select()
            .from("view_attribute_override")
            .where("view_id = ?", viewId)
            .and("attribute_def_id = ?", attributeDefId)
            .fetchOne();

        if (override == null) {
            return new AttributeOverride(stateEditable, stateVisible, stateDisplayOrder, stateDisplaySection);
        }

        Integer viewEditable = override.get("editable", Integer.class);
        Integer viewVisible  = override.get("visible", Integer.class);
        Integer viewOrder    = override.get("display_order", Integer.class);
        String  viewSection  = override.get("display_section", String.class);

        // Règle : la vue peut restreindre mais jamais élargir
        boolean finalEditable = stateEditable && (viewEditable == null || viewEditable == 1);
        boolean finalVisible  = stateVisible  && (viewVisible  == null || viewVisible  == 1);
        int     finalOrder    = viewOrder   != null ? viewOrder   : stateDisplayOrder;
        String  finalSection  = viewSection != null ? viewSection : stateDisplaySection;

        return new AttributeOverride(finalEditable, finalVisible, finalOrder, finalSection);
    }

    // ================================================================
    // GLOBAL ACTION PERMISSIONS — CRUD for the Access Rights section
    // ================================================================

    /**
     * Lists all global permission rows for a given role in the active project space.
     * Read-only; open to all authenticated users so the Access Rights section is
     * visible to everyone (reader access, as per the UI design).
     */
    public List<Map<String, Object>> getRoleGlobalPermissions(String roleId) {
        String psId = PlmProjectSpaceContext.get();
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
        String psId = PlmProjectSpaceContext.get();
        if (psId == null) throw new IllegalStateException("Project space required");

        // Verify the action is GLOBAL scope
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
        if (exists > 0) return; // idempotent

        dsl.execute(
            "INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES (?,?,?,?,NULL,NULL)",
            java.util.UUID.randomUUID().toString(), actionId, psId, roleId);
        log.info("Global permission granted: action={} role={} space={}", actionId, roleId, psId);
    }

    /**
     * Revokes a GLOBAL action from a role in the active project space.
     * Requires {@code MANAGE_ROLES} permission.
     */
    @PlmAction("MANAGE_ROLES")
    public void removeRoleGlobalPermission(String roleId, String actionId) {
        String psId = PlmProjectSpaceContext.get();
        dsl.execute(
            "DELETE FROM action_permission WHERE action_id = ? AND role_id = ? AND node_type_id IS NULL"
            + (psId != null ? " AND project_space_id = ?" : ""),
            psId != null
                ? new Object[]{ actionId, roleId, psId }
                : new Object[]{ actionId, roleId });
        log.info("Global permission revoked: action={} role={} space={}", actionId, roleId, psId);
    }

    @PlmAction("MANAGE_ROLES")
    public String createView(String nodeTypeId, String name, String description,
                             String eligibleRoleId, String eligibleStateId, int priority) {
        String id = java.util.UUID.randomUUID().toString();
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
            java.util.UUID.randomUUID().toString(), viewId, attributeDefId,
            visible   != null ? (visible   ? 1 : 0) : null,
            editable  != null ? (editable  ? 1 : 0) : null,
            displayOrder, displaySection
        );
    }

    // ================================================================
    // Helpers
    // ================================================================

    /**
     * Checks whether the current user can perform a given action on the specified node.
     * Resolves node → nodeType → node_type_action, then delegates to ActionPermissionService.
     * Passes null for stateId — structural permissions (read/write/sign) are not
     * lifecycle-state-gated at this level; state filtering is handled by the action system.
     */
    private boolean checkPermission(String nodeId, String actionId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return true;
        if (ctx.getRoleIds().isEmpty()) return false;

        String nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId).fetchOne(DSL.field("node_type_id"), String.class);
        if (nodeTypeId == null) return false;

        String ntaId = dsl.select(DSL.field("id")).from("node_type_action")
            .where("node_type_id = ?", nodeTypeId)
            .and("action_id = ?", actionId)
            .and("status = 'ENABLED'")
            .limit(1)
            .fetchOne(DSL.field("id"), String.class);
        if (ntaId == null) return false;

        return actionPermissionService.canExecute(ntaId);
    }

    /**
     * Checks whether the current user can read nodes of the given node type.
     * Used to filter listNodes results without a per-node DB round-trip.
     */
    public boolean canReadNodeType(String nodeTypeId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return true;
        if (ctx.getRoleIds().isEmpty()) return false;

        String ntaId = dsl.select(DSL.field("id")).from("node_type_action")
            .where("node_type_id = ?", nodeTypeId)
            .and("action_id = 'act-read'")
            .and("status = 'ENABLED'")
            .limit(1)
            .fetchOne(DSL.field("id"), String.class);
        if (ntaId == null) return false;

        return actionPermissionService.canExecute(ntaId);
    }

    private void assertCurrentUserIsAdmin() {
        if (!PlmSecurityContext.get().isAdmin()) {
            throw new AccessDeniedException("Only admins can perform this operation");
        }
    }

    // ================================================================
    // Types
    // ================================================================

    public record AttributeOverride(
        boolean editable,
        boolean visible,
        int displayOrder,
        String displaySection
    ) {}

    public static class AccessDeniedException extends com.plm.domain.exception.PlmFunctionalException {
        public AccessDeniedException(String message) { super(message, 403); }
    }
}
