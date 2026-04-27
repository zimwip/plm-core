package com.plm.platform.api.security;

/**
 * ThreadLocal holder for the current user context in platform-api.
 * Populated by the shared platform-lib auth filter on each incoming request.
 */
public final class SettingsSecurityContext {

    private static final ThreadLocal<SettingsUserContext> CURRENT = new ThreadLocal<>();

    public static void set(SettingsUserContext ctx) {
        CURRENT.set(ctx);
    }

    public static SettingsUserContext get() {
        SettingsUserContext ctx = CURRENT.get();
        if (ctx == null) {
            throw new IllegalStateException("No Settings security context on current thread");
        }
        return ctx;
    }

    public static SettingsUserContext getOrNull() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }

    private SettingsSecurityContext() {}
}
