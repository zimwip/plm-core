package com.plm.infrastructure.security;

/**
 * Holder ThreadLocal du contexte utilisateur courant.
 * Initialisé par PlmAuthFilter à chaque requête HTTP.
 */
public final class PlmSecurityContext {

    private static final ThreadLocal<PlmUserContext> CURRENT = new ThreadLocal<>();

    public static void set(PlmUserContext ctx) {
        CURRENT.set(ctx);
    }

    public static PlmUserContext get() {
        PlmUserContext ctx = CURRENT.get();
        if (ctx == null) {
            throw new IllegalStateException("No PLM security context on current thread");
        }
        return ctx;
    }

    public static void clear() {
        CURRENT.remove();
    }

    private PlmSecurityContext() {}
}
