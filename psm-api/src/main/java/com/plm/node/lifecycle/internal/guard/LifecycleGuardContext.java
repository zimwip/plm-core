package com.plm.node.lifecycle.internal.guard;

import java.util.Map;

/**
 * Context passed to each lifecycle guard during evaluation.
 *
 * @param nodeId               the node undergoing the transition
 * @param nodeTypeId           the node's type
 * @param currentStateId       current lifecycle state
 * @param transitionId         the transition being evaluated
 * @param isLocked             whether the node is currently locked
 * @param isLockedByCurrentUser whether the lock is owned by the requesting user
 * @param currentUserId        the requesting user's ID
 * @param parameters           algorithm instance parameters
 */
public record LifecycleGuardContext(
    String nodeId,
    String nodeTypeId,
    String currentStateId,
    String transitionId,
    boolean isLocked,
    boolean isLockedByCurrentUser,
    String currentUserId,
    Map<String, String> parameters
) {}
