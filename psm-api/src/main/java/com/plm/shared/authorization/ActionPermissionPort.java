package com.plm.shared.authorization;

import java.util.Collection;
import java.util.List;
import java.util.Map;

/**
 * Port for action-level permission checks.
 * Implementation lives in the action module ({@code ActionPermissionService}).
 * Node module and other consumers depend on this interface only.
 */
public interface ActionPermissionPort {

    void assertGlobal(String actionCode);

    void assertNode(String actionCode, String nodeId);

    void assertNodeType(String actionCode, String nodeTypeId);

    void assertLifecycle(String actionCode, String nodeTypeId, String transitionId);

    boolean canOnNodeType(String actionCode, String nodeTypeId);

    Map<String, Boolean> canOnNodeTypes(String actionCode, Collection<String> nodeTypeIds);

    void assertTransition(String nodeTypeId, String transitionId);

    void assertTransition(String transitionId);

    List<String> getExecutableGlobalActionCodes();

    List<Map<String, Object>> listGlobalActions();

    boolean canExecute(String actionId, String scope, String nodeTypeId, String transitionId);
}
