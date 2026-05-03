package com.plm.platform.api.registry;

import java.time.Instant;
import java.util.List;

public record ServiceActionCatalog(
    String serviceCode,
    List<ActionCatalogRegistry.HandlerEntry> handlers,
    List<ActionCatalogRegistry.GuardEntry> guards,
    Instant registeredAt
) {}
