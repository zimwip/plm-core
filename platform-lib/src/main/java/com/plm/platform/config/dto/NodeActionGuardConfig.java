package com.plm.platform.config.dto;

/**
 * Node-type-specific action guard (node_action_guard table).
 */
public record NodeActionGuardConfig(
    String id,
    String nodeTypeId,
    String actionId,
    String transitionId,
    String algorithmInstanceId,
    String effect,
    String overrideAction,
    int displayOrder
) {}
