package com.plm.shared.security;

import org.springframework.stereotype.Component;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Copies the shared {@link PlmPrincipal} into psm-api's local context holders
 * ({@link PlmSecurityContext} + {@link PlmProjectSpaceContext}). The project
 * space comes solely from the token's {@code ps} claim.
 */
@Component
public class PsmAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        PlmSecurityContext.set(new PlmUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin()));

        String ps = p.projectSpaceId();
        if (ps != null && !ps.isBlank()) {
            PlmProjectSpaceContext.set(ps);
        }
    }

    @Override
    public void clear() {
        PlmSecurityContext.clear();
        PlmProjectSpaceContext.clear();
    }
}
