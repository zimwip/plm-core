package com.plm.domain.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.guard.Guard;
import com.plm.domain.guard.GuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;

import java.util.List;

/**
 * Action Guard: node must not be locked by any user.
 * Attached to CHECKOUT and TRANSITION by default.
 */
@AlgorithmBean(code = "not_locked", type = "ACTION_GUARD")
public class NotLockedGuard implements Guard {

    @Override
    public String code() { return "not_locked"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
        if (ctx.isLocked()) {
            return List.of(new GuardViolation(code(),
                "Node is currently locked by another operation",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
