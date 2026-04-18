package com.plm.domain.guard;

import java.util.List;

/**
 * Guard algorithm interface — evaluates a precondition for an action.
 *
 * Implementations are annotated with {@link com.plm.domain.algorithm.AlgorithmBean}
 * and discovered at startup by {@link com.plm.domain.algorithm.AlgorithmRegistry}.
 *
 * Two categories exist (different algorithm_type rows, same interface):
 * <ul>
 *   <li><b>Action Guard</b> — checks node/action state (frozen, locked, ownership)</li>
 *   <li><b>Lifecycle Guard</b> — checks transition preconditions (required fields, signatures)</li>
 * </ul>
 *
 * Guards return an empty list when the precondition is met (action allowed),
 * or one or more {@link GuardViolation}s when it fails.
 * The {@link GuardEffect} (HIDE vs BLOCK) is set by the guard attachment,
 * not by the guard itself — guards return violations without effect.
 */
public interface Guard {

    /** Algorithm code, must match {@code algorithm.code} in DB. */
    String code();

    /**
     * Evaluates the guard precondition.
     *
     * @return empty list if precondition is met; violations if not
     */
    List<GuardViolation> evaluate(GuardContext ctx);
}
