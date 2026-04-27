package com.plm.action;


import com.plm.action.guard.ActionGuardContext;
import com.plm.action.guard.ActionGuardService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionParamOverrideConfig;
import com.plm.platform.config.dto.ActionParameterConfig;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.authz.PermissionCatalogPort;
import com.plm.platform.authz.PolicyPort;
import com.plm.shared.guard.GuardEvaluation;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds the enriched actions list for the server-driven UI payload.
 *
 * Drives from the {@code action} catalog and {@code authorization_policy} as the
 * sole bridge between actions and node types. For LIFECYCLE-scope actions,
 * emits one entry per lifecycle transition wired for the node type.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionService {

    private final ConfigCache           configCache;
    private final PolicyPort              policyService;
    private final PermissionCatalogPort   permissionCatalog;
    private final ActionGuardService      actionGuardService;
    private final SecurityContextPort     secCtx;
    private final AlgorithmRegistry       algorithmRegistry;

    public List<Map<String, Object>> resolveActionsForNode(
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        List<Map<String, Object>> result = new ArrayList<>();

        String lifecycleId = configCache.getNodeType(nodeTypeId)
            .map(nt -> nt.lifecycleId())
            .orElse(null);

        // NODE-scope actions: one entry per action, sorted by displayOrder then displayCategory
        List<ActionConfig> nodeActions = configCache.getAllActions().stream()
            .filter(a -> "NODE".equals(a.scope()))
            .sorted(Comparator.comparingInt(ActionConfig::displayOrder)
                .thenComparing(a -> a.displayCategory() != null ? a.displayCategory() : ""))
            .toList();

        for (ActionConfig action : nodeActions) {
            Map<String, Object> entry = buildActionEntry(action, null, null,
                nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
            if (entry != null) result.add(entry);
        }

        // LIFECYCLE-scope actions: one entry per (action × transition) in this lifecycle
        if (lifecycleId != null) {
            List<ActionConfig> lifecycleActions = configCache.getAllActions().stream()
                .filter(a -> "LIFECYCLE".equals(a.scope()))
                .sorted(Comparator.comparingInt(ActionConfig::displayOrder))
                .toList();

            List<LifecycleTransitionConfig> transitions = configCache.getLifecycle(lifecycleId)
                .map(LifecycleConfig::transitions)
                .orElse(List.of());

            for (ActionConfig action : lifecycleActions) {
                for (LifecycleTransitionConfig tr : transitions) {
                    Map<String, Object> entry = buildActionEntry(action, tr.id(), tr.name(),
                        nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
                    if (entry != null) result.add(entry);
                }
            }
        }

        return result;
    }

    private Map<String, Object> buildActionEntry(
        ActionConfig action, String transitionId, String transitionName,
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        String actionId        = action.id();
        String actionCode      = action.actionCode();
        String displayCategory = action.displayCategory();

        if ("STRUCTURAL".equals(displayCategory)) return null;

        // Always evaluate guards — HIDE guards are structural (e.g. wrong-state transitions)
        // and must filter even when authorization fails.
        boolean isAdmin = secCtx.currentUser().isAdmin();
        ActionGuardContext gCtx = new ActionGuardContext(nodeId, nodeTypeId, currentStateId,
            actionCode, transitionId, isLocked, isLockedByCurrentUser,
            secCtx.currentUser().getUserId(), Map.of());

        GuardEvaluation guardEval = actionGuardService.evaluate(
            actionId, nodeTypeId, transitionId, isAdmin, gCtx);

        if (guardEval.hidden()) return null;

        // Check required permissions via ActionConfig.requiredPermissions()
        boolean authorized = checkRequiredPermissions(action, nodeTypeId, transitionId);

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

        String displayName = "transition".equals(actionCode) && transitionName != null
            ? transitionName
            : action.displayName();

        List<Map<String, Object>> parameters = resolveParameters(action, nodeTypeId);

        // Overlay dynamic allowedValues from handler (e.g. assign_domain domain list)
        if (algorithmRegistry.hasBean(actionCode) && !parameters.isEmpty()) {
            ActionHandler handler = algorithmRegistry.resolve(actionCode, ActionHandler.class);
            Map<String, String> dynamic = handler.resolveDynamicAllowedValues(nodeId, nodeTypeId, transitionId);
            if (dynamic != null && !dynamic.isEmpty()) {
                for (Map<String, Object> param : parameters) {
                    String pname = (String) param.get("name");
                    String v = dynamic.get(pname);
                    if (v != null) param.put("allowedValues", v);
                }
            }
        }

        Map<String, Object> entry = new LinkedHashMap<>();
        entry.put("id",              buildActionKey(actionCode, transitionId));
        entry.put("actionCode",      actionCode);
        entry.put("name",            displayName != null ? displayName : actionCode);
        entry.put("displayCategory", displayCategory);
        entry.put("authorized",      authorized);
        if (transitionId != null) entry.put("transitionId", transitionId);
        entry.put("parameters",      parameters);
        entry.put("guardViolations", guardViolations);

        // Display hints from handler (e.g. transition target state color)
        if (algorithmRegistry.hasBean(actionCode)) {
            ActionHandler handler = algorithmRegistry.resolve(actionCode, ActionHandler.class);
            Map<String, Object> hints = handler.resolveDisplayHints(nodeId, nodeTypeId, transitionId);
            if (hints != null && !hints.isEmpty()) {
                entry.putAll(hints);
            }
        }

        return entry;
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

    /**
     * Checks all required permissions for an action via {@link ActionConfig#requiredPermissions()}.
     * Returns true only if ALL required permissions pass.
     */
    private boolean checkRequiredPermissions(ActionConfig action,
                                             String nodeTypeId, String transitionId) {
        if (secCtx.currentUser().isAdmin()) return true;

        List<String> permCodes = action.requiredPermissions() != null
            ? action.requiredPermissions() : List.of();

        if (permCodes.isEmpty()) {
            // No required permissions configured — fall back to direct permission check
            // using action_code as permission_code, resolving scope from permission catalog
            String actionCode = action.actionCode();
            String fallbackScope = permissionCatalog.scopeFor(actionCode);
            if (fallbackScope == null) fallbackScope = "GLOBAL";
            return policyService.canExecute(actionCode, fallbackScope, nodeTypeId, transitionId);
        }

        for (String permCode : permCodes) {
            String permScope = permissionCatalog.scopeFor(permCode);
            if (permScope == null) continue;

            if (!policyService.canExecute(permCode, permScope, nodeTypeId, transitionId)) {
                return false;
            }
        }
        return true;
    }

    /** Builds the parameter schema list for an action, applying per-node-type overrides. */
    private List<Map<String, Object>> resolveParameters(ActionConfig action, String nodeTypeId) {
        List<ActionParameterConfig> params = action.parameters() != null
            ? action.parameters() : List.of();

        // Filter to UI_VISIBLE and sort by displayOrder
        List<ActionParameterConfig> visibleParams = params.stream()
            .filter(p -> "UI_VISIBLE".equals(p.visibility()))
            .sorted(Comparator.comparingInt(ActionParameterConfig::displayOrder))
            .toList();

        // Index overrides by parameterId for this nodeType
        Map<String, ActionParamOverrideConfig> overridesByParamId = new HashMap<>();
        List<ActionParamOverrideConfig> overrides = action.paramOverrides() != null
            ? action.paramOverrides() : List.of();
        for (ActionParamOverrideConfig ov : overrides) {
            if (nodeTypeId.equals(ov.nodeTypeId())) {
                overridesByParamId.put(ov.parameterId(), ov);
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (ActionParameterConfig p : visibleParams) {
            ActionParamOverrideConfig ov = overridesByParamId.get(p.id());

            String allowedValues = ov != null && ov.allowedValues() != null
                ? ov.allowedValues()
                : p.allowedValues();
            String defaultValue = ov != null && ov.defaultValue() != null
                ? ov.defaultValue()
                : p.defaultValue();
            boolean required = ov != null && ov.required() != null
                ? ov.required()
                : p.required();

            Map<String, Object> param = new LinkedHashMap<>();
            param.put("name",           p.paramName());
            param.put("label",          p.paramLabel());
            param.put("type",           p.dataType());
            param.put("required",       required);
            param.put("widget",         p.widgetType());
            param.put("displayOrder",   p.displayOrder());
            if (defaultValue    != null) param.put("default",       defaultValue);
            if (allowedValues   != null) param.put("allowedValues", allowedValues);
            if (p.validationRegex() != null)
                param.put("validationRegex", p.validationRegex());
            if (p.tooltip() != null)
                param.put("tooltip", p.tooltip());
            result.add(param);
        }
        return result;
    }
}
