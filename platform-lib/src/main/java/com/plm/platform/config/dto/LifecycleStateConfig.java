package com.plm.platform.config.dto;

/**
 * Lifecycle state definition.
 */
public record LifecycleStateConfig(
    String id,
    String lifecycleId,
    String name,
    boolean isInitial,
    int displayOrder,
    String color
) {}
