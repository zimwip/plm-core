package com.plm.platform.resource;

import com.plm.platform.resource.dto.ResourceDescriptor;

import java.util.List;

/**
 * Service-supplied bean contributing one or more resources to the federated
 * platform-api catalog.
 *
 * <p>A "resource" is anything a service exposes that the frontend might create,
 * list, or act upon — e.g. PSM nodes, DST data objects. Each contribution
 * returns one or more {@link ResourceDescriptor} entries; the
 * {@link ResourceCatalogRegistrationClient} batches them at boot and POSTs to
 * platform-api {@code /internal/resources/register}.
 *
 * <p>Mirrors the {@code PermissionScopeContribution} / {@code SettingSectionDto}
 * pattern: declare one {@code @Component} per resource (or per group) and the
 * platform-lib auto-config takes care of registration + retry + re-registration.
 */
public interface ResourceCatalogContribution {

    List<ResourceDescriptor> descriptors();
}
