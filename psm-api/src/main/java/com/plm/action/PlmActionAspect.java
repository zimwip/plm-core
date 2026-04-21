package com.plm.action;

import com.plm.shared.action.PlmAction;
import com.plm.shared.authorization.PermissionCatalogPort;
import com.plm.shared.authorization.PermissionScope;
import com.plm.shared.authorization.PolicyPort;
import com.plm.shared.exception.UnauthenticatedException;
import com.plm.action.guard.ActionGuardContext;
import com.plm.action.guard.ActionGuardService;
import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.core.annotation.Order;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * AOP aspect for {@link PlmAction}-annotated service methods.
 *
 * <p>Fires at {@code @Order(2)} — after {@link PlmPermissionAspect} which handles
 * pure-permission checks at {@code @Order(1)}.
 *
 * <h2>Responsibilities</h2>
 * <ol>
 *   <li>Resolve user context — throw 401 if absent.</li>
 *   <li>Admin bypass (for guards only — permission bypass is in PlmPermissionAspect).</li>
 *   <li>Auto-resolve required permissions from {@code action_required_permission} table
 *       and check each via {@link PolicyPort}.</li>
 *   <li>Evaluate action guards via {@link ActionGuardService}.</li>
 * </ol>
 *
 * <p>Permission checking uses the {@code action_required_permission} table,
 * cached at startup. The scope for each permission is resolved from the
 * {@code permission} table via {@link PermissionCatalogPort}.
 */
@Slf4j
@Aspect
@Component
@Order(2)
@RequiredArgsConstructor
public class PlmActionAspect {

    private final PolicyPort              policyService;
    private final PermissionCatalogPort   permissionCatalog;
    private final ActionGuardService      actionGuardService;
    private final SecurityContextPort     secCtx;
    private final DSLContext              dsl;

    private static final ExpressionParser SPEL = new SpelExpressionParser();

    /** actionCode → list of permission codes required. Loaded at startup. */
    private Map<String, List<String>> permissionCache;

    /** actionCode → actionId. Loaded at startup. */
    private Map<String, String> actionIdCache;

    @PostConstruct
    void loadPermissionMappings() {
        permissionCache = new HashMap<>();
        actionIdCache   = new HashMap<>();

        // Load action_required_permission mappings
        dsl.fetch("""
            SELECT a.action_code, arp.permission_code
            FROM action_required_permission arp
            JOIN action a ON a.id = arp.action_id
            """)
            .forEach(r -> {
                String actionCode = r.get("action_code", String.class);
                String permCode   = r.get("permission_code", String.class);
                permissionCache.computeIfAbsent(actionCode, k -> new ArrayList<>()).add(permCode);
            });

        // Load action IDs
        dsl.fetch("SELECT id, action_code FROM action")
            .forEach(r -> actionIdCache.put(
                r.get("action_code", String.class),
                r.get("id", String.class)));

        log.info("PlmActionAspect: loaded {} action→permission mappings", permissionCache.size());
    }

    @Around("@annotation(plmAction)")
    public Object enforce(ProceedingJoinPoint pjp, PlmAction plmAction) throws Throwable {

        // 1. Resolve user — 401 if no context
        PlmUserContext user = secCtx.currentUserOrNull();
        if (user == null) {
            throw new UnauthenticatedException(
                "Authentication required to execute action '" + plmAction.value() + "'");
        }

        // 2. Admin bypass
        if (user.isAdmin()) {
            return pjp.proceed();
        }

        String actionCode     = plmAction.value();
        String nodeIdExpr     = plmAction.nodeIdExpr();
        String nodeTypeExpr   = plmAction.nodeTypeIdExpr();
        String linkIdExpr     = plmAction.linkIdExpr();
        String transitionExpr = plmAction.transitionIdExpr();

        // 3. Resolve node context
        String nodeId       = null;
        String nodeTypeId   = null;
        String transitionId = transitionExpr.isEmpty() ? null : resolveSpel(transitionExpr, pjp);

        if (!nodeIdExpr.isEmpty()) {
            nodeId = resolveSpel(nodeIdExpr, pjp);
            nodeTypeId = resolveNodeTypeId(nodeId, user.getUserId());
            if (nodeTypeId == null) {
                log.debug("PlmActionAspect: node {} not found, skipping checks", nodeId);
                return pjp.proceed();
            }
        } else if (!nodeTypeExpr.isEmpty()) {
            nodeTypeId = resolveSpel(nodeTypeExpr, pjp);
        } else if (!linkIdExpr.isEmpty()) {
            String linkId = resolveSpel(linkIdExpr, pjp);
            nodeId = resolveSourceNodeId(linkId);
            if (nodeId == null) {
                log.debug("PlmActionAspect: link {} source not found, skipping checks", linkId);
                return pjp.proceed();
            }
            nodeTypeId = resolveNodeTypeId(nodeId, user.getUserId());
        }

        // 4. Check required permissions (auto-resolved from action_required_permission)
        checkRequiredPermissions(actionCode, nodeTypeId, transitionId);

        // 5. Evaluate guards (node-scoped actions only — need nodeId for state/lock context)
        if (nodeId != null) {
            evaluateGuards(actionCode, nodeId, nodeTypeId, transitionId, user);
        }

        return pjp.proceed();
    }

