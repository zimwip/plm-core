package com.plm.platform.browse;

import com.plm.platform.browse.dto.ListableDescriptor;

import java.util.List;

/**
 * Service-supplied bean contributing one or more browsable resources to the
 * federated platform-api navigation tree.
 *
 * <p>Mirrors {@link com.plm.platform.resource.ResourceCatalogContribution} for
 * the read/list axis. Declare one {@code @Component} per resource (or per group)
 * and the platform-lib auto-config takes care of registration, retry, and
 * periodic re-registration.
 */
public interface ListableContribution {

    List<ListableDescriptor> descriptors();
}
