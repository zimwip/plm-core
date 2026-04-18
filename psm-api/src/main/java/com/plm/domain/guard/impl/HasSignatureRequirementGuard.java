package com.plm.domain.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.guard.Guard;
import com.plm.domain.guard.GuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;

import java.util.List;

/**
 * Action Guard: at least one outgoing transition from current state must
 * have signature_requirement rows. Otherwise SIGN action is not relevant.
 * Attached to SIGN by default.
 */
@AlgorithmBean(code = "has_signature_requirement", type = "ACTION_GUARD")
@RequiredArgsConstructor
public class HasSignatureRequirementGuard implements Guard {

    private final DSLContext dsl;

    @Override
    public String code() { return "has_signature_requirement"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
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
