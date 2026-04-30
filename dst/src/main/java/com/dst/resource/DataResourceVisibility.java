package com.dst.resource;

import com.plm.platform.resource.ResourceVisibilityResolver;
import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Filters dst's data-object create descriptor down to users who hold
 * {@code WRITE_DATA} as a global grant. Bound to platform-api's federated
 * catalog via the platform-lib {@link ResourceVisibilityResolver} SPI.
 */
@Component
public class DataResourceVisibility implements ResourceVisibilityResolver {

    private static final String WRITE_DATA = "WRITE_DATA";

    @Override
    public List<ResourceDescriptor> filter(ResourceVisibilityContext context, List<ResourceDescriptor> all) {
        if (all == null || all.isEmpty()) return List.of();
        if (context == null) return List.of();
        if (context.admin()) return all;

        Set<String> grants = context.globalPerms() != null ? context.globalPerms() : Set.of();
        return grants.contains(WRITE_DATA) ? all : List.of();
    }
}
