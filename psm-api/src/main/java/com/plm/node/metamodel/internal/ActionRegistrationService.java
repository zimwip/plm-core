package com.plm.node.metamodel.internal;
import com.plm.node.metamodel.internal.MetaModelCache;

import com.plm.shared.authorization.PlmAction;
import com.plm.action.guard.ActionGuardService;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardService;
import com.plm.shared.security.SecurityContextPort;
import com.plm.shared.event.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Manages the action registry: custom action registration, action permissions,
 * and per-node-type parameter overrides.
 *
 * Actions are generic (defined in {@code action} with a {@code scope}). Wiring
 * to a node type is expressed entirely through {@code action_permission} rows.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionRegistrationService {

    private final DSLContext          dsl;
    private final MetaModelCache      metaModelCache;
    private final PlmEventPublisher   eventPublisher;
    private final SecurityContextPort secCtx;
    private final ActionGuardService   actionGuardService;
    private final LifecycleGuardService lifecycleGuardService;

    // ================================================================
    // ACTION REGISTRY — read
    // ================================================================

    public List<Record> getAllActions() {
        return dsl.select().from("action").orderBy(DSL.field("action_code")).fetch();
    }

    /**
     * Lists actions reachable for a node type. For NODE-scope actions: one row per
     * {@code action} that has at least one {@code action_permission} for this type.
     * For LIFECYCLE-scope: one row per (action × lifecycle_transition) wired to this type.
     *
     * Derived fields:
     *   <ul>
     *     <li>{@code status} — "ENABLED" if any action_permission row exists for the key, else "DISABLED"</li>
     *     <li>{@code inherited} / {@code inherited_from} — always false/null (per-type ownership is flat)</li>
     *   </ul>
     */
    public List<Map<String, Object>> getActionsForNodeType(String nodeTypeId) {
        String lifecycleId = dsl.select(DSL.field("lifecycle_id")).from("node_type")
            .where("id = ?", nodeTypeId)
            .fetchOne(DSL.field("lifecycle_id"), String.class);

        List<Map<String, Object>> out = new java.util.ArrayList<>();

        List<Record> nodeRows = dsl.fetch(
            "SELECT a.id AS action_id, a.action_code, a.action_kind, a.scope, " +
            "       a.display_name, a.display_category, a.requires_tx, a.display_order, a.handler_ref, a.managed_with, " +
            "       EXISTS (SELECT 1 FROM action_permission ap " +
            "               WHERE ap.action_id = a.id " +
            "                 AND (ap.node_type_id = ? OR ap.node_type_id IS NULL) " +
            "                 AND ap.transition_id IS NULL) AS enabled " +
            "FROM action a " +
            "WHERE a.scope = 'NODE' " +
            "ORDER BY a.display_order, a.display_category",
            nodeTypeId);
        for (Record r : nodeRows) {
            out.add(buildActionRow(r, null, null, null,
                Boolean.TRUE.equals(r.get("enabled", Boolean.class)), nodeTypeId));
        }

        if (lifecycleId != null) {
            List<Record> lcRows = dsl.fetch(
                "SELECT a.id AS action_id, a.action_code, a.action_kind, a.scope, " +
                "       a.display_name, a.display_category, a.requires_tx, a.display_order, a.handler_ref, a.managed_with, " +
                "       lt.id AS transition_id, lt.name AS transition_name, ls.name AS from_state_name, " +
                "       EXISTS (SELECT 1 FROM action_permission ap " +
                "               WHERE ap.action_id = a.id " +
                "                 AND (ap.node_type_id = ? OR ap.node_type_id IS NULL) " +
                "                 AND ap.transition_id = lt.id) AS enabled " +
                "FROM action a " +
                "CROSS JOIN lifecycle_transition lt " +
                "LEFT JOIN lifecycle_state ls ON ls.id = lt.from_state_id " +
                "WHERE a.scope = 'LIFECYCLE' " +
                "  AND lt.lifecycle_id = ? " +
                "ORDER BY a.display_order, lt.name",
                nodeTypeId, lifecycleId);
            for (Record r : lcRows) {
                out.add(buildActionRow(r,
                    r.get("transition_id", String.class),
                    r.get("transition_name", String.class),
                    r.get("from_state_name", String.class),
                    Boolean.TRUE.equals(r.get("enabled", Boolean.class)),
                    nodeTypeId));
            }
        }

        return out;
    }

    private Map<String, Object> buildActionRow(Record r, String transitionId,
                                               String transitionName, String fromStateName,
                                               boolean enabled, String nodeTypeId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("action_id",        r.get("action_id",        String.class));
        m.put("action_code",      r.get("action_code",      String.class));
        m.put("action_kind",      r.get("action_kind",      String.class));
        m.put("scope",            r.get("scope",            String.class));
        m.put("display_name",     r.get("display_name",     String.class));
        m.put("display_category", r.get("display_category", String.class));
        m.put("requires_tx",      r.get("requires_tx",      Integer.class));
        m.put("display_order",    r.get("display_order",    Integer.class));
        m.put("handler_ref",      r.get("handler_ref",      String.class));
        m.put("node_type_id",     nodeTypeId);
        m.put("transition_id",    transitionId);
        m.put("transition_name",  transitionName);
        m.put("from_state_name",  fromStateName);
        String managedWith = r.get("managed_with", String.class);
        m.put("managed_with",     managedWith);
        m.put("status",           enabled ? "ENABLED" : "DISABLED");
        m.put("inherited",        false);
        m.put("inherited_from",   null);

        // For manager actions, list managed action codes
        if (managedWith == null) {
            String actionId = r.get("action_id", String.class);
            List<String> managedActions = dsl.select(DSL.field("action_code")).from("action")
                .where("managed_with = ?", actionId)
                .fetch(DSL.field("action_code"), String.class);
            if (!managedActions.isEmpty()) {
                m.put("managed_actions", managedActions);
            }
        }

        return m;
    }

    // ================================================================
    // ACTION REGISTRY — write
    // ================================================================

    /**
     * Registers a custom action and returns its {@code action.id}. The action
     * becomes reachable for a node type only after granting at least one
     * {@code action_permission} row via {@link #setActionPermission}.
     */
    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String registerCustomAction(String actionCode, String displayName, String handlerRef,
                                       String displayCategory, boolean requiresTx,
                                       String description, String scope) {
        String actionId = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);

        if (actionId == null) {
            actionId = UUID.randomUUID().toString();
            dsl.execute("""
                INSERT INTO action
                  (ID, ACTION_CODE, ACTION_KIND, SCOPE, DISPLAY_NAME, DESCRIPTION,
                   HANDLER_REF, DISPLAY_CATEGORY, REQUIRES_TX, IS_DEFAULT, DISPLAY_ORDER, CREATED_AT)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                actionId, actionCode, "CUSTOM",
                scope != null ? scope : "NODE",
                displayName, description,
                handlerRef, displayCategory != null ? displayCategory : "PRIMARY",
                requiresTx ? 1 : 0, 0, 999, LocalDateTime.now());
            log.info("Custom action registered: {} (handler={} scope={})",
                actionCode, handlerRef, scope);
        }

        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return actionId;
    }

    // ================================================================
    // ACTION PERMISSIONS
    // ================================================================

    /**
     * Grants a role permission to execute an action for a node type
     * (optionally scoped to a transition).
     */
    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void setActionPermission(String nodeTypeId, String actionCode,
                                    String transitionId, String roleId) {
        String psId = secCtx.requireProjectSpaceId();
        String actionId = resolveActionId(actionCode);
        assertNotManaged(actionId, actionCode);

        deleteActionPermissionRow(nodeTypeId, actionId, roleId, psId, transitionId);
        dsl.execute(
            "INSERT INTO action_permission (ID, ACTION_ID, PROJECT_SPACE_ID, ROLE_ID, NODE_TYPE_ID, TRANSITION_ID) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID().toString(), actionId, psId, roleId, nodeTypeId, transitionId);
        log.info("ActionPermission set: nodeType={} action={} role={} transition={} ps={}",
            nodeTypeId, actionId, roleId, transitionId, psId);
    }

    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void removeActionPermission(String nodeTypeId, String actionCode,
                                       String transitionId, String roleId) {
        String psId = secCtx.requireProjectSpaceId();
        String actionId = resolveActionId(actionCode);
        assertNotManaged(actionId, actionCode);
        deleteActionPermissionRow(nodeTypeId, actionId, roleId, psId, transitionId);
    }

    public List<Map<String, Object>> getActionPermissions(String nodeTypeId, String actionCode,
                                                          String transitionId) {
        String psId = secCtx.requireProjectSpaceId();
        String actionId = resolveActionId(actionCode);

        if (transitionId != null) {
            return dsl.fetch("""
                SELECT id, role_id, transition_id
                FROM action_permission
                WHERE node_type_id = ? AND action_id = ? AND project_space_id = ? AND transition_id = ?
                ORDER BY role_id
                """, nodeTypeId, actionId, psId, transitionId).intoMaps();
        }
        return dsl.fetch("""
            SELECT id, role_id, transition_id
            FROM action_permission
            WHERE node_type_id = ? AND action_id = ? AND project_space_id = ? AND transition_id IS NULL
            ORDER BY role_id
            """, nodeTypeId, actionId, psId).intoMaps();
    }

    // ================================================================
    // PARAM OVERRIDES
    // ================================================================

    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void setNodeActionParamOverride(String nodeTypeId, String actionCode, String parameterId,
                                           String defaultValue, String allowedValues,
                                           Integer required) {
        String actionId = resolveActionId(actionCode);
        dsl.execute(
            "DELETE FROM action_param_override WHERE node_type_id = ? AND action_id = ? AND parameter_id = ?",
            nodeTypeId, actionId, parameterId);
        dsl.execute("""
            INSERT INTO action_param_override
              (ID, NODE_TYPE_ID, ACTION_ID, PARAMETER_ID, DEFAULT_VALUE, ALLOWED_VALUES, REQUIRED)
            VALUES (?,?,?,?,?,?,?)
            """, UUID.randomUUID().toString(), nodeTypeId, actionId, parameterId,
            defaultValue, allowedValues, required);
    }

    // ================================================================
    // Helpers — called by MetaModelService
    // ================================================================

    /**
     * Copies all action_permission rows from parentNodeTypeId to childNodeTypeId.
     * Called at child type creation so the child immediately has the same access rights.
     */
    public void copyActionPermissionsFromParent(String childNodeTypeId, String parentNodeTypeId) {
        List<Record> rows = dsl.select()
            .from("action_permission")
            .where("node_type_id = ?", parentNodeTypeId)
            .fetch();
        for (Record r : rows) {
            String newId = UUID.randomUUID().toString();
            dsl.execute(
                "INSERT INTO action_permission (id, action_id, project_space_id, role_id, node_type_id, transition_id) VALUES (?,?,?,?,?,?)",
                newId,
                r.get("action_id",        String.class),
                r.get("project_space_id", String.class),
                r.get("role_id",          String.class),
                childNodeTypeId,
                r.get("transition_id",    String.class)
            );
        }
        log.info("Copied {} action_permission rows from {} to {}", rows.size(), parentNodeTypeId, childNodeTypeId);
    }

    // ================================================================
    // Private helpers
    // ================================================================

    // ================================================================
    // MANAGED_WITH — admin management
    // ================================================================

    /**
     * Sets or clears managed_with on an action.
     * When setting: validates manager exists, scope matches, no chaining.
     * Deletes all guards and permissions from the managed action.
     */
    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public Map<String, Object> setManagedWith(String actionId, String managedWithId) {
        Record action = dsl.select(DSL.field("id"), DSL.field("scope"), DSL.field("action_code"))
            .from("action").where("id = ?", actionId).fetchOne();
        if (action == null) throw new IllegalArgumentException("Unknown action: " + actionId);

        int deletedGuards = 0;
        int deletedPerms  = 0;

        if (managedWithId != null) {
            // Validate manager exists
            Record manager = dsl.select(DSL.field("id"), DSL.field("scope"), DSL.field("managed_with"))
                .from("action").where("id = ?", managedWithId).fetchOne();
            if (manager == null)
                throw new IllegalArgumentException("Manager action not found: " + managedWithId);

            // Scope must match
            if (!action.get("scope", String.class).equals(manager.get("scope", String.class)))
                throw new IllegalArgumentException("Scope mismatch: managed action scope must match manager scope");

            // No chaining
            if (manager.get("managed_with", String.class) != null)
                throw new IllegalArgumentException("Cannot chain: manager action is itself managed");

            // Cannot manage self
            if (actionId.equals(managedWithId))
                throw new IllegalArgumentException("Action cannot manage itself");

            // Clean up HIDE guards only — BLOCK guards belong to the managee
            deletedGuards += dsl.execute("DELETE FROM action_guard WHERE action_id = ? AND effect = 'HIDE'", actionId);
            deletedGuards += dsl.execute("DELETE FROM node_action_guard WHERE action_id = ? AND effect = 'HIDE'", actionId);
            deletedPerms   = dsl.execute("DELETE FROM action_permission WHERE action_id = ?", actionId);
        }

        dsl.execute("UPDATE action SET managed_with = ? WHERE id = ?", managedWithId, actionId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());

        log.info("Action {} managed_with set to {} (deleted {} guards, {} permissions)",
            actionId, managedWithId, deletedGuards, deletedPerms);

        return Map.of(
            "actionId", actionId,
            "managedWith", managedWithId != null ? managedWithId : "",
            "deletedGuards", deletedGuards,
            "deletedPermissions", deletedPerms);
    }

    /** Lists actions managed by a given manager action. */
    public List<Map<String, Object>> getManagedActions(String managerActionId) {
        return dsl.select(DSL.field("id"), DSL.field("action_code"), DSL.field("display_name"))
            .from("action")
            .where("managed_with = ?", managerActionId)
            .fetch()
            .map(r -> Map.<String, Object>of(
                "id",          r.get("id",           String.class),
                "actionCode",  r.get("action_code",  String.class),
                "displayName", r.get("display_name", String.class)));
    }

    // ================================================================
    // Private helpers
    // ================================================================

    private String resolveActionId(String actionCode) {
        String id = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);
        if (id == null) throw new IllegalArgumentException("Unknown action: " + actionCode);
        return id;
    }

    private void assertNotManaged(String actionId, String actionCode) {
        String managedWith = dsl.select(DSL.field("managed_with")).from("action")
            .where("id = ?", actionId)
            .fetchOne(DSL.field("managed_with"), String.class);
        if (managedWith != null) {
            throw new IllegalArgumentException(
                "Cannot modify permissions on managed action '" + actionCode +
                "' — configure on manager action instead");
        }
    }

    private void deleteActionPermissionRow(String nodeTypeId, String actionId,
                                           String roleId, String psId, String transitionId) {
        if (nodeTypeId != null && transitionId != null) {
            dsl.execute(
                "DELETE FROM action_permission WHERE action_id = ? AND role_id = ? " +
                "AND project_space_id = ? AND node_type_id = ? AND transition_id = ?",
                actionId, roleId, psId, nodeTypeId, transitionId);
        } else if (nodeTypeId != null) {
            dsl.execute(
                "DELETE FROM action_permission WHERE action_id = ? AND role_id = ? " +
                "AND project_space_id = ? AND node_type_id = ? AND transition_id IS NULL",
                actionId, roleId, psId, nodeTypeId);
        } else {
            dsl.execute(
                "DELETE FROM action_permission WHERE action_id = ? AND role_id = ? " +
                "AND project_space_id = ? AND node_type_id IS NULL AND transition_id IS NULL",
                actionId, roleId, psId);
        }
    }
}
