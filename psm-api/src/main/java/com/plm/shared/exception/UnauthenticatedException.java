package com.plm.shared.exception;

/**
 * Thrown when a service method requires authentication but no security context
 * is present on the current thread.
 *
 * Handled by {@link com.plm.shared.exception.GlobalExceptionHandler} as HTTP 401.
 */
public class UnauthenticatedException extends PlmFunctionalException {

    public UnauthenticatedException(String message) {
        super(message, 401);
    }
}
