package com.plm.platform.action;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.action.dto.ActionDescriptor;
import com.plm.platform.action.dto.ActionParameter;
import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardEvaluation;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.authz.AuthzContextProvider;
import com.plm.platform.authz.PermissionCatalogPort;
import com.plm.platform.authz.PolicyPort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionParameterConfig;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Builds the enriched actions list for the server-driven UI payload.
 *
 * Drives from the {@code action} catalog and {@code authorization_policy} as the
 * sole bridge between actions and node types. For LIFECYCLE-scope actions,
 * emits one entry per lifecycle transition wired for the node type.
 *
 * Wired by {@link ActionFrameworkAutoConfiguration}.
 */
@Slf4j
@RequiredArgsConstructor
public class ActionService {

    private final ConfigCache           configCache;
    private final PolicyPort            policyService;
    private final PermissionCatalogPort permissionCatalog;
    private final ActionGuardPort       actionGuardPort;
    private final AuthzContextProvider  authzCtx;
    private final AlgorithmRegistry     algorithmRegistry;
    private final ObjectMapper          objectMapper;

    public List<ActionDescriptor> resolveActionsForNode(
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        List<ActionDescriptor> result = new ArrayList<>();

        String lifecycleId = configCache.getNodeType(nodeTypeId)
            .map(nt -> nt.lifecycleId())
            .orElse(null);

        List<ActionConfig> nodeActions = configCache.getAllActions().stream()
            .filter(a -> "NODE".equals(a.scope()) || "LINK".equals(a.scope()))
            .sorted(Comparator.comparingInt(ActionConfig::displayOrder)
                .thenComparing(a -> a.displayCategory() != null ? a.displayCategory() : ""))
            .toList();

        for (ActionConfig action : nodeActions) {
            ActionDescriptor entry = buildActionEntry(action, null, null, null,
                nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
            if (entry != null) result.add(entry);
        }

        if (lifecycleId != null) {
            List<ActionConfig> lifecycleActions = configCache.getAllActions().stream()
                .filter(a -> "LIFECYCLE".equals(a.scope()))
                .sorted(Comparator.comparingInt(ActionConfig::displayOrder))
                .toList();

            LifecycleConfig lc = configCache.getLifecycle(lifecycleId).orElse(null);
            if (lc != null) {
                Map<String, String> stateColors = lc.states().stream()
                    .filter(s -> s.color() != null)
                    .collect(Collectors.toMap(LifecycleStateConfig::id, LifecycleStateConfig::color,
                        (a, b) -> a));

                for (ActionConfig action : lifecycleActions) {
                    for (LifecycleTransitionConfig tr : lc.transitions()) {
                        String toColor = stateColors.get(tr.toStateId());
                        ActionDescriptor entry = buildActionEntry(action, tr.id(), tr.name(), toColor,
                            nodeId, nodeTypeId, currentStateId, isLocked, isLockedByCurrentUser);
                        if (entry != null) result.add(entry);
                    }
                }
            }
        }

        return result;
    }

    private ActionDescriptor buildActionEntry(
        ActionConfig action, String transitionId, String transitionName, String transitionColor,
        String nodeId, String nodeTypeId, String currentStateId,
        boolean isLocked, boolean isLockedByCurrentUser
    ) {
        String actionId        = action.id();
        String actionCode      = action.actionCode();
        String displayCategory = action.displayCategory();

        if ("STRUCTURAL".equals(displayCategory)) return null;

        var user = authzCtx.currentOrNull();
        boolean isAdmin = user != null && user.isAdmin();
        String userId = user != null ? user.userId() : null;

        ActionGuardContext gCtx = new ActionGuardContext(nodeId, nodeTypeId, currentStateId,
            actionCode, transitionId, isLocked, isLockedByCurrentUser, userId, Map.of());

        GuardEvaluation guardEval = actionGuardPort.evaluate(
            actionCode, actionId, nodeTypeId, transitionId, isAdmin, gCtx);

        if (guardEval.hidden()) return null;

        boolean authorized = checkRequiredPermissions(action, nodeTypeId, transitionId);

        List<GuardViolation> guardViolations = !authorized
            ? List.of(new GuardViolation("unauthorized",
                "You do not have permission to perform this action", GuardEffect.BLOCK))
            : guardEval.violations();

        String displayName = "transition".equals(actionCode) && transitionName != null
            ? transitionName
            : action.displayName();

        ActionHandler handler = algorithmRegistry.hasBean(actionCode)
            ? algorithmRegistry.resolve(actionCode, ActionHandler.class) : null;

        List<ActionParameter> parameters = resolveParameters(action, nodeTypeId, handler, nodeId, transitionId);

        String httpMethod     = "POST";
        String path           = null;
        String bodyShape      = "RAW";
        String jobStatusPath  = null;
        if (handler != null) {
            var route = handler.route().orElse(null);
            if (route != null) {
                httpMethod    = route.httpMethod();
                path          = route.pathTemplate();
                bodyShape     = route.bodyShape();
                jobStatusPath = route.jobStatusPath();
            }
        }

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("authorized", authorized);
        if (displayCategory != null) metadata.put("displayCategory", displayCategory);
        if (transitionId    != null) metadata.put("transitionId",    transitionId);
        if (transitionColor != null) metadata.put("displayColor",    transitionColor);
        String icon = null;
        if (handler != null) {
            Map<String, Object> hints = handler.resolveDisplayHints(nodeId, nodeTypeId, transitionId);
            if (hints != null) {
                metadata.putAll(hints);
                if (hints.get("icon") instanceof String s) icon = s;
            }
        }

        return new ActionDescriptor(
            buildActionKey(actionCode, transitionId),
            displayName != null ? displayName : actionCode,
            action.description(),
            icon,
            httpMethod,
            path,
            bodyShape,
            jobStatusPath,
            parameters,
            false,
            false,
            null,
            guardViolations,
            metadata
        );
    }

    /** Resolves UI parameters for any action code, including GLOBAL scope. */
    public List<ActionParameter> resolveActionParameters(String actionCode) {
        ActionConfig action = configCache.getAllActions().stream()
            .filter(a -> actionCode.equals(a.actionCode()))
            .findFirst().orElse(null);
        if (action == null) return List.of();
        ActionHandler handler = algorithmRegistry.hasBean(actionCode)
            ? algorithmRegistry.resolve(actionCode, ActionHandler.class) : null;
        return resolveParameters(action, null, handler, null, null);
    }

    private String buildActionKey(String actionCode, String transitionId) {
        return transitionId != null ? actionCode + "|" + transitionId : actionCode;
    }

    private boolean checkRequiredPermissions(ActionConfig action,
                                              String nodeTypeId, String transitionId) {
        var user = authzCtx.currentOrNull();
        if (user == null || user.isAdmin()) return true;

        List<String> permCodes = action.requiredPermissions() != null
            ? action.requiredPermissions() : List.of();

        if (permCodes.isEmpty()) {
            String actionCode = action.actionCode();
            String fallbackScope = permissionCatalog.scopeFor(actionCode);
            if (fallbackScope == null) fallbackScope = "GLOBAL";
            return policyService.canExecute(actionCode, fallbackScope, nodeTypeId, transitionId);
        }

        for (String permCode : permCodes) {
            String permScope = permissionCatalog.scopeFor(permCode);
            if (permScope == null) continue;
            if (!policyService.canExecute(permCode, permScope, nodeTypeId, transitionId)) return false;
        }
        return true;
    }

    private List<ActionParameter> resolveParameters(ActionConfig action, String nodeTypeId,
                                                     ActionHandler handler, String nodeId,
                                                     String transitionId) {
        List<ActionParameterConfig> params = action.parameters() != null
            ? action.parameters() : List.of();

        List<ActionParameter> result = params.stream()
            .filter(p -> "UI_VISIBLE".equals(p.visibility()))
            .sorted(Comparator.comparingInt(ActionParameterConfig::displayOrder))
            .map(p -> new ActionParameter(
                p.paramName(),
                p.paramLabel(),
                p.widgetType(),
                p.required(),
                p.defaultValue(),
                parseChoices(p.allowedValues()),
                p.tooltip(),
                p.validationRegex()
            ))
            .collect(Collectors.toCollection(ArrayList::new));

        if (handler != null && !result.isEmpty()) {
            Map<String, String> dynamic = handler.resolveDynamicAllowedValues(nodeId, nodeTypeId, transitionId);
            if (dynamic != null && !dynamic.isEmpty()) {
                result.replaceAll(p -> {
                    String v = dynamic.get(p.name());
                    return v != null
                        ? new ActionParameter(p.name(), p.label(), p.widget(), p.required(),
                            p.defaultValue(), parseChoices(v), p.hint(), p.validationRegex())
                        : p;
                });
            }
        }

        return List.copyOf(result);
    }

    private List<ActionParameter.Choice> parseChoices(String allowedValues) {
        if (allowedValues == null || allowedValues.isBlank()) return List.of();
        String trimmed = allowedValues.trim();
        if (trimmed.startsWith("[")) {
            try {
                List<Map<String, String>> entries = objectMapper.readValue(trimmed,
                    new TypeReference<>() {});
                return entries.stream()
                    .filter(e -> e.get("value") != null)
                    .map(e -> new ActionParameter.Choice(e.get("value"),
                        e.getOrDefault("label", e.get("value"))))
                    .toList();
            } catch (Exception ignored) {}
        }
        return Arrays.stream(trimmed.split(","))
            .map(String::trim)
            .filter(s -> !s.isEmpty())
            .map(s -> new ActionParameter.Choice(s, s))
            .toList();
    }
}
