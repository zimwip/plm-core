package com.plm.domain.exception;

/**
 * Thrown when an authenticated user attempts an operation they are not permitted to perform.
 * Results in an HTTP 403 response.
 */
public class AccessDeniedException extends PlmFunctionalException {
    public AccessDeniedException(String message) { super(message, 403); }
}
