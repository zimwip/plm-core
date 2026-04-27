package com.plm.platform.config.dto;

import java.util.List;

/**
 * Lifecycle transition with guards and signature requirements.
 */
public record LifecycleTransitionConfig(
    String id,
    String lifecycleId,
    String name,
    String fromStateId,
    String toStateId,
    String guardExpr,
    String actionType,
    String versionStrategy,
    List<SignatureRequirementConfig> signatureRequirements,
    List<TransitionGuardConfig> guards
) {}
