package com.plm.infrastructure.security;

import com.plm.domain.action.ActionPermissionService;
import com.plm.domain.exception.UnauthenticatedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.jooq.DSLContext;
import org.jooq.Record;
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
 *       <li>{@code nodeIdExpr} — resolves nodeId → nodeTypeId + currentStateId →
 *           {@link ActionPermissionService#assertCanExecuteByCode}</li>
 *       <li>{@code nodeTypeIdExpr} — resolves nodeTypeId directly (createNode) →
 *           {@link ActionPermissionService#assertCanExecuteByCode} with null state</li>
 *       <li>{@code linkIdExpr} — resolves linkId → source nodeId → nodeTypeId + currentStateId →
 *           {@link ActionPermissionService#assertCanExecuteByCode}</li>
 *       <li>none of the above — GLOBAL-scope action, checked against {@code action_permission}</li>
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
    private final DSLContext dsl;

    private static final ExpressionParser SPEL = new SpelExpressionParser();

    @Around("@annotation(plmAction)")
    public Object enforce(ProceedingJoinPoint pjp, PlmAction plmAction) throws Throwable {

        // 1. Resolve user — 401 if no context
        PlmUserContext user = safeGetUser();
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
        actionPermissionService.assertCanExecuteByCode(nodeTypeId, actionCode, transitionId);
    }

    // ── NodeType-scoped (createNode — no nodeId yet) ──────────────────────

    private void enforceByNodeType(String actionCode, String nodeTypeId, PlmUserContext user) {
        // No transitionId for node creation
        actionPermissionService.assertCanExecuteByCode(nodeTypeId, actionCode, null);
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
        actionPermissionService.assertCanExecuteByCode(null, actionCode, null);
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

    private PlmUserContext safeGetUser() {
        try {
            return PlmSecurityContext.get();
        } catch (IllegalStateException e) {
            return null;
        }
    }
}
