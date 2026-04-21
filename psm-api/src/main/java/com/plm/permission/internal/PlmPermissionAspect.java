package com.plm.permission.internal;

import com.plm.permission.PermissionRegistry;
import com.plm.shared.authorization.PermissionScope;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.exception.UnauthenticatedException;
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
import org.springframework.core.annotation.Order;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

/**
 * AOP aspect enforcing {@link PlmPermission} authorization on service methods.
 *
 * <p>Fires at {@code @Order(1)} — before PlmActionAspect which handles
 * guard evaluation at {@code @Order(2)}.
 *
 * <p>Scope is resolved from the {@code permission} table via {@link PermissionRegistry},
 * not from the annotation.
 */
@Slf4j
@Aspect
@Component
@Order(1)
@RequiredArgsConstructor
public class PlmPermissionAspect {

    private final PolicyService        policyService;
    private final PermissionRegistry   permissionRegistry;
    private final SecurityContextPort  secCtx;
    private final DSLContext           dsl;

    private static final ExpressionParser SPEL = new SpelExpressionParser();

    @Around("@annotation(plmPermission)")
    public Object enforce(ProceedingJoinPoint pjp, PlmPermission plmPermission) throws Throwable {
        PlmUserContext user = secCtx.currentUserOrNull();
        if (user == null) {
            throw new UnauthenticatedException(
                "Authentication required for permission '" + String.join(",", plmPermission.value()) + "'");
        }

        if (user.isAdmin()) {
            return pjp.proceed();
        }

        for (String permCode : plmPermission.value()) {
            PermissionScope scope = permissionRegistry.scopeFor(permCode);
            if (scope == null) {
                log.warn("PlmPermissionAspect: unknown permission code '{}', skipping", permCode);
                continue;
            }

            switch (scope) {
                case GLOBAL -> policyService.assertGlobal(permCode);

                case NODE -> {
                    String nodeTypeId = resolveNodeTypeId(plmPermission, pjp, user);
                    if (nodeTypeId != null) {
                        policyService.assertNodeType(permCode, nodeTypeId);
                    }
                }

                case LIFECYCLE -> {
                    String nodeTypeId   = resolveNodeTypeId(plmPermission, pjp, user);
                    String transitionId = resolveSpel(plmPermission.transitionIdExpr(), pjp);
                    if (nodeTypeId != null) {
                        policyService.assertLifecycle(permCode, nodeTypeId, transitionId);
                    }
                }
            }
        }

        return pjp.proceed();
    }

    private String resolveNodeTypeId(PlmPermission ann, ProceedingJoinPoint pjp, PlmUserContext user) {
        if (!ann.nodeIdExpr().isEmpty()) {
            String nodeId = resolveSpel(ann.nodeIdExpr(), pjp);
            return resolveNodeTypeFromNodeId(nodeId, user.getUserId());
        }
        if (!ann.nodeTypeIdExpr().isEmpty()) {
            return resolveSpel(ann.nodeTypeIdExpr(), pjp);
        }
        if (!ann.linkIdExpr().isEmpty()) {
            String linkId = resolveSpel(ann.linkIdExpr(), pjp);
            return resolveNodeTypeFromLinkId(linkId, user.getUserId());
        }
        return null;
    }

    private String resolveNodeTypeFromNodeId(String nodeId, String userId) {
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

    private String resolveNodeTypeFromLinkId(String linkId, String userId) {
        String sourceNodeId = dsl.select(DSL.field("nv.node_id").as("node_id"))
            .from("node_version_link nvl")
            .join("node_version nv").on("nv.id = nvl.source_node_version_id")
            .where("nvl.id = ?", linkId)
            .limit(1)
            .fetchOne(DSL.field("node_id"), String.class);

        if (sourceNodeId == null) {
            log.debug("PlmPermissionAspect: link {} source node not found", linkId);
            return null;
        }
        return resolveNodeTypeFromNodeId(sourceNodeId, userId);
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
