package com.plm.platform.action;

import lombok.extern.slf4j.Slf4j;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Registry of all known ActionScope implementations.
 * Scopes are Spring beans discovered at startup.
 * Created by PlmActionAutoConfiguration.
 */
@Slf4j
public class ActionScopeRegistry {

    private final Map<String, ActionScope> scopesByCode = new LinkedHashMap<>();

    public ActionScopeRegistry(List<ActionScope> scopes) {
        for (ActionScope scope : scopes) {
            ActionScope existing = scopesByCode.put(scope.code(), scope);
            if (existing != null) {
                throw new IllegalStateException(
                    "Duplicate ActionScope code '" + scope.code() + "': "
                    + existing.getClass().getSimpleName() + " vs " + scope.getClass().getSimpleName());
            }
        }
        log.info("ActionScopeRegistry loaded {} scope(s): {}", scopesByCode.size(), scopesByCode.keySet());
    }

    public ActionScope resolve(String scopeCode) {
        ActionScope scope = scopesByCode.get(scopeCode);
        if (scope == null) throw new IllegalArgumentException("Unknown action scope: " + scopeCode);
        return scope;
    }

    public Optional<ActionScope> find(String scopeCode) {
        return Optional.ofNullable(scopesByCode.get(scopeCode));
    }
}
