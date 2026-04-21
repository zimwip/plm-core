package com.plm.shared.authorization;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Port for permission enforcement.
 * Implementation lives in the permission module ({@code PolicyService}).
 * Node module, action module, and other consumers depend on this interface only.
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
}
