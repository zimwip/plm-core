package com.plm.platform.config.dto;

/**
 * State action configuration. Covers both lifecycle_state_action (tier 1)
 * and node_type_state_action (tier 2, with nodeTypeId and overrideAction).
 */
public record StateActionConfig(
    String id,
    String lifecycleStateId,
    String algorithmInstanceId,
    String trigger,
    String executionMode,
    int displayOrder,
    String nodeTypeId,
    String overrideAction
) {}
