package com.plm.platform.api.security;

import org.springframework.stereotype.Component;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Copies the shared {@link PlmPrincipal} into platform-api's
 * {@link SettingsSecurityContext}.
 */
@Component
public class SettingsAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        SettingsSecurityContext.set(new SettingsUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin()));
    }

    @Override
    public void clear() {
        SettingsSecurityContext.clear();
    }
}
