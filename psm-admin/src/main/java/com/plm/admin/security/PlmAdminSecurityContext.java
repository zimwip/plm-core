package com.plm.admin.security;

/**
 * ThreadLocal holder for the current user context in psm-admin.
 * Populated by {@link PlmAdminAuthFilter} on each incoming request.
 */
public final class PlmAdminSecurityContext {

    private static final ThreadLocal<PlmAdminUserContext> CURRENT = new ThreadLocal<>();

    public static void set(PlmAdminUserContext ctx) {
        CURRENT.set(ctx);
    }

    public static PlmAdminUserContext get() {
        PlmAdminUserContext ctx = CURRENT.get();
        if (ctx == null) {
            throw new IllegalStateException("No PSM Admin security context on current thread");
        }
        return ctx;
    }

    public static PlmAdminUserContext getOrNull() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }

    private PlmAdminSecurityContext() {}
}
