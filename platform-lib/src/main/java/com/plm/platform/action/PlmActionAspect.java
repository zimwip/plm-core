package com.plm.platform.action;

import com.plm.platform.authz.AuthzContext;
import com.plm.platform.authz.AuthzContextProvider;
import com.plm.platform.authz.PermissionCatalogPort;
import com.plm.platform.authz.PolicyDeniedException;
import com.plm.platform.authz.PolicyPort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.ActionGuardPort;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static com.plm.platform.authz.PermissionScope.GLOBAL_CODE;
import static com.plm.platform.authz.PermissionScope.LIFECYCLE_CODE;
import static com.plm.platform.authz.PermissionScope.NODE_CODE;

/**
 * Generic AOP aspect for {@link PlmAction}-annotated service methods.
 *
 * Fires at @Order(2) — after PlmPermissionAspect (@Order 1).
 *
 * Resolution is fully scope-driven: the scope code from ConfigCache determines
 * which method parameters are read (via segment names) and how node context is
 * resolved (via ActionNodeContextPort). No SpEL, no service-specific knowledge.
 */
@Slf4j
@Aspect
@Order(2)
public class PlmActionAspect {

    private final PolicyPort            policyService;
    private final PermissionCatalogPort permissionCatalog;
    private final ActionGuardPort       actionGuardPort;
    private final AuthzContextProvider  authz;
    private final ConfigCache           configCache;
    private final ActionScopeRegistry   scopeRegistry;
    private final ActionNodeContextPort nodeContextPort;

    /** actionCode → required permission codes. Rebuilt on config snapshot update. */
    private volatile Map<String, List<String>> permissionCache = Map.of();

    /** actionCode → actionId. Rebuilt on config snapshot update. */
    private volatile Map<String, String> actionIdCache = Map.of();

    public PlmActionAspect(ConfigCache configCache, PolicyPort policyService,
                           PermissionCatalogPort permissionCatalog, ActionGuardPort actionGuardPort,
                           AuthzContextProvider authz, ActionScopeRegistry scopeRegistry,
                           ActionNodeContextPort nodeContextPort) {
        this.configCache      = configCache;
        this.policyService    = policyService;
        this.permissionCatalog = permissionCatalog;
        this.actionGuardPort  = actionGuardPort;
        this.authz            = authz;
        this.scopeRegistry    = scopeRegistry;
        this.nodeContextPort  = nodeContextPort;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        Map<String, List<String>> newPerms = new HashMap<>();
        Map<String, String>       newIds   = new HashMap<>();
        for (ActionConfig action : configCache.getAllActions()) {
            if (action.requiredPermissions() != null && !action.requiredPermissions().isEmpty()) {
                newPerms.put(action.actionCode(), new ArrayList<>(action.requiredPermissions()));
            }
            newIds.put(action.actionCode(), action.id());
        }
        permissionCache = Map.copyOf(newPerms);
        actionIdCache   = Map.copyOf(newIds);
        log.info("PlmActionAspect: loaded {} action→permission mappings", permissionCache.size());
    }

    @Around("@annotation(plmAction)")
    public Object enforce(ProceedingJoinPoint pjp, PlmAction plmAction) throws Throwable {

        AuthzContext user = authz.currentOrNull();
        if (user == null) {
            throw new PolicyDeniedException(
                "Authentication required to execute action '" + plmAction.value() + "'");
        }
        if (user.isAdmin()) return pjp.proceed();

        String actionCode = plmAction.value();

        Optional<ActionConfig> actionOpt = configCache.getAction(actionCode);
        if (actionOpt.isEmpty()) {
            log.debug("PlmActionAspect: action '{}' not in ConfigCache, skipping checks", actionCode);
            return pjp.proceed();
        }

        ActionConfig action    = actionOpt.get();
        String       scopeCode = action.scope();

        // Extract segment IDs from method param names (AspectJ exposes param names via debug info)
        Map<String, String> ids = extractIds(scopeCode, pjp);

        // Resolve node context via port (scope impl decides how)
        Optional<ActionNodeContextPort.NodeCtx> nodeCtxOpt = scopeRegistry
            .find(scopeCode)
            .flatMap(scope -> scope.resolveNodeCtx(ids, user.userId(), nodeContextPort));

        String nodeTypeId   = nodeCtxOpt.map(ActionNodeContextPort.NodeCtx::nodeTypeId).orElse(null);
        String transitionId = ids.get("transitionId");

        // Permission check
        checkRequiredPermissions(actionCode, nodeTypeId, transitionId);

        // Guard evaluation — only when we have full node context
        if (nodeCtxOpt.isPresent()) {
            evaluateGuards(actionCode, action.id(), nodeCtxOpt.get(), transitionId, user);
        }

        return pjp.proceed();
    }

    // ── Helpers ────────────────────────────────────────────────────

    private Map<String, String> extractIds(String scopeCode, ProceedingJoinPoint pjp) {
        Optional<ActionScope> scope = scopeRegistry.find(scopeCode);
        if (scope.isEmpty() || scope.get().segments().isEmpty()) return Map.of();

        MethodSignature sig        = (MethodSignature) pjp.getSignature();
        String[]        paramNames = sig.getParameterNames();
        Object[]        args       = pjp.getArgs();

        Map<String, String> ids = new LinkedHashMap<>();
        for (ScopeSegment seg : scope.get().segments()) {
            for (int i = 0; i < paramNames.length; i++) {
                if (seg.name().equals(paramNames[i]) && args[i] instanceof String s) {
                    ids.put(seg.name(), s);
                    break;
                }
            }
        }
        return ids;
    }

    private void checkRequiredPermissions(String actionCode, String nodeTypeId, String transitionId) {
        List<String> requiredPerms = permissionCache.get(actionCode);
        if (requiredPerms == null || requiredPerms.isEmpty()) return;

        for (String permCode : requiredPerms) {
            String permScope = permissionCatalog.scopeFor(permCode);
            if (permScope == null) {
                log.warn("PlmActionAspect: permission '{}' not found in catalog", permCode);
                continue;
            }
            switch (permScope) {
                case GLOBAL_CODE    -> policyService.assertGlobal(permCode);
                case NODE_CODE      -> { if (nodeTypeId != null) policyService.assertNodeType(permCode, nodeTypeId); }
                case LIFECYCLE_CODE -> { if (nodeTypeId != null) policyService.assertLifecycle(permCode, nodeTypeId, transitionId); }
                default -> log.warn("PlmActionAspect: no handler for scope '{}' (permission '{}')", permScope, permCode);
            }
        }
    }

    private void evaluateGuards(String actionCode, String actionId,
                                ActionNodeContextPort.NodeCtx nodeCtx,
                                String transitionId, AuthzContext user) {
        if (actionId == null) return;

        ActionGuardContext gCtx = new ActionGuardContext(
            nodeCtx.nodeId(), nodeCtx.nodeTypeId(), nodeCtx.currentStateId(),
            actionCode, transitionId,
            nodeCtx.isLocked(), nodeCtx.isLockedByCurrentUser(),
            user.userId(), Map.of());

        actionGuardPort.assertGuards(actionCode, actionId,
            nodeCtx.nodeTypeId(), transitionId, false, gCtx);
    }
}
