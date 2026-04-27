package com.pno.domain.scope;

import com.plm.platform.authz.dto.ScopeRegistrationResponse.ScopeConflict;

import java.util.List;

/**
 * Thrown when a service tries to register a scope code that already exists with
 * a different definition. Mapped to HTTP 409 by
 * {@link com.pno.api.controller.GlobalExceptionHandler}.
 */
public class ScopeConflictException extends RuntimeException {

    private final List<ScopeConflict> conflicts;

    public ScopeConflictException(List<ScopeConflict> conflicts) {
        super("Scope registration conflicts: " + conflicts.size());
        this.conflicts = conflicts;
    }

    public List<ScopeConflict> getConflicts() {
        return conflicts;
    }
}
