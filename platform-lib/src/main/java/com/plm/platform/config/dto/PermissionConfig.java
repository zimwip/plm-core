package com.plm.platform.config.dto;

/**
 * Permission definition (source of truth for permission codes and scopes).
 */
public record PermissionConfig(
    String permissionCode,
    String scope,
    String displayName,
    String description,
    int displayOrder
) {}
