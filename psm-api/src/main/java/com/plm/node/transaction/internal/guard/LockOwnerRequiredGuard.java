package com.plm.node.transaction.internal.guard;
import com.plm.platform.action.guard.ActionGuardContext;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;

/**
 * Action Guard: current user must own the lock on the node.
 * Attached to CHECKIN, UPDATE_NODE, CREATE_LINK, UPDATE_LINK, DELETE_LINK by default.
 */
@AlgorithmBean(code = "lock_owner_required", name = "Lock Owner Required", description = "Current user must own the lock on this node")
public class LockOwnerRequiredGuard implements ActionGuard {

    @Override
    public String code() { return "lock_owner_required"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (!ctx.isLockedByCurrentUser()) {
            return List.of(new GuardViolation(code(),
                "You must check out this node before performing this action",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
