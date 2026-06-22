package com.plm.node.lifecycle.internal.guard;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.node.version.internal.VersionService;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Lifecycle Guard: the node must NOT be checked out — i.e. it must not have a version
 * in an OPEN transaction.
 *
 * <p>Rationale: the TRANSITION action is wired ISOLATED (its own transaction), so a node
 * still engaged in another open transaction (checked in / being edited) cannot be transitioned.
 * The cascade applies child transitions directly on the service (bypassing the wrapper pipeline),
 * so this guard re-asserts that protection uniformly for the node being transitioned and for every
 * cascade child (see {@code LifecycleService.validateChild}).
 *
 * <p>Detection uses {@link VersionService#hasOpenVersion} (open uncommitted version) rather than the
 * lock flag: the TRANSITION's LockWrapper locks the node before guards run, so {@code isLocked} is a
 * false positive at guard time, whereas the freeze's own ISOLATED transaction has not yet created a
 * version for the node.
 */
@AlgorithmBean(code = "not_checked_out", name = "Not Checked Out",
    description = "Node must not have an open (uncommitted) transaction")
@RequiredArgsConstructor
public class NotCheckedOutGuard implements LifecycleGuard {

    private final VersionService versionService;

    @Override
    public String code() { return "not_checked_out"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        if (ctx.nodeId() == null) return List.of();
        if (!versionService.hasOpenVersion(ctx.nodeId())) return List.of();
        return List.of(new GuardViolation(code(),
            "is checked out (open transaction) — check in before freezing",
            GuardEffect.BLOCK));
    }
}
