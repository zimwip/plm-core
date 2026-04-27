package com.plm.platform.config.dto;

/**
 * Parameter definition for an algorithm.
 */
public record AlgorithmParameterConfig(
    String id,
    String algorithmId,
    String paramName,
    String paramLabel,
    String dataType,
    boolean required,
    String defaultValue,
    int displayOrder
) {}
