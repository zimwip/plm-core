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
 * Action Guard: node must not be in a frozen lifecycle state.
 * Attached to CHECKOUT by default.
 */
@AlgorithmBean(code = "not_frozen", type = "ACTION_GUARD")
@RequiredArgsConstructor
public class NotFrozenGuard implements Guard {

    private final DSLContext dsl;

    @Override
    public String code() { return "not_frozen"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
        if (ctx.currentStateId() == null) return List.of();

        Integer frozen = dsl.select().from("lifecycle_state")
            .where("id = ?", ctx.currentStateId())
            .fetchOne("is_frozen", Integer.class);

        if (frozen != null && frozen == 1) {
            return List.of(new GuardViolation(code(),
                "Node is in a frozen state — content modifications are not allowed",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
