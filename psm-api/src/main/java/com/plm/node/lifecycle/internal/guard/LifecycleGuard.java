package com.plm.node.lifecycle.internal.guard;

import com.plm.platform.algorithm.AlgorithmType;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;

/**
 * Lifecycle guard — evaluates a precondition for a lifecycle transition.
 * Pure PSM concept; registered with platform-api via {@code ActionCatalogRegistrationClient} auto-scan.
 */
@AlgorithmType(id = "algtype-lifecycle-guard",
    name = "Lifecycle Guard",
    description = "Checks lifecycle transition preconditions (required fields, signatures)")
public interface LifecycleGuard {

    String code();

    List<GuardViolation> evaluate(LifecycleGuardContext ctx);
}
