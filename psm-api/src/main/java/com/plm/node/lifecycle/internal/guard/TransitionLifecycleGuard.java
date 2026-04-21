package com.plm.node.lifecycle.internal.guard;

import com.plm.action.guard.ActionGuard;
import com.plm.action.guard.ActionGuardContext;
import com.plm.algorithm.AlgorithmBean;
import com.plm.shared.guard.GuardEvaluation;
import com.plm.shared.guard.GuardViolation;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Bridge between the action guard system and lifecycle guards.
 *
 * <p>Attached to the TRANSITION action via {@code action_guard} table.
 * When evaluated by {@link com.plm.action.guard.ActionGuardService},
 * delegates to {@link LifecycleGuardService} which evaluates transition-specific
 * guards (AllSignaturesDone, AllRequiredFilled, etc.).
 *
 * <p>This bridges the two guard systems cleanly:
 * <ul>
 *   <li>ActionService UI evaluation picks up lifecycle guard violations automatically</li>
 *   <li>PlmActionAspect enforces lifecycle guards at execution time</li>
 *   <li>No cross-module dependency — both live in the node module</li>
 * </ul>
 */
@AlgorithmBean(code = "transition_lifecycle_guard", name = "Lifecycle Guards",
    description = "Evaluates lifecycle transition guards (signatures, required fields)")
@RequiredArgsConstructor
public class TransitionLifecycleGuard implements ActionGuard {

    private final LifecycleGuardService lifecycleGuardService;

    @Override
    public String code() { return "transition_lifecycle_guard"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        LifecycleGuardContext lCtx = new LifecycleGuardContext(
            ctx.nodeId(), ctx.nodeTypeId(), ctx.currentStateId(), ctx.transitionId(),
            ctx.isLocked(), ctx.isLockedByCurrentUser(), ctx.currentUserId(),
            Map.of());

        // Always evaluate — admin bypass is handled by ActionGuardService
        GuardEvaluation eval = lifecycleGuardService.evaluate(
            ctx.transitionId(), ctx.nodeTypeId(), false, lCtx);

        return eval.violations();
    }
}
