package com.plm.admin.security;

import org.springframework.stereotype.Component;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Copies the shared {@link PlmPrincipal} into psm-admin's
 * {@link PlmAdminSecurityContext}. Replaces the old PlmAdminAuthFilter.
 */
@Component
public class PsmAdminAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        PlmAdminSecurityContext.set(new PlmAdminUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin()));
    }

    @Override
    public void clear() {
        PlmAdminSecurityContext.clear();
    }
}
