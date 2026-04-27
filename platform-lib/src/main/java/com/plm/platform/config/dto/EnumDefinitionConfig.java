package com.plm.platform.config.dto;

import java.util.List;

/**
 * Enum definition with ordered values.
 */
public record EnumDefinitionConfig(
    String id,
    String name,
    String description,
    List<EnumValueConfig> values
) {}
