package com.plm.platform.authz;

import com.plm.platform.client.ServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.casbin.jcasbin.main.Enforcer;
import org.springframework.core.ParameterizedTypeReference;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Pulls the v2 authorization snapshot from pno-api and refreshes both the
 * {@link ScopeDefinitionCache} and the {@link DynamicPolicyAdapter} before
 * asking the {@link Enforcer} to reload.
 *
 * <p>Refresh is fully event-driven: the snapshot is pulled once at boot and
 * then only when NATS {@code global.AUTHORIZATION_CHANGED} fires (grant change
 * on pno, or pno announcing its own startup). No periodic polling.
 */
@Slf4j
public class PermissionPolicySnapshotClient {

    private static final String PNO_SERVICE_CODE = "pno";
    private static final String SNAPSHOT_PATH    = "/internal/authorization/snapshot";

    private final ServiceClient            serviceClient;
    private final DynamicPolicyAdapter     adapter;
    private final ScopeDefinitionCache     scopes;
    private final Enforcer                 enforcer;

    public PermissionPolicySnapshotClient(ServiceClient serviceClient,
                                          DynamicPolicyAdapter adapter,
                                          ScopeDefinitionCache scopes,
                                          Enforcer enforcer) {
        this.serviceClient = serviceClient;
        this.adapter       = adapter;
        this.scopes        = scopes;
        this.enforcer      = enforcer;
    }

    /**
     * Fetch + swap + {@code enforcer.loadPolicy()}. Swallows transient errors and
     * logs at warn; callers that need boot-time guarantees drive their own
     * retry.
     *
     * <p>Driven by {@code AuthzSnapshotBootstrapper} (boot),
     * {@code AuthzChangeSubscriber} (NATS {@code global.AUTHORIZATION_CHANGED})
     * and {@code DefaultPolicyEnforcer.reload()}. No periodic polling.
     */
    @SuppressWarnings("unchecked")
    public void reload() {
        try {
            Map<String, Object> snap = serviceClient.get(PNO_SERVICE_CODE, SNAPSHOT_PATH,
                new ParameterizedTypeReference<Map<String, Object>>() {});
            if (snap == null) {
                log.warn("Authorization snapshot fetch returned null");
                return;
            }

            // Scopes
            List<ScopeDefinitionCache.ScopeDef> scopeDefs = new ArrayList<>();
            Object rawScopes = snap.get("scopes");
            if (rawScopes instanceof List<?> list) {
                for (Object o : list) {
                    if (o instanceof Map<?, ?> m) {
                        String code   = str(m.get("code"));
                        String parent = str(m.get("parent"));
                        Object keysObj = m.get("keys");
                        List<String> keyNames = Collections.emptyList();
                        if (keysObj instanceof List<?> kl && !kl.isEmpty()) {
                            List<String> ks = new ArrayList<>();
                            for (Object k : kl) {
                                if (k instanceof String s) ks.add(s);
                                else if (k instanceof Map<?, ?> km) {
                                    String n = str(km.get("name"));
                                    if (n != null) ks.add(n);
                                }
                            }
                            keyNames = ks;
                        }
                        scopeDefs.add(new ScopeDefinitionCache.ScopeDef(code, parent, keyNames));
                    }
                }
            }
            scopes.reload(scopeDefs);

            // Policies
            Object rawPolicies = snap.get("policies");
            if (rawPolicies instanceof List<?> pl) {
                adapter.setSnapshot((List<Map<String, Object>>) pl);
            } else {
                adapter.setSnapshot(Collections.emptyList());
            }

            enforcer.loadPolicy();
            log.info("Authorization snapshot reloaded (v{})", snap.get("snapshotApiVersion"));
        } catch (Exception e) {
            log.warn("Failed to reload authorization snapshot: {}", e.getMessage());
        }
    }

    private static String str(Object o) {
        return o == null ? null : o.toString();
    }
}
