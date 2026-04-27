package com.plm.platform.config.dto;

import java.util.List;

/**
 * Algorithm definition with parameters and instances.
 */
public record AlgorithmConfig(
    String id,
    String algorithmTypeId,
    String code,
    String name,
    String description,
    String handlerRef,
    List<AlgorithmParameterConfig> parameters,
    List<AlgorithmInstanceConfig> instances
) {}
