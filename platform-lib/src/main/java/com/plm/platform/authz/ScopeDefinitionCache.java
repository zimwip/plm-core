package com.plm.platform.authz;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory mirror of the scope catalog pulled from pno-api's extended
 * snapshot. Drives both {@link DynamicPolicyAdapter}'s tuple projection and
 * {@link DefaultPolicyEnforcer}'s object/attrs encoding.
 *
 * <p>Immutable snapshot — {@link #reload(List)} replaces the backing map wholesale.
 */
@Slf4j
public class ScopeDefinitionCache {

    /** Minimal per-scope record: keys are the effective list (parent + self, in order). */
    public record ScopeDef(String code, String parent, List<String> keys) {}

    private volatile Map<String, ScopeDef> byCode = Map.of();

    /** Replace the cached definitions. Expects keys to be the effective (flattened) list. */
    public void reload(List<ScopeDef> defs) {
        Map<String, ScopeDef> next = new ConcurrentHashMap<>();
        for (ScopeDef d : defs) {
            next.put(d.code(), d);
        }
        this.byCode = next;
        log.info("ScopeDefinitionCache: loaded {} scope definition(s)", next.size());
    }

    public ScopeDef get(String scopeCode) {
        return byCode.get(scopeCode);
    }

    public boolean isPopulated() {
        return !byCode.isEmpty();
    }

    /**
     * Ordered parent chain from root → self for the given scope. Used by
     * {@link ChainedScopeKeyResolver} to apply resolvers in the right order.
     */
    public List<String> parentChain(String scopeCode) {
        List<String> chain = new ArrayList<>();
        // bounded depth — a few levels at most
        for (int i = 0; i < 10; i++) {
            ScopeDef d = byCode.get(scopeCode);
            if (d == null) break;
            chain.add(0, d.code());
            if (d.parent() == null || d.parent().isEmpty()) break;
            scopeCode = d.parent();
        }
        return chain.isEmpty() ? Collections.singletonList(scopeCode) : chain;
    }
}
