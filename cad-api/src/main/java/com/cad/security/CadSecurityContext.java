package com.cad.security;

/** ThreadLocal holder for the current request's user context in cad-api. */
public final class CadSecurityContext {

    private static final ThreadLocal<CadUserContext> CURRENT = new ThreadLocal<>();

    public static void set(CadUserContext ctx) { CURRENT.set(ctx); }

    public static CadUserContext get() {
        CadUserContext c = CURRENT.get();
        if (c == null) throw new IllegalStateException("No CAD security context on current thread");
        return c;
    }

    public static CadUserContext getOrNull() { return CURRENT.get(); }

    public static void clear() { CURRENT.remove(); }

    private CadSecurityContext() {}
}
