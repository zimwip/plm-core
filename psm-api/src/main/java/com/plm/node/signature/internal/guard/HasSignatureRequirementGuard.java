package com.plm.node.signature.internal.guard;
import com.plm.platform.action.guard.ActionGuardContext;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Action Guard: at least one outgoing transition from current state must
 * have signature_requirement rows. Otherwise SIGN action is not relevant.
 * Attached to SIGN by default.
 */
@AlgorithmBean(code = "has_signature_requirement", name = "Has Signature Requirement", description = "At least one outgoing transition requires signatures")
@RequiredArgsConstructor
public class HasSignatureRequirementGuard implements ActionGuard {

    private final ConfigCache configCache;

    @Override
    public String code() { return "has_signature_requirement"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.currentStateId() == null) return List.of();

        boolean hasReq = false;
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.transitions() == null) continue;
            for (LifecycleTransitionConfig t : lc.transitions()) {
                if (ctx.currentStateId().equals(t.fromStateId())
                        && t.signatureRequirements() != null
                        && !t.signatureRequirements().isEmpty()) {
                    hasReq = true;
                    break;
                }
            }
            if (hasReq) break;
        }

        if (!hasReq) {
            return List.of(new GuardViolation(code(),
                "No signature requirements defined for transitions from current state",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
