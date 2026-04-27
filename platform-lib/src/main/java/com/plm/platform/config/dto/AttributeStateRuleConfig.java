package com.plm.platform.config.dto;

/**
 * State-dependent attribute rule (editable/visible/required per lifecycle state).
 */
public record AttributeStateRuleConfig(
    String id,
    String attributeDefinitionId,
    String lifecycleStateId,
    String nodeTypeId,
    boolean required,
    boolean editable,
    boolean visible
) {}
