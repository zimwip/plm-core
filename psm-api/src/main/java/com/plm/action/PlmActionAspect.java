package com.plm.action;

import com.plm.shared.authorization.PlmAction;
import com.plm.shared.exception.UnauthenticatedException;
import com.plm.action.guard.ActionGuardContext;
import com.plm.action.guard.ActionGuardService;
import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

/**
 * AOP aspect enforcing {@link PlmAction} authorization on service methods.
 *
 * <h2>Check flow</h2>
 * <ol>
 *   <li>Read {@link PlmSecurityContext} — throw {@link UnauthenticatedException} (401) if absent.</li>
 *   <li>Admin users ({@link PlmUserContext#isAdmin()}) bypass all checks.</li>
 *   <li>Dispatch to the right enforcement path based on which SpEL attribute is set:
 *     <ul>
 *       <li>{@code nodeIdExpr} — resolves nodeId → nodeTypeId →
 *           {@link ActionPermissionService#assertNodeType} or {@link ActionPermissionService#assertLifecycle}</li>
 *       <li>{@code nodeTypeIdExpr} — resolves nodeTypeId directly (createNode) →
 *           {@link ActionPermissionService#assertNodeType}</li>
 *       <li>{@code linkIdExpr} — resolves linkId → source nodeId → nodeTypeId →
 *           {@link ActionPermissionService#assertNodeType}</li>
 *       <li>none of the above — {@link ActionPermissionService#assertGlobal}</li>
 *     </ul>
 *   </li>
 * </ol>
 *
 * <h2>Action codes</h2>
 * Values in {@link PlmAction#value()} must match {@code action.action_code} or
 * {@code action.action_code} exactly (e.g. {@code "CHECKOUT"}, not {@code "act-checkout"}).
 *
 * <h2>Proxy rule</h2>
 * Spring AOP only intercepts calls through the Spring proxy. Use
 * {@code @Lazy @Autowired} self-injection for recursive/cascade calls within the same class.
 */
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class PlmActionAspect {

    private final ActionPermissionService actionPermissionService;
    private final ActionGuardService       actionGuardService;
    private final SecurityContextPort     secCtx;
    private final DSLContext              dsl;

    private static final ExpressionParser SPEL = new SpelExpressionParser();

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

        String actionCode      = plmAction.value();
        String nodeIdExpr      = plmAction.nodeIdExpr();
        String nodeTypeExpr    = plmAction.nodeTypeIdExpr();
        String linkIdExpr      = plmAction.linkIdExpr();
        String transitionExpr  = plmAction.transitionIdExpr();

        // 3. Dispatch to the right enforcement path
        if (!nodeIdExpr.isEmpty()) {
            // Standard node-scoped: resolve nodeId → nodeTypeId + currentStateId
            // Optional transitionIdExpr narrows the check to a specific transition.
            String nodeId = resolveSpel(nodeIdExpr, pjp);
            String transitionId = transitionExpr.isEmpty() ? null : resolveSpel(transitionExpr, pjp);
            enforceByNodeId(actionCode, nodeId, transitionId, user);
        } else if (!nodeTypeExpr.isEmpty()) {
            // NodeType-scoped (createNode): nodeId doesn't exist yet
            String nodeTypeId = resolveSpel(nodeTypeExpr, pjp);
            enforceByNodeType(actionCode, nodeTypeId, user);
        } else if (!linkIdExpr.isEmpty()) {
            // Link-scoped (deleteLink, updateLink): resolve source nodeId from linkId
            String linkId = resolveSpel(linkIdExpr, pjp);
            enforceByLinkId(actionCode, linkId, user);
        } else {
            // Global action: checked via action_permission (GLOBAL scope)
            enforceGlobal(actionCode, user);
        }

        return pjp.proceed();
    }

    // ── Node-scoped (nodeId known) ─────────────────────────────────────────

    private void enforceByNodeId(String actionCode, String nodeId,
                                 String transitionId, PlmUserContext user) {
        String nodeTypeId = resolveNodeTypeId(nodeId, user.getUserId());
        if (nodeTypeId == null) {
            log.debug("PlmActionAspect: node {} not found or not accessible, skipping check", nodeId);
            return; // let the service produce the 404
        }

        // Access rights check
        if (transitionId != null) {
            actionPermissionService.assertLifecycle(actionCode, nodeTypeId, transitionId);
        } else {
            actionPermissionService.assertNodeType(actionCode, nodeTypeId);
        }

        // Guard evaluation — resolve node state + lock for context
        evaluateGuards(actionCode, nodeId, nodeTypeId, transitionId, user);
    }

    // ── NodeType-scoped (createNode — no nodeId yet) ──────────────────────

    private void enforceByNodeType(String actionCode, String nodeTypeId, PlmUserContext user) {
        actionPermissionService.assertNodeType(actionCode, nodeTypeId);
        // No guard evaluation for node creation — node doesn't exist yet
    }

    // ── Link-scoped (deleteLink, updateLink) ──────────────────────────────

    private void enforceByLinkId(String actionCode, String linkId, PlmUserContext user) {
        // Resolve source nodeId from node_version_link
        String sourceNodeId = dsl.select(DSL.field("nv.node_id").as("node_id"))
            .from("node_version_link nvl")
            .join("node_version nv").on("nv.id = nvl.source_node_version_id")
            .where("nvl.id = ?", linkId)
            .limit(1)
            .fetchOne(DSL.field("node_id"), String.class);

        if (sourceNodeId == null) {
            log.debug("PlmActionAspect: link {} source node not found, skipping check", linkId);
            return; // let the service handle the missing link
        }
        enforceByNodeId(actionCode, sourceNodeId, null, user);
    }

    // ── Global action (GLOBAL scope in action catalog) ───────────────────

    private void enforceGlobal(String actionCode, PlmUserContext user) {
        // Delegate to the unified action_permission check (nodeTypeId=null, transitionId=null)
        actionPermissionService.assertGlobal(actionCode);
    }

    // ── Guard evaluation ────────────────────────────────────────────────

    /**
     * Evaluates guards for a node-scoped action at execution time.
     * Resolves current state and lock info, then delegates to GuardService.
     */
    private void evaluateGuards(String actionCode, String nodeId,
                                String nodeTypeId, String transitionId, PlmUserContext user) {
        ActionIds ids = resolveActionIds(actionCode);
        if (ids == null) return;

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
            user.getUserId(), java.util.Map.of());

        if (ids.managedWith != null) {
            actionGuardService.assertGuards(ids.managedWith, ids.actionId, nodeTypeId, transitionId, user.isAdmin(), gCtx);
        } else {
            actionGuardService.assertGuards(ids.actionId, nodeTypeId, transitionId, user.isAdmin(), gCtx);
        }
    }

    private record ActionIds(String actionId, String managedWith) {}

    private ActionIds resolveActionIds(String actionCode) {
        var row = dsl.select(DSL.field("id"), DSL.field("managed_with")).from("action")
            .where("action_code = ?", actionCode).fetchOne();
        if (row == null) return null;
        return new ActionIds(row.get("id", String.class), row.get("managed_with", String.class));
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * Resolves the nodeTypeId for a node visible to the given user.
     * Returns null if the node does not exist or is not accessible.
     */
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
