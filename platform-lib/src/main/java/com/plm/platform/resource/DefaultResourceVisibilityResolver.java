package com.plm.platform.resource;

import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;

import java.util.List;

/**
 * Fallback resolver used when a service exposes resources but does not declare
 * its own {@link ResourceVisibilityResolver}: returns all contributed
 * descriptors. Suitable when the source service has no per-user gating to
 * apply (or relies entirely on enforcement at the action endpoint).
 */
public class DefaultResourceVisibilityResolver implements ResourceVisibilityResolver {

    @Override
    public List<ResourceDescriptor> filter(ResourceVisibilityContext context, List<ResourceDescriptor> all) {
        return all == null ? List.of() : all;
    }
}
