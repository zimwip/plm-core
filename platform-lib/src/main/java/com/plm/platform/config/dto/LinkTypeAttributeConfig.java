package com.plm.platform.config.dto;

/**
 * Attribute definition on a link type.
 */
public record LinkTypeAttributeConfig(
    String id,
    String linkTypeId,
    String name,
    String label,
    String dataType,
    boolean required,
    String defaultValue,
    String namingRegex,
    String allowedValues,
    String widgetType,
    int displayOrder,
    String displaySection,
    String tooltip,
    String enumDefinitionId
) {}
