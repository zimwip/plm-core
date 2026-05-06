package com.dst.resource;

import com.dst.security.DstSecurityContext;
import com.dst.security.DstUserContext;
import com.plm.platform.authz.PolicyDeniedException;
import com.plm.platform.item.ItemVisibilityResolver;
import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

/**
 * Per-action visibility filter for dst data-object items.
 *
 * DST is a business service: authorization is per project space.
 * If no project space is active (global context), the item is not visible.
 * WRITE_DATA gates {@code create}, READ_DATA gates {@code list} and {@code get}.
 *
 * The resolver pushes a transient {@link DstUserContext} so the
 * platform-lib Casbin aspect on {@link DataPermissionGate} can resolve
 * the caller's identity and project space.
 */
@Component
@RequiredArgsConstructor
public class DataItemVisibility implements ItemVisibilityResolver {

    private final DataPermissionGate gate;

    @Override
    public ItemDescriptor filter(ItemVisibilityContext context, ItemDescriptor descriptor) {
        if (descriptor == null) return null;
        if (context == null) return null;
        if (!"dst".equals(descriptor.serviceCode())) return descriptor;
        if (context.admin()) return descriptor;

        // Business service: items are scoped per project space.
        if (context.projectSpaceId() == null || context.projectSpaceId().isBlank()) return null;

        DstUserContext previous = DstSecurityContext.getOrNull();
        try {
            DstSecurityContext.set(toDstContext(context));
            boolean canWrite = check(gate::assertCanWrite);
            boolean canRead  = check(gate::assertCanRead);

            if (!canWrite && !canRead) return null;

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
                canWrite ? descriptor.create() : null,
                canRead  ? descriptor.list()   : null,
                canRead  ? descriptor.get()    : null
            );
        } finally {
            if (previous != null) DstSecurityContext.set(previous);
            else DstSecurityContext.clear();
        }
    }

    private static boolean check(Runnable assertion) {
        try {
            assertion.run();
            return true;
        } catch (PolicyDeniedException e) {
            return false;
        }
    }

    private static DstUserContext toDstContext(ItemVisibilityContext c) {
        Set<String> roles = c.roleIds() != null ? new HashSet<>(c.roleIds()) : new HashSet<>();
        return new DstUserContext(c.userId(), c.userId(), roles, c.admin(), c.projectSpaceId());
    }
}
