package com.plm.platform.action.guard;

import java.util.List;

/**
 * Aggregate result of evaluating all effective guards for an action.
 *
 * @param hidden     true if any HIDE-effect guard failed — action should not appear in UI
 * @param violations BLOCK-effect violations — action visible but disabled, with these reasons
 */
public record GuardEvaluation(
    boolean hidden,
    List<GuardViolation> violations
) {
    public static final GuardEvaluation PASSED = new GuardEvaluation(false, List.of());

    public boolean passed() {
        return !hidden && violations.isEmpty();
    }
}
