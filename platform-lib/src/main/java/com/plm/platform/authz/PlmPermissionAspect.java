package com.plm.platform.authz;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Scope-agnostic enforcement aspect for {@link PlmPermission}.
 *
 * <p>Fires at {@code @Order(1)} — before {@code PlmActionAspect} (guard
 * evaluation, order 2).
 *
 * <h2>Pipeline</h2>
 * <ol>
 *   <li>Resolve auth context — 401 if absent.</li>
 *   <li>Admin bypass.</li>
 *   <li>For each permission code on the annotation:
 *     <ul>
 *       <li>Look up scope via {@link PermissionCatalogPort}.</li>
 *       <li>Evaluate {@link KeyExpr} SpEL expressions against method args.</li>
 *       <li>Run {@link ChainedScopeKeyResolver} (walks parent chain, lets
 *           e.g. NODE's resolver translate {@code nodeId → nodeType}).</li>
 *       <li>Call {@link PolicyEnforcer#assertScope}.</li>
 *     </ul>
 *   </li>
 * </ol>
 */
@Slf4j
@Aspect
@Order(1)
public class PlmPermissionAspect {

    private static final ExpressionParser SPEL = new SpelExpressionParser();

    private final PolicyEnforcer           enforcer;
    private final PermissionCatalogPort    catalog;
    private final AuthzContextProvider     authz;
    private final ChainedScopeKeyResolver  chained;

    public PlmPermissionAspect(PolicyEnforcer enforcer,
                               PermissionCatalogPort catalog,
                               AuthzContextProvider authz,
                               ChainedScopeKeyResolver chained) {
        this.enforcer = enforcer;
        this.catalog  = catalog;
        this.authz    = authz;
        this.chained  = chained;
    }

    @Around("@annotation(plmPermission)")
    public Object enforce(ProceedingJoinPoint pjp, PlmPermission plmPermission) throws Throwable {
        AuthzContext ctx = authz.currentOrNull();
        if (ctx == null) {
            throw new PolicyDeniedException(
                "Authentication required for permission '" + String.join(",", plmPermission.value()) + "'");
        }

        if (ctx.isAdmin()) {
            return pjp.proceed();
        }

        for (String permCode : plmPermission.value()) {
            String scope = catalog.scopeFor(permCode);
            if (scope == null) {
                log.warn("PlmPermissionAspect: unknown permission code '{}', skipping", permCode);
                continue;
            }

            Map<String, String> rawKeys = evaluateRawKeys(plmPermission, pjp);
            Map<String, String> keys    = chained.resolveKeys(scope, pjp, rawKeys, ctx);

            enforcer.assertScope(scope, permCode, keys);
        }

        return pjp.proceed();
    }

    private Map<String, String> evaluateRawKeys(PlmPermission ann, ProceedingJoinPoint pjp) {
        KeyExpr[] exprs = ann.keyExprs();
        if (exprs.length == 0) return Map.of();

        StandardEvaluationContext ctx = spelContext(pjp);
        Map<String, String> out = new LinkedHashMap<>();
        for (KeyExpr ke : exprs) {
            Object v = SPEL.parseExpression(ke.expr()).getValue(ctx);
            out.put(ke.name(), v == null ? null : v.toString());
        }
        return out;
    }

    private static StandardEvaluationContext spelContext(ProceedingJoinPoint pjp) {
        MethodSignature sig   = (MethodSignature) pjp.getSignature();
        String[]        names = sig.getParameterNames();
        Object[]        args  = pjp.getArgs();

        StandardEvaluationContext ctx = new StandardEvaluationContext();
        if (names != null) {
            for (int i = 0; i < names.length && i < args.length; i++) {
                ctx.setVariable(names[i], args[i]);
            }
        }
        return ctx;
    }
}
