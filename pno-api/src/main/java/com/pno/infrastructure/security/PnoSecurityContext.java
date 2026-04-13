package com.pno.infrastructure.security;

/**
 * Holder ThreadLocal du contexte utilisateur courant pour pno-api.
 * Initialisé par PnoAuthFilter à chaque requête HTTP.
 */
public final class PnoSecurityContext {

    private static final ThreadLocal<PnoUserContext> CURRENT = new ThreadLocal<>();

    public static void set(PnoUserContext ctx) {
        CURRENT.set(ctx);
    }

    public static PnoUserContext get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }

    private PnoSecurityContext() {}
}
