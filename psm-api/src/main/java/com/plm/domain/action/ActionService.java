package com.plm.domain.action;

import com.plm.domain.guard.GuardContext;
import com.plm.domain.guard.GuardEvaluation;
import com.plm.domain.guard.GuardService;
import com.plm.domain.security.SecurityContextPort;
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
 * Drives from the {@code action} catalog and {@code action_permission} as the
 * sole bridge between actions and node types. For LIFECYCLE-scope actions,
 * emits one entry per lifecycle transition wired for the node type.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionService {

    private final DSLContext              dsl;
    private final ActionPermissionService permissionService;
    private final GuardService            guardService;
    private final SecurityContextPort     secCtx;

    public List<Map<String, Object>> resolveActionsForNode(
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        List<Map<String, Object>> result = new ArrayList<>();

        String lifecycleId = dsl.select(DSL.field("lifecycle_id")).from("node_type")
            .where("id = ?", nodeTypeId)
            .fetchOne(DSL.field("lifecycle_id"), String.class);

        // NODE-scope actions: one row per action (permission checked later by canExecute)
        List<Record> nodeActions = dsl.fetch(
            "SELECT a.id AS action_id, a.action_code, a.action_kind, a.scope, " +
            "       a.display_name, a.display_category, a.requires_tx, a.display_order, a.handler_ref " +
            "FROM action a " +
            "WHERE a.scope = 'NODE' " +
            "ORDER BY a.display_order, a.display_category");

        for (Record row : nodeActions) {
            Map<String, Object> action = buildActionEntry(row, null, null,
                nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
            if (action != null) result.add(action);
        }

        // LIFECYCLE-scope actions: one row per (action × transition) in this lifecycle
        if (lifecycleId != null) {
            List<Record> lifecycleActions = dsl.fetch(
                "SELECT a.id AS action_id, a.action_code, a.action_kind, a.scope, " +
                "       a.display_name, a.display_category, a.requires_tx, a.display_order, a.handler_ref, " +
                "       lt.id AS transition_id, lt.name AS transition_name " +
                "FROM action a " +
                "CROSS JOIN lifecycle_transition lt " +
                "WHERE a.scope = 'LIFECYCLE' " +
                "  AND lt.lifecycle_id = ? " +
                "ORDER BY a.display_order, lt.name",
                lifecycleId);

            for (Record row : lifecycleActions) {
                String transitionId   = row.get("transition_id",   String.class);
                String transitionName = row.get("transition_name", String.class);
                Map<String, Object> action = buildActionEntry(row, transitionId, transitionName,
                    nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
                if (action != null) result.add(action);
            }
        }

        return result;
    }

    private Map<String, Object> buildActionEntry(
        Record row, String transitionId, String transitionName,
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        String actionId        = row.get("action_id",       String.class);
        String actionCode      = row.get("action_code",     String.class);
        String scope           = row.get("scope",           String.class);
        String displayCategory = row.get("display_category", String.class);

        if ("STRUCTURAL".equals(displayCategory)) return null;

        // Always evaluate guards — HIDE guards are structural (e.g. wrong-state transitions)
        // and must filter even when authorization fails.
        boolean isAdmin = secCtx.currentUser().isAdmin();
        GuardContext gCtx = new GuardContext(nodeId, nodeTypeId, currentStateId,
            actionCode, transitionId, isLocked, isLockedByCurrentUser,
            secCtx.currentUser().getUserId(), Map.of());
        GuardEvaluation guardEval = guardService.evaluate(actionId, nodeTypeId, transitionId, isAdmin, gCtx);

        if (guardEval.hidden()) return null;

        boolean authorized = permissionService.canExecute(actionId, scope, nodeTypeId, transitionId);

        List<Map<String, Object>> guardViolations;
        if (!authorized) {
            guardViolations = List.of(Map.of(
                "guardCode", "unauthorized",
                "message",   "You do not have permission to perform this action"));
        } else if (!guardEval.violations().isEmpty()) {
            guardViolations = guardEval.violations().stream()
                .map(v -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("guardCode", v.guardCode());
                    m.put("message", v.message());
                    if (v.fieldRef() != null) m.put("fieldRef", v.fieldRef());
                    if (!v.details().isEmpty()) m.put("details", v.details());
                    return (Map<String, Object>) m;
                }).toList();
        } else {
            guardViolations = List.of();
        }

        String displayName = "TRANSITION".equals(actionCode) && transitionName != null
            ? transitionName
            : row.get("display_name", String.class);

        List<Map<String, Object>> parameters = resolveParameters(actionId, nodeTypeId);

        Map<String, Object> action = new LinkedHashMap<>();
        action.put("id",              buildActionKey(actionCode, transitionId));
        action.put("actionCode",      actionCode);
        action.put("name",            displayName != null ? displayName : actionCode);
        action.put("displayCategory", displayCategory);
        action.put("requiresTx",      row.get("requires_tx", Integer.class) == 1);
        action.put("authorized",      authorized);
        if (transitionId != null) action.put("transitionId", transitionId);
        action.put("parameters",      parameters);
        action.put("guardViolations", guardViolations);

        return action;
    }

    /**
     * Composite identifier emitted to the UI. Matches the path segment the client
     * POSTs back in {@code POST /api/psm/nodes/{id}/actions/{id}}. For LIFECYCLE
     * actions, includes the transitionId so the dispatcher knows which transition
     * to fire.
     */
    private String buildActionKey(String actionCode, String transitionId) {
        return transitionId != null ? actionCode + "|" + transitionId : actionCode;
    }

    /** Builds the parameter schema list for an action, applying per-node-type overrides. */
    private List<Map<String, Object>> resolveParameters(String actionId, String nodeTypeId) {
        List<Record> params = dsl.select().from("action_parameter")
            .where("action_id = ?", actionId)
            .and("visibility = 'UI_VISIBLE'")
            .orderBy(DSL.field("display_order"))
            .fetch();

        Map<String, Record> overridesByParamId = new java.util.HashMap<>();
        dsl.select().from("action_param_override")
            .where("node_type_id = ?", nodeTypeId)
            .and("action_id = ?", actionId)
            .fetch()
            .forEach(ov -> overridesByParamId.put(ov.get("parameter_id", String.class), ov));

        List<Map<String, Object>> result = new ArrayList<>();
        for (Record p : params) {
            Record ov = overridesByParamId.get(p.get("id", String.class));

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
