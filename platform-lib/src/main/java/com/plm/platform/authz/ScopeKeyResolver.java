package com.plm.platform.authz;

import org.aspectj.lang.ProceedingJoinPoint;

import java.util.Map;

/**
 * SPI for turning the raw SpEL-evaluated {@link KeyExpr} values at a
 * {@link PlmPermission} site into the canonical key values used by the
 * enforcer.
 *
 * <p>Example: a {@code NODE}-scope site annotates {@code @KeyExpr(name="nodeType",
 * expr="#nodeId")}. The raw resolution yields {@code nodeType=<nodeId-value>};
 * the psm-api {@code NodeScopeKeyResolver} then swaps the nodeId for the real
 * nodeType via a DB lookup.
 *
 * <p>Resolvers are keyed by {@link #scopeCode()}. Missing resolver ⇒ raw
 * values are used as-is.
 */
public interface ScopeKeyResolver {

    /** Scope this resolver handles. */
    String scopeCode();

    /**
     * Transform raw key values produced from the annotation into the
     * canonical values accepted by the enforcer. The returned map must carry
     * exactly the keys declared by the scope (self + inherited).
     *
     * @param pjp       the join point (for downstream resolvers that need method args)
     * @param rawKeys   results of evaluating each {@link KeyExpr}; keyed by {@code name}
     * @param ctx       the current authz context
     */
    Map<String, String> resolveKeys(ProceedingJoinPoint pjp, Map<String, String> rawKeys, AuthzContext ctx);
}
