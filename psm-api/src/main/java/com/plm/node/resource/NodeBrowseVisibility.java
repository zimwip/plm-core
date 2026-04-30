package com.plm.node.resource;

import com.plm.platform.authz.PolicyPort;
import com.plm.platform.browse.BrowseVisibilityResolver;
import com.plm.platform.browse.dto.ListableDescriptor;
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
 * Filters psm node-type browse descriptors down to those the calling user is
 * allowed to {@code READ_NODE} on. Same context-push pattern as
 * {@link NodeResourceVisibility} — service-to-service visibility calls do not
 * carry a user on the request thread, so the resolver pushes one transiently
 * around the policy check.
 */
@Component
@RequiredArgsConstructor
public class NodeBrowseVisibility implements BrowseVisibilityResolver {

    private final PolicyPort policyService;

    @Override
    public List<ListableDescriptor> filter(ResourceVisibilityContext context, List<ListableDescriptor> all) {
        if (all == null || all.isEmpty()) return List.of();
        if (context == null) return List.of();
        if (context.admin()) return all;

        Set<String> nodeTypeIds = new HashSet<>();
        for (ListableDescriptor d : all) {
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
            Map<String, Boolean> canRead = policyService.canOnNodeTypes("READ_NODE", nodeTypeIds);
            return retainPermitted(all, canRead);
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

    private static List<ListableDescriptor> retainPermitted(List<ListableDescriptor> all,
                                                            Map<String, Boolean> canMapIn) {
        Map<String, Boolean> canMap = canMapIn != null ? canMapIn : new HashMap<>();
        List<ListableDescriptor> kept = new ArrayList<>();
        for (ListableDescriptor d : all) {
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
