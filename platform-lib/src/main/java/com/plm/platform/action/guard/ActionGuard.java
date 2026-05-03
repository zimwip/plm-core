package com.plm.platform.action.guard;

import java.util.List;

/**
 * Evaluates one guard precondition for an action.
 *
 * Implementations are Spring beans discovered by {@link ActionGuardPort}.
 * PSM guards sub-interface this and add {@code @AlgorithmType} for psm-admin registration.
 * Simple services (DST, etc.) implement this directly as plain Spring beans.
 */
public interface ActionGuard {

    /** Unique guard code, e.g. "not_locked", "dst_file_exists". */
    String code();

    /**
     * Evaluate the guard.
     *
     * @return empty list if the precondition is met, violations otherwise
     */
    List<GuardViolation> evaluate(ActionGuardContext ctx);
}
