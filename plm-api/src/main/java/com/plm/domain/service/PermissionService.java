package com.plm.domain.service;

import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

/**
 * Vérification des permissions PLM basées sur les rôles.
 *
 * Règle fondamentale : les permissions de rôle peuvent RESTREINDRE
 * mais jamais ÉLARGIR les droits définis par l'état lifecycle.
 *
 * Hiérarchie de résolution :
 *   1. Admin → tout est permis
 *   2. NodeTypePermission → droits de base sur le type de noeud
 *   3. État lifecycle → restreint editable/required sur les attributs
 *   4. Vue active → restreint encore la visibilité/édition
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PermissionService {

    private final DSLContext dsl;

    // ================================================================
    // PERMISSIONS NOEUDS
    // ================================================================

    public void assertCanRead(String nodeId) {
        assertPermission(nodeId, "can_read", "READ");
    }

    public void assertCanWrite(String nodeId) {
        assertPermission(nodeId, "can_write", "WRITE");
    }

    public void assertCanSign(String nodeId) {
        assertPermission(nodeId, "can_sign", "SIGN");
    }

    public void assertCanBaseline(String nodeId) {
        assertPermission(nodeId, "can_baseline", "BASELINE");
    }

    public boolean canWrite(String nodeId) {
        return checkPermission(nodeId, "can_write");
    }

    public boolean canSign(String nodeId) {
        return checkPermission(nodeId, "can_sign");
    }

    // ================================================================
    // PERMISSIONS TRANSITIONS
    // ================================================================

    /**
     * Vérifie que l'utilisateur courant a le droit de déclencher une transition.
     * Si aucune transition_permission n'est définie → tout le monde peut transitionner.
     */
    public void assertCanTransition(String transitionId) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return;

        // Vérifier s'il y a des permissions définies sur cette transition
        int ruleCount = dsl.fetchCount(
            dsl.selectOne()
               .from("transition_permission")
               .where("transition_id = ?", transitionId)
        );

        // Pas de règles = ouvert à tous
        if (ruleCount == 0) return;

        // Vérifier que l'utilisateur a un des rôles autorisés
        int allowed = dsl.fetchCount(
            dsl.selectOne()
               .from("transition_permission tp")
               .where("tp.transition_id = ?", transitionId)
               .and("tp.role_id IN (" + placeholders(ctx.getRoleIds().size()) + ")",
                    ctx.getRoleIds().toArray())
        );

        if (allowed == 0) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot trigger transition " + transitionId
            );
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

    public void setNodeTypePermission(
        String roleId, String nodeTypeId,
        boolean canRead, boolean canWrite,
        boolean canTransition, boolean canSign,
        boolean canCreateLink, boolean canBaseline
    ) {
        assertCurrentUserIsAdmin();
        // Upsert
        dsl.execute(
            "DELETE FROM node_type_permission WHERE role_id = ? AND node_type_id = ?",
            roleId, nodeTypeId
        );
        dsl.execute("""
            INSERT INTO node_type_permission
              (ID, ROLE_ID, NODE_TYPE_ID, CAN_READ, CAN_WRITE, CAN_TRANSITION, CAN_SIGN, CAN_CREATE_LINK, CAN_BASELINE)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            java.util.UUID.randomUUID().toString(), roleId, nodeTypeId,
            canRead ? 1 : 0, canWrite ? 1 : 0, canTransition ? 1 : 0,
            canSign ? 1 : 0, canCreateLink ? 1 : 0, canBaseline ? 1 : 0
        );
        log.info("NodeTypePermission set: role={} nodeType={}", roleId, nodeTypeId);
    }

    public void setTransitionPermission(String transitionId, String roleId) {
        assertCurrentUserIsAdmin();
        dsl.execute(
            "INSERT INTO transition_permission (ID, TRANSITION_ID, ROLE_ID) VALUES (?,?,?)",
            java.util.UUID.randomUUID().toString(), transitionId, roleId
        );
    }

    public String createView(String nodeTypeId, String name, String description,
                             String eligibleRoleId, String eligibleStateId, int priority) {
        assertCurrentUserIsAdmin();
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

    public void setViewOverride(String viewId, String attributeDefId,
                                Boolean visible, Boolean editable,
                                Integer displayOrder, String displaySection) {
        assertCurrentUserIsAdmin();
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

    private void assertPermission(String nodeId, String column, String action) {
        if (!checkPermission(nodeId, column)) {
            PlmUserContext ctx = PlmSecurityContext.get();
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot " + action + " node " + nodeId
            );
        }
    }

    private boolean checkPermission(String nodeId, String column) {
        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return true;
        if (ctx.getRoleIds().isEmpty()) return false;

        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
                               .fetchOne("node_type_id", String.class);

        int allowed = dsl.fetchCount(
            dsl.selectOne()
               .from("node_type_permission")
               .where("node_type_id = ?", nodeTypeId)
               .and("role_id IN (" + placeholders(ctx.getRoleIds().size()) + ")",
                    ctx.getRoleIds().toArray())
               .and(column + " = 1")
        );

        return allowed > 0;
    }

    private void assertCurrentUserIsAdmin() {
        if (!PlmSecurityContext.get().isAdmin()) {
            throw new AccessDeniedException("Only admins can perform this operation");
        }
    }

    private String placeholders(int count) {
        return String.join(",", java.util.Collections.nCopies(count, "?"));
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
