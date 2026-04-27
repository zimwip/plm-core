package com.plm.node.lifecycle.internal.guard;
import com.plm.action.guard.ActionGuardContext;

import com.plm.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Action Guard: node must be in the transition's source state.
 * Attached to TRANSITION by default.
 *
 * Resolves the from_state_id from the lifecycle config
 * and compares with the node's current state.
 */
@AlgorithmBean(code = "from_state_match", name = "From State Match", description = "Node must be in the transition source state")
@RequiredArgsConstructor
public class FromStateMatchGuard implements ActionGuard {

    private final ConfigCache configCache;

    @Override
    public String code() { return "from_state_match"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        String fromStateId = findTransitionFromState(ctx.transitionId());

        if (fromStateId == null || !fromStateId.equals(ctx.currentStateId())) {
            return List.of(new GuardViolation(code(),
                "Transition not available from current state",
                GuardEffect.HIDE));
        }
        return List.of();
    }

    private String findTransitionFromState(String transitionId) {
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.transitions() == null) continue;
            for (LifecycleTransitionConfig t : lc.transitions()) {
                if (t.id().equals(transitionId)) return t.fromStateId();
            }
        }
        return null;
    }
}
