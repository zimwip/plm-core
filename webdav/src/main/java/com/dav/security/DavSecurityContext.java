package com.dav.security;

/** ThreadLocal holder for the current request's user context in webdav. */
public final class DavSecurityContext {

    private static final ThreadLocal<DavUserContext> CURRENT = new ThreadLocal<>();

    public static void set(DavUserContext ctx) { CURRENT.set(ctx); }

    public static DavUserContext get() {
        DavUserContext c = CURRENT.get();
        if (c == null) throw new IllegalStateException("No DAV security context on current thread");
        return c;
    }

    public static DavUserContext getOrNull() { return CURRENT.get(); }

    public static void clear() { CURRENT.remove(); }

    private DavSecurityContext() {}
}
