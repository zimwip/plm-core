package com.plm.platform.config.dto;

import java.util.List;

/**
 * Attribute view (role x state filter with attribute overrides).
 */
public record AttributeViewConfig(
    String id,
    String nodeTypeId,
    String name,
    String description,
    String eligibleRoleId,
    String eligibleStateId,
    int priority,
    List<ViewAttributeOverrideConfig> overrides
) {}
