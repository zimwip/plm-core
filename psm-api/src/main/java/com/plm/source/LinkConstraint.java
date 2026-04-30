package com.plm.source;

/**
 * Subset of link_type config relevant to resolver validation.
 *
 * Built from {@code com.plm.platform.config.dto.LinkTypeConfig} on the call-site
 * to avoid exposing the full DTO inside the resolver API.
 */
public record LinkConstraint(
    String allowedType,
    Integer maxCardinality,
    String linkPolicy,
    String linkLogicalIdPattern
) {}
