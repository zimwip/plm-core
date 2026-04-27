package com.plm.platform.authz.dto;

/**
 * One value a {@link com.plm.platform.authz.ScopeValueProvider} returns for a
 * (scope, key, optional parent path). Frontend uses {@code label} for display
 * and {@code id} as the value persisted in {@code authorization_policy_key}.
 */
public record KeyValue(
    String id,
    String label
) {}
