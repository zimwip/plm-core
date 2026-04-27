package com.plm.platform.config.dto;

import java.util.List;

/**
 * Action definition with parameters, guards, wrappers, and required permissions.
 */
public record ActionConfig(
    String id,
    String actionCode,
    String scope,
    String displayName,
    String description,
    String displayCategory,
    int displayOrder,
    String managedWith,
    String handlerInstanceId,
    List<ActionParameterConfig> parameters,
    List<ActionParamOverrideConfig> paramOverrides,
    List<String> requiredPermissions,
    List<ActionGuardConfig> guards,
    List<ActionWrapperConfig> wrappers
) {}
