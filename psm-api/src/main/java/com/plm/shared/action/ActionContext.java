package com.plm.shared.action;

/**
 * Immutable execution context passed to every ActionHandler.
 *
 * @param nodeId       the target node
 * @param nodeTypeId   the node's type
 * @param actionId     the {@code action.id} being executed
 * @param actionCode   the {@code action.action_code} (duplicated for handler convenience)
 * @param transitionId non-null only for LIFECYCLE-scope actions
 * @param userId       the user triggering the action
 * @param txId         the PLM transaction (may be null for actions with requires_tx=false)
 */
public record ActionContext(
    String nodeId,
    String nodeTypeId,
    String actionId,
    String actionCode,
    String transitionId,
    String userId,
    String txId
) {
    /** Returns a copy with a different txId (used by TransactionWrapper). */
    public ActionContext withTxId(String newTxId) {
        return new ActionContext(nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, newTxId);
    }
}
