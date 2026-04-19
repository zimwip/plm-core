package com.plm.domain.action.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.action.guard.ActionGuard;
import com.plm.domain.action.guard.ActionGuardContext;
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
@AlgorithmBean(code = "from_state_match", name = "From State Match", description = "Node must be in the transition source state")
@RequiredArgsConstructor
public class FromStateMatchGuard implements ActionGuard {

    private final DSLContext dsl;

    @Override
    public String code() { return "from_state_match"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
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
