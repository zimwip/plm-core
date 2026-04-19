package com.plm.shared.security;

import com.plm.shared.security.PlmUserContext;
import com.plm.shared.security.SecurityContextPort;
import org.springframework.stereotype.Component;

/**
 * Implements {@link SecurityContextPort} by delegating to the ThreadLocal holders
 * ({@link PlmSecurityContext} and {@link PlmProjectSpaceContext}) that are populated
 * by {@link PlmAuthFilter} on each incoming HTTP request.
 */
@Component
public class ThreadLocalSecurityContext implements SecurityContextPort {

    @Override
    public PlmUserContext currentUser() {
        return PlmSecurityContext.get();
    }

    @Override
    public PlmUserContext currentUserOrNull() {
        try {
            return PlmSecurityContext.get();
        } catch (IllegalStateException e) {
            return null;
        }
    }

    @Override
    public String currentProjectSpaceId() {
        return PlmProjectSpaceContext.get();
    }

    @Override
    public String requireProjectSpaceId() {
        return PlmProjectSpaceContext.require();
    }
}
