package com.plm.domain.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.guard.Guard;
import com.plm.domain.guard.GuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;

import java.util.List;

/**
 * Action Guard: current user must own the lock on the node.
 * Attached to CHECKIN, UPDATE_NODE, CREATE_LINK, UPDATE_LINK, DELETE_LINK by default.
 */
@AlgorithmBean(code = "lock_owner_required", type = "ACTION_GUARD")
public class LockOwnerRequiredGuard implements Guard {

    @Override
    public String code() { return "lock_owner_required"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
        if (!ctx.isLockedByCurrentUser()) {
            return List.of(new GuardViolation(code(),
                "You must check out this node before performing this action",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
