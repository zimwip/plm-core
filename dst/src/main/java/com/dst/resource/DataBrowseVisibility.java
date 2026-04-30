package com.dst.resource;

import com.plm.platform.browse.BrowseVisibilityResolver;
import com.plm.platform.browse.dto.ListableDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

/**
 * Filters dst's browse descriptor down to users who hold {@code READ_DATA} as a
 * global grant. Mirrors {@link DataResourceVisibility} for the read axis.
 */
@Component
public class DataBrowseVisibility implements BrowseVisibilityResolver {

    private static final String READ_DATA = "READ_DATA";

    @Override
    public List<ListableDescriptor> filter(ResourceVisibilityContext context, List<ListableDescriptor> all) {
        if (all == null || all.isEmpty()) return List.of();
        if (context == null) return List.of();
        if (context.admin()) return all;

        Set<String> grants = context.globalPerms() != null ? context.globalPerms() : Set.of();
        return grants.contains(READ_DATA) ? all : List.of();
    }
}
