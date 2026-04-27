package com.plm.admin.shared;

/**
 * Base class for all expected, business-rule violations in psm-admin.
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
