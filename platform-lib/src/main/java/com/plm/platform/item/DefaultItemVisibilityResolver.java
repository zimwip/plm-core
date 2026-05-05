package com.plm.platform.item;

import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;

/**
 * Fallback resolver. Returns every contributed descriptor unchanged.
 *
 * <p>Per-action permission filtering is the responsibility of services
 * that declare their own resolver bean; descriptors that pass through
 * the default resolver are visible to any caller. Services contributing
 * non-public items must override.
 */
public class DefaultItemVisibilityResolver implements ItemVisibilityResolver {

    @Override
    public ItemDescriptor filter(ItemVisibilityContext context, ItemDescriptor descriptor) {
        return descriptor;
    }
}
