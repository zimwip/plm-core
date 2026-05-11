package com.plm.platform.action.dto;

import java.util.List;
import java.util.Map;

/**
 * Full registry state pushed from spe-api to connected services.
 * Wire format for POST /internal/registry/update and GET /api/spe/registry/snapshot.
 * The monotonic {@code version} lets clients reject stale/out-of-order pushes.
 */
public record RegistrySnapshot(
    long version,
    Map<String, List<ServiceInstanceInfo>> services
) {}
