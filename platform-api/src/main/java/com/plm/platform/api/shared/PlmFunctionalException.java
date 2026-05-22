package com.plm.platform.api.shared;

/**
 * Base class for all expected, business-rule violations in platform-api.
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
