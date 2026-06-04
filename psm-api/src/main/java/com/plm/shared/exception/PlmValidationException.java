package com.plm.shared.exception;

import com.plm.platform.exception.PlmFunctionalException;

import java.util.List;

public abstract class PlmValidationException extends PlmFunctionalException {

    protected PlmValidationException(String message) {
        super(message, 422);
    }

    public abstract List<?> getErrors();
}
