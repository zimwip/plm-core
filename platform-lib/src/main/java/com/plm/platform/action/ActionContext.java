package com.plm.platform.action;

import java.util.Map;

/**
 * Immutable execution context passed to every ActionHandler.
 *
 * @param nodeId       the target node (nullable for GLOBAL actions)
 * @param nodeTypeId   the node's type (nullable for GLOBAL actions)
 * @param actionId     the action.id being executed (nullable for simple services)
 * @param actionCode   the action code (e.g. "CHECKOUT", "DOWNLOAD")
 * @param transitionId non-null only for LIFECYCLE-scope actions
 * @param userId       the user triggering the action
 * @param txId         the PLM transaction (nullable for non-transactional actions)
 * @param ids          generic ID bag for custom scopes (keyed by segment name)
 */
public record ActionContext(
    String nodeId,
    String nodeTypeId,
    String actionId,
    String actionCode,
    String transitionId,
    String userId,
    String txId,
    Map<String, String> ids
) {
    /** Returns a copy with a different txId (used by TransactionWrapper). */
    public ActionContext withTxId(String newTxId) {
        return new ActionContext(nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, newTxId, ids);
    }
}
