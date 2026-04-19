package com.plm.node.signature.internal.guard;
import com.plm.action.guard.ActionGuardContext;

import com.plm.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;

import java.util.List;

/**
 * Action Guard: at least one outgoing transition from current state must
 * have signature_requirement rows. Otherwise SIGN action is not relevant.
 * Attached to SIGN by default.
 */
@AlgorithmBean(code = "has_signature_requirement", name = "Has Signature Requirement", description = "At least one outgoing transition requires signatures")
@RequiredArgsConstructor
public class HasSignatureRequirementGuard implements ActionGuard {

    private final DSLContext dsl;

    @Override
    public String code() { return "has_signature_requirement"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.currentStateId() == null) return List.of();

        boolean hasReq = dsl.fetchCount(dsl.selectOne()
            .from("lifecycle_transition lt")
            .join("signature_requirement sr").on("sr.lifecycle_transition_id = lt.id")
            .where("lt.from_state_id = ?", ctx.currentStateId())) > 0;

        if (!hasReq) {
            return List.of(new GuardViolation(code(),
                "No signature requirements defined for transitions from current state",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
