package com.plm.platform.authz;

import org.aspectj.lang.ProceedingJoinPoint;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Composes per-scope resolvers by walking the scope's parent chain.
 *
 * <p>Given a child scope whose definition inherits from a parent (e.g.
 * {@code LIFECYCLE} inherits from {@code NODE}), runs the parent resolver
 * first, then the child's — so downstream resolvers see the keys already
 * normalised by ancestors.
 */
public class ChainedScopeKeyResolver {

    private final ScopeDefinitionCache scopes;
    private final Map<String, ScopeKeyResolver> resolversByScope;

    public ChainedScopeKeyResolver(ScopeDefinitionCache scopes, List<ScopeKeyResolver> resolvers) {
        this.scopes = scopes;
        this.resolversByScope = new HashMap<>();
        for (ScopeKeyResolver r : resolvers) {
            resolversByScope.put(r.scopeCode(), r);
        }
    }

    public Map<String, String> resolveKeys(String scopeCode,
                                           ProceedingJoinPoint pjp,
                                           Map<String, String> rawKeys,
                                           AuthzContext ctx) {
        Map<String, String> keys = new LinkedHashMap<>(rawKeys);
        for (String code : scopes.parentChain(scopeCode)) {
            ScopeKeyResolver r = resolversByScope.get(code);
            if (r == null) continue;
            Map<String, String> out = r.resolveKeys(pjp, keys, ctx);
            if (out != null) keys = new LinkedHashMap<>(out);
        }
        return keys;
    }
}
