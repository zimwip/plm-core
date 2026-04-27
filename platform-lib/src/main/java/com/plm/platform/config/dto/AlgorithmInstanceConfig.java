package com.plm.platform.config.dto;

import java.util.Map;

/**
 * Algorithm instance with resolved parameter values.
 */
public record AlgorithmInstanceConfig(
    String id,
    String algorithmId,
    String name,
    Map<String, String> paramValues
) {}
