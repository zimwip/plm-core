package com.plm.platform.config.dto;

/**
 * Signature requirement on a lifecycle transition.
 */
public record SignatureRequirementConfig(
    String id,
    String lifecycleTransitionId,
    String roleRequired,
    int displayOrder
) {}
