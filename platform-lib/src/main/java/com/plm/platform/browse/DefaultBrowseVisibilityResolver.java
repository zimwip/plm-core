package com.plm.platform.browse;

import com.plm.platform.browse.dto.ListableDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;

import java.util.List;

/**
 * Fallback resolver used when a service exposes browsable resources but does
 * not declare its own {@link BrowseVisibilityResolver}: returns all contributed
 * descriptors. Suitable when the source has no per-user gating to apply on the
 * read axis.
 */
public class DefaultBrowseVisibilityResolver implements BrowseVisibilityResolver {

    @Override
    public List<ListableDescriptor> filter(ResourceVisibilityContext context, List<ListableDescriptor> all) {
        return all == null ? List.of() : all;
    }
}
