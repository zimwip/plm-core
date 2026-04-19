package com.plm.action.guard;

import com.plm.algorithm.AlgorithmType;
import com.plm.shared.guard.GuardViolation;

import java.util.List;

/**
 * Action guard — evaluates a precondition for a node-scoped action.
 *
 * Checks node/action state (frozen, locked, ownership, fingerprint, etc.).
 * Returns empty list if precondition met, violations if not.
 */
@AlgorithmType(id = "algtype-action-guard",
    name = "Action Guard",
    description = "Checks node/action state preconditions (frozen, locked, ownership)")
public interface ActionGuard {

    String code();

    List<GuardViolation> evaluate(ActionGuardContext ctx);
}
