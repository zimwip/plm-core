package com.plm.node.transaction.internal.guard;
import com.plm.action.guard.ActionGuardContext;

import com.plm.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;

import java.util.List;

/**
 * Action Guard: node must not be locked by any user.
 * Attached to CHECKOUT and TRANSITION by default.
 */
@AlgorithmBean(code = "not_locked", name = "Not Locked", description = "Node must not be locked by any user")
public class NotLockedGuard implements ActionGuard {

    @Override
    public String code() { return "not_locked"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.isLocked()) {
            return List.of(new GuardViolation(code(),
                "Node is currently locked by another operation",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
