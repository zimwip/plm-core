package com.plm.shared.exception;

import java.util.List;

public abstract class PlmValidationException extends PlmFunctionalException {

    protected PlmValidationException(String message) {
        super(message, 422);
    }

    public abstract List<?> getErrors();
}
