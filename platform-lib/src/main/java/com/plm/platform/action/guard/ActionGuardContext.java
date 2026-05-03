package com.plm.platform.action.guard;

import java.util.Map;

/**
 * Context passed to each action guard during evaluation.
 *
 * @param nodeId                the node being acted upon (nullable for GLOBAL actions)
 * @param nodeTypeId            the node's type
 * @param currentStateId        current lifecycle state (nullable if no lifecycle)
 * @param actionCode            action being evaluated (e.g. "CHECKOUT", "TRANSITION")
 * @param transitionId          lifecycle transition (nullable, only for TRANSITION actions)
 * @param isLocked              whether the node is currently locked by anyone
 * @param isLockedByCurrentUser whether the lock is owned by the requesting user
 * @param currentUserId         the requesting user's ID
 * @param parameters            algorithm instance parameters
 * @param ids                   service-specific ID bag (e.g. "fileId" for DST, "linkId" for PSM)
 */
public record ActionGuardContext(
    String nodeId,
    String nodeTypeId,
    String currentStateId,
    String actionCode,
    String transitionId,
    boolean isLocked,
    boolean isLockedByCurrentUser,
    String currentUserId,
    Map<String, String> parameters,
    Map<String, String> ids
) {
    /** Convenience constructor for node-scoped PSM guards (no extra ids). */
    public ActionGuardContext(
            String nodeId, String nodeTypeId, String currentStateId,
            String actionCode, String transitionId,
            boolean isLocked, boolean isLockedByCurrentUser,
            String currentUserId, Map<String, String> parameters) {
        this(nodeId, nodeTypeId, currentStateId, actionCode, transitionId,
             isLocked, isLockedByCurrentUser, currentUserId, parameters, Map.of());
    }
}
