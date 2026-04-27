package com.plm.platform.config.dto;

/**
 * Wrapper (middleware) attached to an action, ordered by executionOrder.
 */
public record ActionWrapperConfig(
    String id,
    String actionId,
    String algorithmInstanceId,
    int executionOrder
) {}
