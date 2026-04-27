package com.plm.platform.config.dto;

/**
 * Individual attribute override within an attribute view.
 */
public record ViewAttributeOverrideConfig(
    String id,
    String viewId,
    String attributeDefId,
    Boolean visible,
    Boolean editable,
    Integer displayOrder,
    String displaySection
) {}
