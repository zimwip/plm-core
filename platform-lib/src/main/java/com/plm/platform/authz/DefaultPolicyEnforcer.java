package com.plm.platform.authz;

import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Default {@link PolicyEnforcer} — wraps a Casbin {@link Enforcer} and builds
 * the 6-field request tuple from the scope definition.
 *
 * <p>Admin users bypass every check. Users without any role are always denied.
 * If the {@link ScopeDefinitionCache} is empty, the enforcer attempts a single
 * synchronous reload; if that still leaves the cache empty, it fails closed
 * (deny + warn) rather than leaking unfiltered data.
 */
@Slf4j
public class DefaultPolicyEnforcer implements PolicyEnforcer {

    private final Enforcer                     enforcer;
    private final ScopeDefinitionCache         scopes;
    private final AuthzContextProvider         authz;
    private final PermissionPolicySnapshotClient snapshotClient;
    private final ReadWriteLock                rwLock = new ReentrantReadWriteLock();

    public DefaultPolicyEnforcer(Enforcer enforcer,
                                 ScopeDefinitionCache scopes,
                                 AuthzContextProvider authz,
                                 PermissionPolicySnapshotClient snapshotClient) {
        this.enforcer       = enforcer;
        this.scopes         = scopes;
        this.authz          = authz;
        this.snapshotClient = snapshotClient;
    }

    @Override
    public void assertScope(String scopeCode, String permissionCode, Map<String, String> keys) {
        if (!canScope(scopeCode, permissionCode, keys)) {
            AuthzContext ctx = authz.currentOrNull();
            String userId = ctx != null ? ctx.userId() : "<unauthenticated>";
            throw new PolicyDeniedException(
                "User " + userId + " cannot '" + permissionCode + "' on scope " + scopeCode
                    + (keys != null && !keys.isEmpty() ? " with " + keys : ""));
        }
    }

    @Override
    public boolean canScope(String scopeCode, String permissionCode, Map<String, String> keys) {
        AuthzContext ctx = authz.currentOrNull();
        if (ctx == null) return false;
        if (ctx.isAdmin()) return true;

        Set<String> roleIds = ctx.roleIds();
        if (roleIds == null || roleIds.isEmpty()) return false;

        if (!scopes.isPopulated()) {
            log.warn("Policy enforcer: scope cache empty — attempting synchronous snapshot reload for '{}' on scope {}",
                permissionCode, scopeCode);
            try {
                snapshotClient.reload();
            } catch (Exception e) {
                log.warn("Synchronous snapshot reload failed: {}", e.getMessage());
            }
            if (!scopes.isPopulated()) {
                log.warn("Policy enforcer: scope cache still empty after reload — denying '{}' on scope {}",
                    permissionCode, scopeCode);
                return false;
            }
        }

        String projectSpaceId = ctx.projectSpaceId();
        if (projectSpaceId == null || projectSpaceId.isBlank()) {
            throw new IllegalStateException(
                "No projectSpaceId in context — required for every authorization check");
        }

        String[] objAttrs = encode(scopeCode, keys != null ? keys : Map.of());
        String object = objAttrs[0];
        String attrs  = objAttrs[1];

        rwLock.readLock().lock();
        try {
            for (String roleId : roleIds) {
                if (enforcer.enforce(roleId, projectSpaceId, scopeCode, permissionCode, object, attrs)) {
                    return true;
                }
            }
            return false;
        } finally {
            rwLock.readLock().unlock();
        }
    }

    @Override
    public void reload() {
        rwLock.writeLock().lock();
        try {
            snapshotClient.reload();
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private String[] encode(String scopeCode, Map<String, String> keys) {
        ScopeDefinitionCache.ScopeDef def = scopes.get(scopeCode);
        if (def == null || def.keys().isEmpty()) {
            return new String[] { "", "" };
        }
        List<String> names = def.keys();
        String object = keys.getOrDefault(names.get(0), "");
        if (names.size() == 1) {
            return new String[] { object, "" };
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i < names.size(); i++) {
            if (i > 1) sb.append('|');
            String n = names.get(i);
            String v = keys.getOrDefault(n, "");
            sb.append(n).append('=').append(v != null ? v : "");
        }
        return new String[] { object, sb.toString() };
    }
}
