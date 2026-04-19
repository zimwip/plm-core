package com.plm.domain.stateaction;

import java.util.Map;

/**
 * Context passed to each {@link StateAction} during execution.
 *
 * @param nodeId       the node undergoing the transition
 * @param nodeTypeId   the node's type
 * @param fromStateId  lifecycle state being left
 * @param toStateId    lifecycle state being entered
 * @param transitionId the transition being applied
 * @param userId       the user performing the transition
 * @param txId         the PLM transaction ID
 * @param versionId    the LIFECYCLE version just created by the transition
 * @param revision     current revision letter (e.g. "A", "B")
 * @param iteration    current iteration number
 * @param parameters   algorithm instance parameters (from algorithm_instance_param_value)
 */
public record StateActionContext(
    String nodeId,
    String nodeTypeId,
    String fromStateId,
    String toStateId,
    String transitionId,
    String userId,
    String txId,
    String versionId,
    String revision,
    int    iteration,
    Map<String, String> parameters
) {
    public StateActionContext withParameters(Map<String, String> newParams) {
        return new StateActionContext(nodeId, nodeTypeId, fromStateId, toStateId,
            transitionId, userId, txId, versionId, revision, iteration, newParams);
    }
}
