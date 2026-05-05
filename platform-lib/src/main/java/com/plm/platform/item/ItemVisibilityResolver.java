package com.plm.platform.item;

import com.plm.platform.item.dto.ItemDescriptor;
import com.plm.platform.item.dto.ItemVisibilityContext;

/**
 * Per-service hook that filters this service's contributed item descriptors
 * to those a specific user is allowed to act on.
 *
 * <p>Returns either a copy of {@code descriptor} with disallowed actions
 * nulled out, or {@code null} if no action remains for this user. This
 * per-action rebuild lets services express asymmetric permissions
 * — e.g. psm grants {@code READ_NODE} on {@code Document} but not
 * {@code CREATE_NODE} — by emitting {@code create=null, list=ListAction(...)}.
 *
 * <p>platform-api fans out to each registered service's
 * {@code /internal/items/visible} endpoint passing an
 * {@link ItemVisibilityContext}; each service's resolver decides locally —
 * psm checks node-type permissions, dst checks {@code WRITE_DATA} /
 * {@code READ_DATA}, etc.
 *
 * <p>If a service does not declare a resolver bean,
 * {@link DefaultItemVisibilityResolver} is used and all contributed
 * descriptors are returned unfiltered.
 */
public interface ItemVisibilityResolver {

    ItemDescriptor filter(ItemVisibilityContext context, ItemDescriptor descriptor);
}
