package com.plm.domain.exception;

import java.util.List;

/**
 * Thrown when one or more guard preconditions fail at execution time.
 * HTTP 422 — the request is syntactically valid but the action's preconditions are not met.
 */
public class GuardViolationException extends PlmFunctionalException {

    private final List<String> violations;

    public GuardViolationException(List<String> violations) {
        super("Guard violation: " + String.join("; ", violations), 422);
        this.violations = List.copyOf(violations);
    }

    public List<String> getViolations() {
        return violations;
    }
}
