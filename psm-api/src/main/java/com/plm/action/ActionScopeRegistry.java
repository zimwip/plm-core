package com.plm.action;

import com.plm.shared.action.ActionScope;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Registry of all known {@link ActionScope} implementations.
 *
 * Scopes are discovered via Spring injection — any module can register
 * its own scope by declaring a bean implementing {@link ActionScope}.
 */
@Slf4j
@Service
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
        log.info("ActionScopeRegistry loaded {} scopes: {}", scopesByCode.size(), scopesByCode.keySet());
    }

    /** Resolves a scope by its code. Throws if unknown. */
    public ActionScope resolve(String scopeCode) {
        ActionScope scope = scopesByCode.get(scopeCode);
        if (scope == null) {
            throw new IllegalArgumentException("Unknown action scope: " + scopeCode);
        }
        return scope;
    }

    /** Registers a scope at runtime (for dynamic module loading). */
    public void register(ActionScope scope) {
        scopesByCode.put(scope.code(), scope);
        log.info("Registered ActionScope: {}", scope.code());
    }

    /** Returns all registered scope codes. */
    public java.util.Set<String> registeredCodes() {
        return java.util.Collections.unmodifiableSet(scopesByCode.keySet());
    }
}
