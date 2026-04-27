package com.plm.platform.authz;

/**
 * Platform-neutral deny signal. Services translate this to their own
 * HTTP-layer access-denied exception via {@code GlobalExceptionHandler}.
 */
public class PolicyDeniedException extends RuntimeException {

    public PolicyDeniedException(String message) {
        super(message);
    }
}
