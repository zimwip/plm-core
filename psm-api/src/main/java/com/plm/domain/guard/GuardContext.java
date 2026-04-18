package com.plm.domain.guard;

import java.util.Map;

/**
 * Context passed to each guard during evaluation.
 *
 * Contains all information a guard might need to make its decision.
 * Guards should not query for information already available in the context.
 * Admin bypass is NOT exposed here — it is handled solely by {@link GuardService}.
 *
 * @param nodeId               the node being acted upon (nullable for GLOBAL actions)
 * @param nodeTypeId           the node's type
 * @param currentStateId       current lifecycle state (nullable if no lifecycle)
 * @param actionCode           action being evaluated (e.g. "CHECKOUT", "TRANSITION")
 * @param transitionId         lifecycle transition (nullable, only for TRANSITION actions)
 * @param isLocked             whether the node is currently locked by anyone
 * @param isLockedByCurrentUser whether the lock is owned by the requesting user
 * @param currentUserId        the requesting user's ID
 * @param parameters           algorithm instance parameters (from algorithm_instance_param_value)
 */
public record GuardContext(
    String nodeId,
    String nodeTypeId,
    String currentStateId,
    String actionCode,
    String transitionId,
    boolean isLocked,
    boolean isLockedByCurrentUser,
    String currentUserId,
    Map<String, String> parameters
) {}
