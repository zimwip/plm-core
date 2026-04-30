package com.plm.platform.resource;

import com.plm.platform.resource.dto.ResourceDescriptor;
import com.plm.platform.resource.dto.ResourceVisibilityContext;

import java.util.List;

/**
 * Per-service hook that filters this service's contributed resource descriptors
 * to those a specific user is allowed to create.
 *
 * <p>platform-api fans out to every registered service's
 * {@code /internal/resources/visible} endpoint passing a {@link ResourceVisibilityContext};
 * each service's resolver decides locally — psm checks {@code CREATE_NODE} per
 * nodeType, dst checks {@code WRITE_DATA} grant, etc. The federated catalog
 * thus carries authoritative per-user filtering owned by each source service,
 * not by platform-api.
 *
 * <p>If a service does not declare a resolver bean, {@link DefaultResourceVisibilityResolver}
 * is used and all locally contributed descriptors are returned unfiltered.
 */
public interface ResourceVisibilityResolver {

    List<ResourceDescriptor> filter(ResourceVisibilityContext context, List<ResourceDescriptor> all);
}
