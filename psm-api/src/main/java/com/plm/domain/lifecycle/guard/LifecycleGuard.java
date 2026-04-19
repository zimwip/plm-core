package com.plm.domain.lifecycle.guard;

import com.plm.domain.algorithm.AlgorithmType;
import com.plm.domain.guard.GuardViolation;

import java.util.List;

/**
 * Lifecycle guard — evaluates a precondition for a lifecycle transition.
 *
 * Checks transition-level preconditions (required fields, signatures).
 * Independent from action guards — different domain, different context.
 */
@AlgorithmType(id = "algtype-lifecycle-guard",
    name = "Lifecycle Guard",
    description = "Checks lifecycle transition preconditions (required fields, signatures)")
public interface LifecycleGuard {

    String code();

    List<GuardViolation> evaluate(LifecycleGuardContext ctx);
}
