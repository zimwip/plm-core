package com.plm.platform.auth;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Per-service adapter invoked by {@link PlmAuthFilter} after JWT verification.
 * Implementations copy the {@link PlmPrincipal} into the service's local
 * security context holder (e.g. {@code PlmSecurityContext}, {@code PnoSecurityContext}).
 *
 * Multiple binders may be registered; they run in bean order.
 */
public interface PlmAuthContextBinder {

    void bind(PlmPrincipal principal, HttpServletRequest request);

    void clear();
}
