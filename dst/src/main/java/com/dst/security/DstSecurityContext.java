package com.dst.security;

/** ThreadLocal holder for the current request's user context in dst. */
public final class DstSecurityContext {

    private static final ThreadLocal<DstUserContext> CURRENT = new ThreadLocal<>();

    public static void set(DstUserContext ctx) { CURRENT.set(ctx); }

    public static DstUserContext get() {
        DstUserContext c = CURRENT.get();
        if (c == null) throw new IllegalStateException("No DST security context on current thread");
        return c;
    }

    public static DstUserContext getOrNull() { return CURRENT.get(); }

    public static void clear() { CURRENT.remove(); }

    private DstSecurityContext() {}
}
