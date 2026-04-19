package com.plm.shared.exception;

/**
 * Base class for all expected, business-rule violations in the PLM domain.
 *
 * Subclass this for any error that is part of normal operation
 * (lock conflicts, guard failures, permission denied, validation errors…).
 * The global exception handler returns these without a stack trace —
 * they are presented to the user as plain error messages.
 *
 * Contrast with unexpected technical exceptions (NullPointerException,
 * DataAccessException, …) which bubble up as 500s with a full stack trace.
 */
public class PlmFunctionalException extends RuntimeException {

    private final int httpStatus;

    public PlmFunctionalException(String message, int httpStatus) {
        super(message);
        this.httpStatus = httpStatus;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
