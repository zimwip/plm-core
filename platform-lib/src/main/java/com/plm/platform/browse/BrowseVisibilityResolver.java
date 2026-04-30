package com.plm.platform.browse;

import com.plm.platform.browse.dto.ListableDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;

import java.util.List;

/**
 * Per-service hook that filters this service's contributed listable descriptors
 * to those a specific user is allowed to browse.
 *
 * <p>platform-api fans out to each registered service's
 * {@code /internal/browse/visible} endpoint passing a
 * {@link ResourceVisibilityContext}; each service's resolver decides locally —
 * psm checks {@code READ_NODE} per nodeType, dst checks {@code READ_DATA}, etc.
 *
 * <p>Reusing {@link ResourceVisibilityContext} from the create axis keeps the
 * federation surface small: same user payload, different decision domain.
 */
public interface BrowseVisibilityResolver {

    List<ListableDescriptor> filter(ResourceVisibilityContext context, List<ListableDescriptor> all);
}
