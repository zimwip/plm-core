package com.plm.platform.authz.dto;

/**
 * One ordered key in a permission scope. The first key in a scope's key list
 * is the <em>object</em> (the resource being authorized). Subsequent keys are
 * <em>attributes</em> qualifying that object.
 */
public record ScopeKeyDefinition(
    String name,
    String description
) {}
