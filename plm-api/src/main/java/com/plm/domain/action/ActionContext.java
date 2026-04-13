package com.plm.domain.action;

/**
 * Immutable execution context passed to every ActionHandler.
 *
 * @param nodeId            the target node
 * @param nodeTypeId        the node's type
 * @param nodeTypeActionId  the node_type_action.id that was invoked
 * @param transitionId      non-null only for TRANSITION actions
 * @param userId            the user triggering the action
 * @param txId              the PLM transaction (may be null for actions with requires_tx=false)
 */
public record ActionContext(
    String nodeId,
    String nodeTypeId,
    String nodeTypeActionId,
    String transitionId,
    String userId,
    String txId
) {}