    // ── Permission checking (auto-resolved from table) ──────────────────

    private void checkRequiredPermissions(String actionCode, String nodeTypeId, String transitionId) {
        List<String> requiredPerms = permissionCache.get(actionCode);
        if (requiredPerms == null || requiredPerms.isEmpty()) return;

        for (String permCode : requiredPerms) {
            PermissionScope permScope = permissionCatalog.scopeFor(permCode);
            if (permScope == null) {
                log.warn("PlmActionAspect: permission code '{}' not found in permission table", permCode);
                continue;
            }

            try {
                switch (permScope) {
                    case GLOBAL -> policyService.assertGlobal(permCode);
                    case NODE -> {
                        if (nodeTypeId != null) {
                            policyService.assertNodeType(permCode, nodeTypeId);
                        }
                    }
                    case LIFECYCLE -> {
                        if (nodeTypeId != null) {
                            policyService.assertLifecycle(permCode, nodeTypeId, transitionId);
                        }
                    }
                }
            } catch (com.plm.shared.exception.AccessDeniedException e) {
                String userId = secCtx.currentUser().getUserId();
                throw new com.plm.shared.exception.AccessDeniedException(
                    "User " + userId + " cannot execute '" + actionCode
                    + "' — required permission '" + permCode + "' is missing");
            }
        }
    }

    // ── Guard evaluation ────────────────────────────────────────────────

    private void evaluateGuards(String actionCode, String nodeId,
                                String nodeTypeId, String transitionId, PlmUserContext user) {
        String actionId = actionIdCache.get(actionCode);
        if (actionId == null) return;

        var stateRow = dsl.fetchOne(
            "SELECT nv.lifecycle_state_id FROM node_version nv " +
            "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
            "WHERE nv.node_id = ? AND pt.status IN ('COMMITTED','OPEN') " +
            "ORDER BY nv.version_number DESC LIMIT 1", nodeId);
        String currentStateId = stateRow != null
            ? stateRow.get("lifecycle_state_id", String.class) : null;

        String lockedBy = dsl.select(DSL.field("locked_by")).from("node")
            .where("id = ?", nodeId).fetchOne(DSL.field("locked_by"), String.class);
        boolean isLocked = lockedBy != null;
        boolean isLockedByCurrentUser = isLocked && user.getUserId().equals(lockedBy);

        ActionGuardContext gCtx = new ActionGuardContext(nodeId, nodeTypeId, currentStateId,
            actionCode, transitionId, isLocked, isLockedByCurrentUser,
            user.getUserId(), Map.of());

        actionGuardService.assertGuards(actionId, nodeTypeId, transitionId, user.isAdmin(), gCtx);
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private String resolveSourceNodeId(String linkId) {
        return dsl.select(DSL.field("nv.node_id").as("node_id"))
            .from("node_version_link nvl")
            .join("node_version nv").on("nv.id = nvl.source_node_version_id")
            .where("nvl.id = ?", linkId)
            .limit(1)
            .fetchOne(DSL.field("node_id"), String.class);
    }

    private String resolveNodeTypeId(String nodeId, String userId) {
        return dsl.select(DSL.field("n.node_type_id").as("node_type_id"))
            .from("node n")
            .join("node_version nv").on("nv.node_id = n.id")
            .join("plm_transaction pt").on("pt.id = nv.tx_id")
            .where("n.id = ?", nodeId)
            .and("(pt.status = 'COMMITTED' OR pt.owner_id = ?)", userId)
            .orderBy(DSL.field("nv.version_number").desc())
            .limit(1)
            .fetchOne(DSL.field("node_type_id"), String.class);
    }

    private String resolveSpel(String expr, ProceedingJoinPoint pjp) {
        MethodSignature sig   = (MethodSignature) pjp.getSignature();
        String[]        names = sig.getParameterNames();
        Object[]        args  = pjp.getArgs();

        StandardEvaluationContext ctx = new StandardEvaluationContext();
        for (int i = 0; i < names.length; i++) {
            ctx.setVariable(names[i], args[i]);
        }
        return SPEL.parseExpression(expr).getValue(ctx, String.class);
    }
}
