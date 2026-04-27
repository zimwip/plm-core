package com.plm.platform.config.dto;

/**
 * Parameter definition for an action.
 */
public record ActionParameterConfig(
    String id,
    String actionId,
    String paramName,
    String paramLabel,
    String dataType,
    boolean required,
    String defaultValue,
    String allowedValues,
    String widgetType,
    String validationRegex,
    String minValue,
    String maxValue,
    String visibility,
    int displayOrder,
    String tooltip
) {}
