package com.plm.platform.config.dto;

/**
 * Authorization policy grant (role x permission x nodeType x transition).
 */
public record AuthorizationPolicyConfig(
    String id,
    String permissionCode,
    String scope,
    String roleId,
    String nodeTypeId,
    String transitionId
) {}
