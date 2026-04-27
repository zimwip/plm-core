package com.plm.platform.config.dto;

/**
 * Attribute definition within a node type or domain.
 */
public record AttributeConfig(
    String id,
    String name,
    String label,
    String dataType,
    String widgetType,
    boolean required,
    String defaultValue,
    String namingRegex,
    String allowedValues,
    String enumDefinitionId,
    int displayOrder,
    String displaySection,
    String tooltip,
    boolean asName,
    boolean inherited,
    String inheritedFrom,
    String ownerNodeTypeId,
    String sourceDomainId,
    String sourceDomainName
) {}
