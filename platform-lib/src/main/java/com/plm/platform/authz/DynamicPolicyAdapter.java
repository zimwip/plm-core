package com.plm.platform.authz;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.model.Model;
import org.casbin.jcasbin.persist.Adapter;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Read-only Casbin adapter that projects pno-api's v2 authorization snapshot
 * into the 6-field model. Policies are refreshed by {@link PermissionPolicySnapshotClient}
 * which swaps the active snapshot and triggers {@code enforcer.loadPolicy()}.
 *
 * <p>Projection per row:
 * <ul>
 *   <li>{@code sub}            = roleId</li>
 *   <li>{@code project_space}  = projectSpaceId</li>
 *   <li>{@code scope}          = scopeCode</li>
 *   <li>{@code act}            = permissionCode</li>
 *   <li>{@code object}         = value of the scope's first key (empty for GLOBAL)</li>
 *   <li>{@code attrs}          = remaining key values encoded {@code name=val|name=val} (ordered by scope key position)</li>
 * </ul>
 */
@Slf4j
@RequiredArgsConstructor
public class DynamicPolicyAdapter implements Adapter {

    private final ScopeDefinitionCache scopes;
    /** Snapshot installed by PermissionPolicySnapshotClient before each {@code loadPolicy()} call. */
    private final AtomicReference<List<Map<String, Object>>> snapshot = new AtomicReference<>(List.of());

    /** Called by {@link PermissionPolicySnapshotClient} before {@code enforcer.loadPolicy()}. */
    public void setSnapshot(List<Map<String, Object>> rows) {
        snapshot.set(rows != null ? rows : List.of());
    }

    @Override
    public void loadPolicy(Model model) {
        List<Map<String, Object>> rows = snapshot.get();
        int count = 0;
        for (Map<String, Object> row : rows) {
            String roleId         = asString(row.get("role_id"));
            String permissionCode = asString(row.get("permission_code"));
            String scopeCode      = asString(firstNonNull(row.get("scope"), row.get("scope_code")));
            if (roleId == null || permissionCode == null || scopeCode == null) {
                continue;
            }
            // NULL project_space_id = global grant (keyless scope, e.g. DATA).
            // Maps to "" in Casbin — matches DefaultPolicyEnforcer's effectivePsid for keyless scopes.
            String rawPsid        = asString(row.get("project_space_id"));
            String projectSpaceId = rawPsid != null ? rawPsid : "";

            @SuppressWarnings("unchecked")
            Map<String, String> keys = row.get("keys") instanceof Map<?, ?>
                ? (Map<String, String>) row.get("keys")
                : Map.of();

            String object = "";
            String attrs  = "";

            ScopeDefinitionCache.ScopeDef def = scopes.get(scopeCode);
            if (def != null && !def.keys().isEmpty()) {
                List<String> keyNames = def.keys();
                String firstName = keyNames.get(0);
                String firstVal  = keys.getOrDefault(firstName, "");
                object = firstVal != null ? firstVal : "";

                if (keyNames.size() > 1) {
                    StringBuilder sb = new StringBuilder();
                    for (int i = 1; i < keyNames.size(); i++) {
                        if (i > 1) sb.append('|');
                        String n = keyNames.get(i);
                        String v = keys.getOrDefault(n, "");
                        sb.append(n).append('=').append(v != null ? v : "");
                    }
                    attrs = sb.toString();
                }
            }

            List<String> rule = new ArrayList<>(6);
            rule.add(roleId);
            rule.add(projectSpaceId);
            rule.add(scopeCode);
            rule.add(permissionCode);
            rule.add(object);
            rule.add(attrs);
            model.addPolicy("p", "p", rule);
            count++;
        }
        log.info("Casbin: loaded {} policy row(s) from pno-api snapshot", count);
    }

    private static Object firstNonNull(Object a, Object b) {
        return a != null ? a : b;
    }

    private static String asString(Object o) {
        return o == null ? null : o.toString();
    }

    @Override public void savePolicy(Model model) {
        throw new UnsupportedOperationException("Policy writes go through pno-api");
    }

    @Override public void addPolicy(String sec, String ptype, List<String> rule) {
        throw new UnsupportedOperationException("Policy writes go through pno-api");
    }

    @Override public void removePolicy(String sec, String ptype, List<String> rule) {
        throw new UnsupportedOperationException("Policy writes go through pno-api");
    }

    @Override public void removeFilteredPolicy(String sec, String ptype, int fieldIndex, String... fieldValues) {
        throw new UnsupportedOperationException("Policy writes go through pno-api");
    }
}
