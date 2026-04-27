package com.plm.platform.authz.dto;

import java.util.List;

/**
 * Reply to a successful registration. {@code conflicts} is empty on success;
 * a non-empty list is returned with HTTP 409.
 */
public record ScopeRegistrationResponse(
    String instanceId,
    List<ScopeConflict> conflicts
) {
    public record ScopeConflict(
        String scopeCode,
        String existingDefinitionHash,
        String submittedDefinitionHash,
        String existingOwnerService
    ) {}
}
