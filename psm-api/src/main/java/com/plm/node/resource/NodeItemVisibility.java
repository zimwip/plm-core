package com.plm.node.resource;

import com.plm.platform.authz.PolicyPort;
import com.plm.platform.item.ItemVisibilityResolver;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import com.plm.shared.security.PlmProjectSpaceContext;
import com.plm.shared.security.PlmSecurityContext;
import com.plm.shared.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Per-action visibility filter for psm node-type items.
 *
 * <p>Today's psm permissions split create from read: a user may be granted
 * {@code READ_NODE} on {@code Document} but not {@code CREATE_NODE}. The
 * resolver runs both checks in the same context-pushed block, then rebuilds
 * the descriptor with {@code create} / {@code list} / {@code get} set to
 * null where denied. Returns null if every action ends up denied.
 *
 * <p>Service-to-service visibility calls do not carry a user context on
 * the request thread (they are authenticated via {@code X-Service-Secret}),
 * so the resolver pushes a transient {@link PlmSecurityContext} reflecting
 * the inbound {@link ItemVisibilityContext} for the duration of the policy
 * check, then clears it.
 */
@Component
@RequiredArgsConstructor
public class NodeItemVisibility implements ItemVisibilityResolver {

    private final PolicyPort policyService;

    @Override
    public ItemDescriptor filter(ItemVisibilityContext context, ItemDescriptor descriptor) {
        if (descriptor == null) return null;
        if (context == null) return null;
        if (!"psm".equals(descriptor.serviceCode()) || !"node".equals(descriptor.itemCode())) {
            return descriptor;
        }
        if (context.admin()) return descriptor;

        String key = descriptor.itemKey();
        if (key == null) return descriptor;

        Set<String> nodeTypeIds = Set.of(key);
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
            Map<String, Boolean> canRead   = policyService.canOnNodeTypes("READ_NODE",   nodeTypeIds);

            boolean createAllowed = canCreate != null && Boolean.TRUE.equals(canCreate.get(key));
            boolean readAllowed   = canRead   != null && Boolean.TRUE.equals(canRead.get(key));

            if (!createAllowed && !readAllowed) return null;

            return new ItemDescriptor(
                descriptor.serviceCode(),
                descriptor.itemCode(),
                descriptor.itemKey(),
                descriptor.displayName(),
                descriptor.description(),
                descriptor.icon(),
                descriptor.color(),
                descriptor.sourceLabel(),
                descriptor.panelSection(),
                descriptor.priority(),
                createAllowed ? descriptor.create() : null,
                readAllowed   ? descriptor.list()   : null,
                readAllowed   ? descriptor.get()    : null,
                descriptor.importActions(),
                descriptor.events()
            );
        } finally {
            if (previousUser != null) PlmSecurityContext.set(previousUser);
            else PlmSecurityContext.clear();
            if (previousProjectSpace != null) PlmProjectSpaceContext.set(previousProjectSpace);
            else PlmProjectSpaceContext.clear();
        }
    }

    private static PlmUserContext toPlmContext(ItemVisibilityContext c) {
        Set<String> roles = c.roleIds() != null ? new HashSet<>(c.roleIds()) : new HashSet<>();
        return new PlmUserContext(c.userId(), c.userId(), roles, c.admin());
    }

    private static PlmUserContext safeGet() {
        try { return PlmSecurityContext.get(); }
        catch (IllegalStateException e) { return null; }
    }
}
