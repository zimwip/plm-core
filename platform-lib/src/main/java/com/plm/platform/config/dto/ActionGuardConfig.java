package com.plm.platform.config.dto;

/**
 * Guard attached to an action. Covers all 3 tiers:
 * <ul>
 *   <li>ACTION — guard on the action itself</li>
 *   <li>TRANSITION — guard on a lifecycle transition</li>
 *   <li>NODE_TYPE — node-type-specific override (ADD/DISABLE)</li>
 * </ul>
 */
public record ActionGuardConfig(
    String id,
    String algorithmInstanceId,
    String effect,
    int displayOrder,
    String tier,
    String actionId,
    String transitionId,
    String nodeTypeId,
    String overrideAction
) {}
