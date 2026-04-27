package com.plm.platform.config.dto;

import java.util.List;

/**
 * Node type definition including attributes and state rules.
 */
public record NodeTypeConfig(
    String id,
    String name,
    String description,
    String lifecycleId,
    String logicalIdLabel,
    String logicalIdPattern,
    String numberingScheme,
    String versionPolicy,
    boolean collapseHistory,
    String color,
    String icon,
    String parentNodeTypeId,
    List<String> ancestorChain,
    List<AttributeConfig> attributes,
    List<AttributeStateRuleConfig> stateRules
) {}
