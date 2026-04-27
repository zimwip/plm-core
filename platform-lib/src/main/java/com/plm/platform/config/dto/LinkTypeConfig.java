package com.plm.platform.config.dto;

import java.util.List;

/**
 * Link type definition including attributes and cascade rules.
 */
public record LinkTypeConfig(
    String id,
    String name,
    String description,
    String sourceNodeTypeId,
    String targetNodeTypeId,
    String linkPolicy,
    int minCardinality,
    Integer maxCardinality,
    String linkLogicalIdLabel,
    String linkLogicalIdPattern,
    String color,
    String icon,
    List<LinkTypeAttributeConfig> attributes,
    List<LinkTypeCascadeConfig> cascades
) {}
