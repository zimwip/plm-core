package com.plm.platform.config.dto;

/**
 * Single value within an enum definition.
 */
public record EnumValueConfig(
    String id,
    String enumDefinitionId,
    String value,
    String label,
    int displayOrder
) {}
