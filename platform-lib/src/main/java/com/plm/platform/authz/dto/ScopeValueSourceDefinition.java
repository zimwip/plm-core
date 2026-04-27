package com.plm.platform.authz.dto;

/**
 * A service's declaration that it can serve the list of values for a given
 * (scope, key). pno-api aggregates value sources across services to build the
 * access-rights tree consumed by the frontend.
 *
 * @param keyName      one of the key names declared on the scope
 * @param endpointPath path under {@code /api/{serviceCode}/internal} that
 *                     returns {@code [{id, label}]}. By convention
 *                     {@code /scope-values/{scopeCode}/{keyName}}.
 */
public record ScopeValueSourceDefinition(
    String keyName,
    String endpointPath
) {}
