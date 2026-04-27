package com.plm.platform.config.dto;

import java.util.List;

/**
 * Lifecycle definition including states and transitions.
 */
public record LifecycleConfig(
    String id,
    String name,
    String description,
    List<LifecycleStateConfig> states,
    List<LifecycleTransitionConfig> transitions
) {}
