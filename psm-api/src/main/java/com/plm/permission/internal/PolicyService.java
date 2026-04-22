package com.plm.permission.internal;

import com.plm.shared.exception.AccessDeniedException;
import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Single authority for permission enforcement.
 *
 * <p>Delegates to JCasbin {@link Enforcer} for policy evaluation.
 * Policies are loaded from {@code authorization_policy} at startup and
 * reloaded on admin mutations via {@link #reloadPolicies()}.
 *
 * <p>Admin users bypass all checks.
 */
@Slf4j
@Service
public class PolicyService implements com.plm.shared.authorization.PolicyPort {

    private final Enforcer            enforcer;
    private final DSLContext           dsl;
    private final SecurityContextPort  secCtx;
    private final ReadWriteLock        rwLock = new ReentrantReadWriteLock();

    public PolicyService(Enforcer enforcer, DSLContext dsl, SecurityContextPort secCtx) {
        this.enforcer = enforcer;
        this.dsl      = dsl;
        this.secCtx   = secCtx;
    }

    // ================================================================
    // PUBLIC API — one assert per scope
    // ================================================================

    public void assertGlobal(String permissionCode) {
        assertPermission(permissionCode, "GLOBAL", null, null);
    }

    public void assertNode(String permissionCode, String nodeId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        String nodeTypeId = resolveNodeTypeId(nodeId);
        if (nodeTypeId == null) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot " + permissionCode + " — node not found: " + nodeId);
        }

        if (!canExecuteCore(permissionCode, "NODE", nodeTypeId, null, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot " + permissionCode + " on node " + nodeId);
        }
    }

    public void assertNodeType(String permissionCode, String nodeTypeId) {
        assertPermission(permissionCode, "NODE", nodeTypeId, null);
    }

    public void assertLifecycle(String permissionCode, String nodeTypeId, String transitionId) {
        assertPermission(permissionCode, "LIFECYCLE", nodeTypeId, transitionId);
    }

    // ================================================================
    // NON-THROWING VARIANTS
    // ================================================================

    public boolean canOnNodeType(String permissionCode, String nodeTypeId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return true;
        if (ctx.getRoleIds().isEmpty()) return false;
        return canExecuteCore(permissionCode, "NODE", nodeTypeId, null, ctx);
    }

    public Map<String, Boolean> canOnNodeTypes(String permissionCode, Collection<String> nodeTypeIds) {
        Map<String, Boolean> result = new HashMap<>();
        if (nodeTypeIds.isEmpty()) return result;

        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) {
            nodeTypeIds.forEach(id -> result.put(id, true));
            return result;
        }
        if (ctx.getRoleIds().isEmpty()) {
            nodeTypeIds.forEach(id -> result.put(id, false));
            return result;
        }

        for (String nodeTypeId : nodeTypeIds) {
            result.put(nodeTypeId, canExecuteCore(permissionCode, "NODE", nodeTypeId, null, ctx));
        }
        return result;
    }

    public void assertTransition(String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        if (!canExecuteCore("TRANSITION", "LIFECYCLE", nodeTypeId, transitionId, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot trigger transition " + transitionId);
        }
    }

    public void assertTransition(String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        rwLock.readLock().lock();
        try {
            // p = [sub, act, node_type, transition]
            List<List<String>> policies = enforcer.getFilteredPolicy(1, "TRANSITION");
            for (String roleId : ctx.getRoleIds()) {
                for (List<String> p : policies) {
                    if (p.get(0).equals(roleId)
                        && (p.get(3).equals(transitionId) || p.get(3).equals("*"))
                        && !p.get(2).equals("*")) {
                        return; // found a matching grant
                    }
                }
            }
        } finally {
            rwLock.readLock().unlock();
        }

        throw new AccessDeniedException(
            "User " + ctx.getUserId() + " cannot trigger transition " + transitionId);
    }

    // ================================================================
    // GENERIC CHECK
    // ================================================================

    public boolean canExecute(String permissionCode, String scope,
                       String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return true;
        return canExecuteCore(permissionCode, scope, nodeTypeId, transitionId, ctx);
    }

    // ================================================================
    // RELOAD (called by PermissionAdminService after mutations)
    // ================================================================

    /**
     * Reloads all policies from the authorization_policy table into the Casbin model.
     * Thread-safe: acquires write lock to prevent stale reads during reload.
     */
    public void reloadPolicies() {
        rwLock.writeLock().lock();
        try {
            enforcer.loadPolicy();
            log.info("Casbin policies reloaded");
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    // ================================================================
    // INTERNALS
    // ================================================================

    private void assertPermission(String permissionCode, String scope,
                                  String nodeTypeId, String transitionId) {
        PlmUserContext ctx = secCtx.currentUser();
        if (ctx.isAdmin()) return;

        if (!canExecuteCore(permissionCode, scope, nodeTypeId, transitionId, ctx)) {
            throw new AccessDeniedException(
                "User " + ctx.getUserId() + " cannot execute '" + permissionCode + "'"
                + (nodeTypeId != null ? " on node type " + nodeTypeId : ""));
        }
    }

    private boolean canExecuteCore(String permissionCode, String scope,
                                   String nodeTypeId, String transitionId,
                                   PlmUserContext ctx) {
        Set<String> roleIds = ctx.getRoleIds();
        if (roleIds.isEmpty()) return false;

        String nodeType   = (nodeTypeId != null)   ? nodeTypeId   : "*";
        String transition = (transitionId != null)  ? transitionId : "*";

        rwLock.readLock().lock();
        try {
            for (String roleId : roleIds) {
                if (enforcer.enforce(roleId, permissionCode, nodeType, transition)) {
                    return true;
                }
            }
            return false;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    private String resolveNodeTypeId(String nodeId) {
        return dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId)
            .fetchOne(DSL.field("node_type_id"), String.class);
    }
}
