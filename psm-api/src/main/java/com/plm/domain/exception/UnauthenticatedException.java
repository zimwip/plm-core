package com.plm.domain.exception;

/**
 * Thrown when a service method requires authentication but no security context
 * is present on the current thread.
 *
 * Handled by {@link com.plm.api.GlobalExceptionHandler} as HTTP 401.
 */
public class UnauthenticatedException extends PlmFunctionalException {

    public UnauthenticatedException(String message) {
        super(message, 401);
    }
}
