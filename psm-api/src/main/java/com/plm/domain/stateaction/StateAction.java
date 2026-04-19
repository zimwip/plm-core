package com.plm.domain.stateaction;

import com.plm.domain.algorithm.AlgorithmType;

/**
 * Algorithm interface for lifecycle state actions.
 *
 * State actions execute side-effects when entering or exiting a lifecycle state.
 * Unlike guards (which evaluate preconditions and return violations), state actions
 * perform mutations and signal failure by throwing.
 */
@AlgorithmType(id = "algtype-state-action",
    name = "State Action",
    description = "Actions executed when entering or exiting a lifecycle state")
public interface StateAction {

    /** Algorithm code, must match {@code algorithm.code} in DB. */
    String code();

    /**
     * Executes the state action.
     *
     * @throws RuntimeException to abort the transition (TRANSACTIONAL mode)
     *         or to be logged and swallowed (POST_COMMIT mode)
     */
    void execute(StateActionContext ctx);
}
