package com.plm.platform.authz;

import java.util.Collection;
import java.util.Map;

/**
 * Port for permission enforcement.
 *
 * <p>The default implementation in this module ({@link DefaultPolicyEnforcer})
 * goes through {@link PolicyEnforcer#assertScope} and reuses this façade for
 * callers that still think in scope-specific terms. Services can provide a
 * thin adapter (e.g. {@code PolicyService} in psm-api) that delegates here.
 *
 * <p>All methods take {@code permissionCode} (matching {@code permission.permission_code}),
 * not action IDs.
 */
public interface PolicyPort {

    void assertGlobal(String permissionCode);

    void assertNode(String permissionCode, String nodeId);

    void assertNodeType(String permissionCode, String nodeTypeId);

    void assertLifecycle(String permissionCode, String nodeTypeId, String transitionId);

    boolean canOnNodeType(String permissionCode, String nodeTypeId);

    Map<String, Boolean> canOnNodeTypes(String permissionCode, Collection<String> nodeTypeIds);

    void assertTransition(String nodeTypeId, String transitionId);

    void assertTransition(String transitionId);

    boolean canExecute(String permissionCode, String scope, String nodeTypeId, String transitionId);

    /** Reloads all policies from the remote snapshot. Call after a known mutation. */
    void reloadPolicies();
}
