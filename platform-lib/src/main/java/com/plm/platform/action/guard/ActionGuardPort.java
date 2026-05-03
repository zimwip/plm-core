package com.plm.platform.action.guard;

/**
 * Port for guard evaluation. Decouples callers from the guard-loading strategy.
 *
 * PSM implements this via {@code ActionGuardService} (config-driven, psm-admin backed).
 * Simple services implement this via {@link LocalActionGuardService} (Spring-bean discovery).
 */
public interface ActionGuardPort {

    /**
     * Evaluate all guards for an action, returning the aggregate result.
     *
     * @param actionCode  stable action code (used by bean-discovery implementations)
     * @param actionId    DB-level action id (used by config-driven implementations; may be null)
     * @param nodeTypeId  target node type (nullable for GLOBAL actions)
     * @param transitionId lifecycle transition (nullable)
     * @param isAdmin     whether to apply admin bypass rules
     * @param ctx         guard evaluation context
     */
    GuardEvaluation evaluate(String actionCode, String actionId,
                             String nodeTypeId, String transitionId,
                             boolean isAdmin, ActionGuardContext ctx);

    /**
     * Assert that BLOCK guards pass. Throws {@link GuardViolationException} on failure.
     * HIDE guards are NOT enforced here — they control UI visibility only.
     */
    void assertGuards(String actionCode, String actionId,
                      String nodeTypeId, String transitionId,
                      boolean isAdmin, ActionGuardContext ctx);
}
