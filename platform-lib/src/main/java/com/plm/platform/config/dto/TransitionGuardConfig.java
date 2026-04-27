package com.plm.platform.config.dto;

/**
 * Guard attached to a lifecycle transition (tier 2).
 */
public record TransitionGuardConfig(
    String id,
    String lifecycleTransitionId,
    String algorithmInstanceId,
    String effect,
    int displayOrder
) {}
