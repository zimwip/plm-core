package com.plm.node.lifecycle.internal.guard;

import com.plm.algorithm.AlgorithmType;
import com.plm.shared.guard.GuardViolation;

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
