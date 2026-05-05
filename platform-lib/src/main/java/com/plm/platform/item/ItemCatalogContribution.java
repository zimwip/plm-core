package com.plm.platform.item;

import com.plm.platform.item.dto.ItemDescriptor;

import java.util.List;

/**
 * Service-supplied bean contributing one or more items to the federated
 * platform-api catalog.
 *
 * <p>An "item" is anything a service exposes that the frontend might create,
 * list, or open — e.g. PSM nodes, DST data objects. Each contribution
 * returns one or more {@link ItemDescriptor} entries with the full triple
 * of actions ({@code create}, {@code list}, {@code get}); any action may
 * be {@code null} at the source if the item type does not support it (a
 * read-only item type emits {@code create=null}).
 *
 * <p>Per-user permission filtering is the
 * {@link ItemVisibilityResolver}'s job — contributions emit the full set
 * of actions for the item type, the resolver nulls out any action the
 * caller may not perform.
 */
public interface ItemCatalogContribution {

    List<ItemDescriptor> descriptors();
}
