package com.plm.platform.authz;

import java.util.Map;

/**
 * Scope-agnostic permission enforcement façade. Callers supply the scope code
 * and raw key values; the enforcer resolves the Casbin tuple using
 * {@link ScopeDefinitionCache}.
 *
 * <p>{@code projectSpaceId} is not a parameter — it comes from the current
 * {@link AuthzContextProvider}.
 */
public interface PolicyEnforcer {

    /** Throws {@link com.plm.platform.authz.PolicyDeniedException} on denial. */
    void assertScope(String scopeCode, String permissionCode, Map<String, String> keys);

    boolean canScope(String scopeCode, String permissionCode, Map<String, String> keys);

    /** Force-reload policies from the remote snapshot. */
    void reload();
}
