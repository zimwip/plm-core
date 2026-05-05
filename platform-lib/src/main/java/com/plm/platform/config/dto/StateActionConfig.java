package com.plm.platform.config.dto;

public record StateActionConfig(
    String id,
    String lifecycleStateId,
    String algorithmInstanceId,
    String trigger,
    String executionMode,
    int displayOrder
) {}
