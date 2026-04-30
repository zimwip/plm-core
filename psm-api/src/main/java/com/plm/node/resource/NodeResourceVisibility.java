package com.plm.node.resource;

import com.plm.platform.authz.PolicyPort;
import com.plm.platform.resource.ResourceVisibilityResolver;
import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import com.plm.shared.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Filters psm node-type create descriptors down to those the calling user is
 * allowed to {@code CREATE_NODE} on. Bound to platform-api's federated catalog
 * via the platform-lib {@link ResourceVisibilityResolver} SPI.
 *
 * <p>Service-to-service visibility calls do not carry a user context on the
 * request thread (they are authenticated via {@code X-Service-Secret}), so the
 * resolver pushes a transient {@link PlmSecurityContext} reflecting the
 * inbound {@link ResourceVisibilityContext} for the duration of the policy
 * check, then clears it.
 */
@Component
@RequiredArgsConstructor
public class NodeResourceVisibility implements ResourceVisibilityResolver {

    private final PolicyPort policyService;

    @Override
    public List<ResourceDescriptor> filter(ResourceVisibilityContext context, List<ResourceDescriptor> all) {
        if (all == null || all.isEmpty()) return List.of();
        if (context == null) return List.of();
        if (context.admin()) return all;

        Set<String> nodeTypeIds = new HashSet<>();
        for (ResourceDescriptor d : all) {
            if ("psm".equals(d.serviceCode()) && "node".equals(d.resourceCode()) && d.resourceKey() != null) {
                nodeTypeIds.add(d.resourceKey());
            }
        }
        if (nodeTypeIds.isEmpty()) return all;

        PlmUserContext previousUser = safeGet();
        String previousProjectSpace = PlmProjectSpaceContext.get();
        try {
            PlmSecurityContext.set(toPlmContext(context));
            if (context.projectSpaceId() != null) {
                PlmProjectSpaceContext.set(context.projectSpaceId());
            } else {
                PlmProjectSpaceContext.clear();
            }
            Map<String, Boolean> canCreate = policyService.canOnNodeTypes("CREATE_NODE", nodeTypeIds);
            return retainPermitted(all, canCreate);
        } finally {
            if (previousUser != null) PlmSecurityContext.set(previousUser);
            else PlmSecurityContext.clear();
            if (previousProjectSpace != null) PlmProjectSpaceContext.set(previousProjectSpace);
            else PlmProjectSpaceContext.clear();
        }
    }

    private static PlmUserContext toPlmContext(ResourceVisibilityContext c) {
        Set<String> roles = c.roleIds() != null ? new HashSet<>(c.roleIds()) : new HashSet<>();
        return new PlmUserContext(c.userId(), c.userId(), roles, c.admin());
    }

    private static List<ResourceDescriptor> retainPermitted(List<ResourceDescriptor> all,
                                                            Map<String, Boolean> canCreate) {
        Map<String, Boolean> canMap = canCreate != null ? canCreate : new HashMap<>();
        List<ResourceDescriptor> kept = new ArrayList<>();
        for (ResourceDescriptor d : all) {
            if (!"psm".equals(d.serviceCode()) || !"node".equals(d.resourceCode())) {
                kept.add(d);
                continue;
            }
            String key = d.resourceKey();
            if (key == null || Boolean.TRUE.equals(canMap.get(key))) {
                kept.add(d);
            }
        }
        return kept;
    }

    private static PlmUserContext safeGet() {
        try { return PlmSecurityContext.get(); }
        catch (IllegalStateException e) { return null; }
    }
}
