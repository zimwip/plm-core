package com.pno.infrastructure.security;

import org.springframework.stereotype.Component;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Copies the platform-lib {@link PlmPrincipal} into pno-api's local
 * {@link PnoSecurityContext}. Replaces the old pno-api JwtAuthFilter.
 */
@Component
public class PnoAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        PnoSecurityContext.set(new PnoUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin()));
    }

    @Override
    public void clear() {
        PnoSecurityContext.clear();
    }
}
