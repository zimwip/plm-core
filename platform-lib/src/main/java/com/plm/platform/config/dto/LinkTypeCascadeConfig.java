package com.plm.platform.config.dto;

/**
 * Cascade rule on a link type (parent transition triggers child transition).
 */
public record LinkTypeCascadeConfig(
    String id,
    String linkTypeId,
    String parentTransitionId,
    String childFromStateId,
    String childTransitionId
) {}
