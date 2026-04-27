package com.plm.platform.config.dto;

/**
 * Node-type-specific override for an action parameter.
 */
public record ActionParamOverrideConfig(
    String id,
    String nodeTypeId,
    String actionId,
    String parameterId,
    String defaultValue,
    String allowedValues,
    Boolean required
) {}
