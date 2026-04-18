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
 * Action Guard: node must be in the transition's source state.
 * Attached to TRANSITION by default.
 *
 * Resolves the from_state_id from the lifecycle_transition table
 * and compares with the node's current state.
 */
@AlgorithmBean(code = "from_state_match", type = "ACTION_GUARD")
@RequiredArgsConstructor
public class FromStateMatchGuard implements Guard {

    private final DSLContext dsl;

    @Override
    public String code() { return "from_state_match"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        String fromStateId = dsl.select().from("lifecycle_transition")
            .where("id = ?", ctx.transitionId())
            .fetchOne("from_state_id", String.class);

        if (fromStateId == null || !fromStateId.equals(ctx.currentStateId())) {
            return List.of(new GuardViolation(code(),
                "Transition not available from current state",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
