package com.plm.platform.config.dto;

import java.util.List;

/**
 * Domain definition with its attributes.
 */
public record DomainConfig(
    String id,
    String name,
    String description,
    String color,
    String icon,
    List<AttributeConfig> attributes
) {}
