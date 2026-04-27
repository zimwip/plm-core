package com.plm.platform.authz.dto;

import java.util.List;

/**
 * One scope a service contributes to the central pno-hosted registry.
 *
 * <p>Two services declaring the same {@code scopeCode} with a different shape
 * (different parent, different ordered key list, different value sources) is a
 * bootstrap error: pno responds with {@code 409 Conflict} and the registering
 * service fails to start.
 *
 * @param scopeCode       unique scope identifier ({@code GLOBAL}, {@code NODE},
 *                        {@code LIFECYCLE}, …)
 * @param parentScopeCode optional parent scope; child inherits parent keys
 * @param description     human-readable
 * @param keys            ordered key list. First key = object; remaining = attributes
 * @param valueSources    endpoints exposed by this service to enumerate key values
 */
public record ScopeRegistration(
    String scopeCode,
    String parentScopeCode,
    String description,
    List<ScopeKeyDefinition> keys,
    List<ScopeValueSourceDefinition> valueSources
) {}
