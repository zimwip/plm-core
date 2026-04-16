package com.plm.domain.service;

import com.plm.infrastructure.PlmEventPublisher;
import com.plm.infrastructure.security.PlmAction;
import com.plm.infrastructure.security.PlmSecurityContext;
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
 * Manages the action registry: custom action registration, node_type_action wiring,
 * action permissions, and parameter overrides.
 *
 * Extracted from MetaModelService to separate action-registry concerns from
 * lifecycle/node-type/attribute management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionRegistrationService {

    private final DSLContext         dsl;
    private final MetaModelCache     metaModelCache;
    private final PlmEventPublisher  eventPublisher;

    // ================================================================
    // ACTION REGISTRY — read
    // ================================================================

    public List<Record> getAllActions() {
        return dsl.select().from("action").orderBy(DSL.field("action_code")).fetch();
    }

    public List<Map<String, Object>> getActionsForNodeType(String nodeTypeId) {
        List<Record> rows = dsl.fetch(
            "SELECT nta.id AS nta_id, nta.node_type_id AS nta_node_type_id, " +
            "       nta.status, nta.display_name_override, nta.display_order, nta.transition_id, " +
            "       na.id AS action_id, na.action_code, na.action_kind, na.scope, " +
            "       na.display_name, na.display_category, na.requires_tx, na.handler_ref, " +
            "       lt.name AS transition_name, ls.name AS from_state_name " +
            "FROM node_type_action nta " +
            "JOIN action na ON na.id = nta.action_id " +
            "LEFT JOIN lifecycle_transition lt ON lt.id = nta.transition_id " +
            "LEFT JOIN lifecycle_state ls ON ls.id = lt.from_state_id " +
            "WHERE nta.node_type_id = ? " +
            "ORDER BY nta.display_order, na.display_category",
            nodeTypeId);

        return rows.stream().map(row -> {
            Map<String, Object> m = new LinkedHashMap<>(row.intoMap());
            m.put("inherited", false);
            m.put("inherited_from", null);
            return m;
        }).collect(Collectors.toList());
    }

    // ================================================================
    // ACTION REGISTRY — write
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String registerCustomAction(String nodeTypeId, String actionCode,
                                       String displayName, String handlerRef,
                                       String displayCategory, boolean requiresTx,
                                       String description) {
        String actionId = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);

        if (actionId == null) {
            actionId = UUID.randomUUID().toString();
            dsl.execute("""
                INSERT INTO action
                  (ID, ACTION_CODE, ACTION_KIND, DISPLAY_NAME, DESCRIPTION,
                   HANDLER_REF, DISPLAY_CATEGORY, REQUIRES_TX, IS_DEFAULT, CREATED_AT)
                VALUES (?,?,?,?,?,?,?,?,?,?)
                """,
                actionId, actionCode, "CUSTOM", displayName, description,
                handlerRef, displayCategory != null ? displayCategory : "PRIMARY",
                requiresTx ? 1 : 0, 0, LocalDateTime.now());
            log.info("Custom action registered: {} (handler={})", actionCode, handlerRef);
        }

        String ntaId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_type_action (ID, NODE_TYPE_ID, ACTION_ID, STATUS, DISPLAY_ORDER)
            VALUES (?,?,?,?,?)
            """, ntaId, nodeTypeId, actionId, "ENABLED", 999);
        log.info("Action {} enabled for nodeType {}", actionCode, nodeTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(PlmSecurityContext.get().getUserId());
        return ntaId;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void setNodeTypeActionStatus(String nodeTypeActionId, String status) {
        if (!"ENABLED".equals(status) && !"DISABLED".equals(status))
            throw new IllegalArgumentException("status must be ENABLED or DISABLED");
        dsl.execute("UPDATE node_type_action SET STATUS = ? WHERE ID = ?", status, nodeTypeActionId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(PlmSecurityContext.get().getUserId());
    }

    // ================================================================
    // ACTION PERMISSIONS
    // ================================================================

    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void setNodeTypeActionPermission(String nodeTypeActionId, String roleId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();
        var derived = resolveNtaForPermission(nodeTypeActionId);
        String nodeTypeId   = derived[0];
        String actionId     = derived[1];
        String transitionId = derived[2];

        deleteActionPermissionRow(nodeTypeId, actionId, roleId, psId, transitionId);
        dsl.execute(
            "INSERT INTO action_permission (ID, ACTION_ID, PROJECT_SPACE_ID, ROLE_ID, NODE_TYPE_ID, TRANSITION_ID) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID().toString(), actionId, psId, roleId, nodeTypeId, transitionId);
        log.info("ActionPermission set: nodeType={} action={} role={} transition={} ps={}",
            nodeTypeId, actionId, roleId, transitionId, psId);
    }

    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void removeNodeTypeActionPermission(String nodeTypeActionId, String roleId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();
        var derived = resolveNtaForPermission(nodeTypeActionId);
        deleteActionPermissionRow(derived[0], derived[1], roleId, psId, derived[2]);
    }

    public List<Map<String, Object>> getNodeTypeActionPermissions(String nodeTypeActionId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();
        var derived = resolveNtaForPermission(nodeTypeActionId);
        String nodeTypeId   = derived[0];
        String actionId     = derived[1];
        String transitionId = derived[2];

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
    public void setNodeActionParamOverride(String nodeTypeActionId, String parameterId,
                                            String defaultValue, String allowedValues,
                                            Integer required) {
        dsl.execute(
            "DELETE FROM action_param_override WHERE node_type_action_id = ? AND parameter_id = ?",
            nodeTypeActionId, parameterId);
        dsl.execute("""
            INSERT INTO action_param_override
              (ID, NODE_TYPE_ACTION_ID, PARAMETER_ID, DEFAULT_VALUE, ALLOWED_VALUES, REQUIRED)
            VALUES (?,?,?,?,?,?)
            """, UUID.randomUUID().toString(), nodeTypeActionId, parameterId,
            defaultValue, allowedValues, required);
    }

    // ================================================================
    // Helpers — called by MetaModelService for copyActionPermissionsFromParent
    // ================================================================

    /**
     * Copies all node-scoped action_permission rows from parentNodeTypeId to childNodeTypeId.
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

    private String[] resolveNtaForPermission(String nodeTypeActionId) {
        var row = dsl.select(
                DSL.field("nta.node_type_id").as("node_type_id"),
                DSL.field("nta.action_id").as("action_id"),
                DSL.field("nta.transition_id").as("transition_id"))
            .from("node_type_action nta")
            .where("nta.id = ?", nodeTypeActionId)
            .fetchOne();
        if (row == null) throw new IllegalArgumentException("Unknown node_type_action: " + nodeTypeActionId);
        return new String[]{
            row.get("node_type_id",  String.class),
            row.get("action_id",     String.class),
            row.get("transition_id", String.class)
        };
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
