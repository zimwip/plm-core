package com.plm.domain.action;

import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the enriched actions list for the server-driven UI payload.
 *
 * For each node_type_action that is:
 *  - ENABLED
 *  - permitted for the current user × state
 *  - available in the current lifecycle state (TRANSITION filtered by from_state)
 *
 * Returns a list of action descriptors with their full parameter schema.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionService {

    private final DSLContext             dsl;
    private final ActionPermissionService permissionService;

    /**
     * Resolves all actions available to the current user for a given node,
     * enriched with parameter schema (and per-node-type overrides).
     *
     * @param nodeId         the node being described
     * @param nodeTypeId     the node's type
     * @param currentStateId the node's current lifecycle state
     * @param isLocked       whether the node is currently locked
     */
    public List<Map<String, Object>> resolveActionsForNode(
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked
    ) {
        List<Map<String, Object>> result = new ArrayList<>();

        boolean isFrozen = currentStateId != null && Boolean.TRUE.equals(
            dsl.select(DSL.field("is_frozen")).from("lifecycle_state")
               .where(DSL.field("id").eq(currentStateId))
               .fetchOne(r -> r.get("is_frozen", Integer.class) == 1));

        // Load all ENABLED node_type_action rows for this node type,
        // joining with action and (optionally) lifecycle_transition.
        List<Record> ntaRows = dsl.fetch("""
            SELECT
                nta.id               AS nta_id,
                nta.transition_id,
                nta.display_name_override,
                nta.display_order,
                na.id                AS action_id,
                na.action_code,
                na.action_kind,
                na.display_name      AS action_display_name,
                na.display_category,
                na.requires_tx,
                na.handler_ref,
                lt.name              AS transition_name,
                lt.from_state_id
            FROM node_type_action nta
            JOIN action na ON na.id = nta.action_id
            LEFT JOIN lifecycle_transition lt ON lt.id = nta.transition_id
            WHERE nta.node_type_id = ?
              AND nta.status = 'ENABLED'
            ORDER BY nta.display_order, na.display_category
            """, nodeTypeId);

        for (Record row : ntaRows) {
            String actionCode     = row.get("action_code",     String.class);
            String displayCategory= row.get("display_category", String.class);
            String ntaId          = row.get("nta_id",          String.class);
            String transitionId   = row.get("transition_id",   String.class);
            String fromStateId    = row.get("from_state_id",   String.class);

            // Skip structural permission anchors (e.g. act-read) — not UI actions
            if ("STRUCTURAL".equals(displayCategory)) continue;

            // TRANSITION: only if from_state matches current state AND node is not locked.
            // Lifecycle transitions are mutually exclusive with authoring (checkout):
            // you cannot change lifecycle state while an OPEN version is in progress.
            if ("TRANSITION".equals(actionCode)) {
                if (fromStateId == null || !fromStateId.equals(currentStateId)) continue;
                if (isLocked) continue;
            }

            // CHECKOUT: only when not locked and state is not frozen
            if ("CHECKOUT".equals(actionCode)) {
                if (isLocked || isFrozen) continue;
            }

            // CHECKIN: inverse of CHECKOUT — only when node is locked (checked out)
            if ("CHECKIN".equals(actionCode)) {
                if (!isLocked) continue;
            }

            // SIGN: mutually exclusive with authoring — not available while the node
            // is locked (an OPEN version is in progress).
            if ("SIGN".equals(actionCode)) {
                if (isLocked) continue;
            }

            // Permission check
            if (!permissionService.canExecute(ntaId)) continue;

            // Build display name
            String overrideName = row.get("display_name_override", String.class);
            String displayName  = overrideName != null && !overrideName.isBlank()
                ? overrideName
                : ("TRANSITION".equals(actionCode)
                    ? row.get("transition_name", String.class)
                    : row.get("action_display_name", String.class));

            // Build parameter schema
            List<Map<String, Object>> parameters = resolveParameters(
                row.get("action_id", String.class), ntaId);

            Map<String, Object> action = new LinkedHashMap<>();
            action.put("id",              ntaId);
            action.put("actionCode",      actionCode);
            action.put("name",            displayName != null ? displayName : actionCode);
            action.put("displayCategory", row.get("display_category", String.class));
            action.put("requiresTx",      row.get("requires_tx", Integer.class) == 1);
            if (transitionId != null) action.put("transitionId", transitionId);
            action.put("parameters",      parameters);
            result.add(action);
        }

        return result;
    }

    /** Builds the parameter schema list for an action, applying overrides. */
    private List<Map<String, Object>> resolveParameters(String actionId, String nodeTypeActionId) {
        List<Record> params = dsl.select().from("action_parameter")
            .where("action_id = ?", actionId)
            .and("visibility = 'UI_VISIBLE'")
            .orderBy(DSL.field("display_order"))
            .fetch();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Record p : params) {
            String paramId = p.get("id", String.class);

            // Apply override if exists
            Record ov = dsl.select().from("action_param_override")
                .where("node_type_action_id = ?", nodeTypeActionId)
                .and("parameter_id = ?", paramId)
                .fetchOne();

            String allowedValues = ov != null && ov.get("allowed_values", String.class) != null
                ? ov.get("allowed_values", String.class)
                : p.get("allowed_values", String.class);
            String defaultValue = ov != null && ov.get("default_value", String.class) != null
                ? ov.get("default_value", String.class)
                : p.get("default_value", String.class);
            Integer required = ov != null && ov.get("required", Integer.class) != null
                ? ov.get("required", Integer.class)
                : p.get("required", Integer.class);

            Map<String, Object> param = new LinkedHashMap<>();
            param.put("name",           p.get("param_name",   String.class));
            param.put("label",          p.get("param_label",  String.class));
            param.put("type",           p.get("data_type",    String.class));
            param.put("required",       required != null && required == 1);
            param.put("widget",         p.get("widget_type",  String.class));
            param.put("displayOrder",   p.get("display_order", Integer.class));
            if (defaultValue    != null) param.put("default",       defaultValue);
            if (allowedValues   != null) param.put("allowedValues", allowedValues);
            if (p.get("validation_regex", String.class) != null)
                param.put("validationRegex", p.get("validation_regex", String.class));
            if (p.get("tooltip", String.class) != null)
                param.put("tooltip", p.get("tooltip", String.class));
            result.add(param);
        }
        return result;
    }
}
