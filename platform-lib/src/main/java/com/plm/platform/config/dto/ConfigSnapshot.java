package com.plm.platform.config.dto;

import java.util.List;
import java.util.Map;

/**
 * Full configuration state pushed from psm-admin to psm-data instances.
 * Wire format for POST /internal/config/update and GET /internal/config/snapshot.
 * The monotonic {@code version} lets clients reject stale/out-of-order pushes.
 */
public record ConfigSnapshot(
    long version,
    List<NodeTypeConfig> nodeTypes,
    List<LifecycleConfig> lifecycles,
    List<LinkTypeConfig> linkTypes,
    List<ActionConfig> actions,
    List<PermissionConfig> permissions,
    List<AuthorizationPolicyConfig> authorizationPolicies,
    List<AlgorithmConfig> algorithms,
    List<DomainConfig> domains,
    List<EnumDefinitionConfig> enums,
    List<AttributeViewConfig> attributeViews,
    List<StateActionConfig> stateActions,
    List<SourceConfig> sources,
    Map<String, String> entityMetadata
) {}
