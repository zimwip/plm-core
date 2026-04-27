package com.plm.permission.internal;

import com.plm.platform.authz.PolicyEnforcer;
import com.plm.platform.authz.PolicyPort;
import com.plm.platform.authz.PolicyDeniedException;
import com.plm.shared.exception.AccessDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Legacy {@link PolicyPort} façade for the psm-api permission module. Methods
 * delegate to the scope-agnostic {@link PolicyEnforcer} in platform-lib;
 * translation to the psm-api {@link AccessDeniedException} lives here so call
 * sites remain unchanged.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PolicyService implements PolicyPort {

    private final PolicyEnforcer enforcer;
    private final DSLContext     dsl;

    // ──────────────── public asserts ────────────────

    @Override
    public void assertGlobal(String permissionCode) {
        assertWithKeys("GLOBAL", permissionCode, Map.of());
    }

    @Override
    public void assertNode(String permissionCode, String nodeId) {
        String nodeTypeId = resolveNodeTypeId(nodeId);
        if (nodeTypeId == null) {
            throw new AccessDeniedException("Cannot " + permissionCode + " — node not found: " + nodeId);
        }
        assertWithKeys("NODE", permissionCode, Map.of("nodeType", nodeTypeId));
    }

    @Override
    public void assertNodeType(String permissionCode, String nodeTypeId) {
        assertWithKeys("NODE", permissionCode, Map.of("nodeType", nodeTypeId));
    }

    @Override
    public void assertLifecycle(String permissionCode, String nodeTypeId, String transitionId) {
        Map<String, String> keys = new LinkedHashMap<>();
        keys.put("nodeType", nodeTypeId);
        keys.put("transition", transitionId);
        assertWithKeys("LIFECYCLE", permissionCode, keys);
    }

    @Override
    public boolean canOnNodeType(String permissionCode, String nodeTypeId) {
        return enforcer.canScope("NODE", permissionCode, Map.of("nodeType", nodeTypeId));
    }

    @Override
    public Map<String, Boolean> canOnNodeTypes(String permissionCode, Collection<String> nodeTypeIds) {
        Map<String, Boolean> result = new HashMap<>();
        if (nodeTypeIds == null || nodeTypeIds.isEmpty()) return result;
        for (String nodeTypeId : nodeTypeIds) {
            result.put(nodeTypeId, enforcer.canScope("NODE", permissionCode, Map.of("nodeType", nodeTypeId)));
        }
        return result;
    }

    @Override
    public void assertTransition(String nodeTypeId, String transitionId) {
        Map<String, String> keys = new LinkedHashMap<>();
        keys.put("nodeType", nodeTypeId);
        keys.put("transition", transitionId);
        assertWithKeys("LIFECYCLE", "TRANSITION", keys);
    }

    @Override
    public void assertTransition(String transitionId) {
        String nodeTypeId = resolveNodeTypeForTransition(transitionId);
        if (nodeTypeId == null) {
            throw new AccessDeniedException("Unknown transition: " + transitionId);
        }
        assertTransition(nodeTypeId, transitionId);
    }

    @Override
    public boolean canExecute(String permissionCode, String scope,
                              String nodeTypeId, String transitionId) {
        Map<String, String> keys = new LinkedHashMap<>();
        if (nodeTypeId != null)   keys.put("nodeType", nodeTypeId);
        if (transitionId != null) keys.put("transition", transitionId);
        return enforcer.canScope(scope, permissionCode, keys);
    }

    @Override
    public void reloadPolicies() {
        enforcer.reload();
    }

    // ──────────────── internals ────────────────

    private void assertWithKeys(String scope, String permissionCode, Map<String, String> keys) {
        try {
            enforcer.assertScope(scope, permissionCode, keys);
        } catch (PolicyDeniedException e) {
            throw new AccessDeniedException(e.getMessage());
        }
    }

    private String resolveNodeTypeId(String nodeId) {
        return dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId)
            .fetchOne(DSL.field("node_type_id"), String.class);
    }

    /**
     * Resolve the nodeType owning a given transition via its lifecycle. Any
     * nodeType bound to that lifecycle qualifies — the caller only needs one.
     */
    private String resolveNodeTypeForTransition(String transitionId) {
        return dsl.select(DSL.field("nt.id").as("id"))
            .from("lifecycle_transition lt")
            .join("lifecycle l").on("l.id = lt.lifecycle_id")
            .join("node_type nt").on("nt.lifecycle_id = l.id")
            .where("lt.id = ?", transitionId)
            .limit(1)
            .fetchOne(DSL.field("id"), String.class);
    }
}
