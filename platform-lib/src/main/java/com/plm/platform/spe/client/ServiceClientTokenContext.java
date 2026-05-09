package com.plm.platform.spe.client;

/**
 * Explicit auth token override for async contexts where RequestContextHolder
 * is unavailable or holds a recycled HttpServletRequest.
 *
 * Set before async work, clear in finally block.
 */
public final class ServiceClientTokenContext {

    private static final ThreadLocal<String> AUTH_TOKEN = new ThreadLocal<>();

    private ServiceClientTokenContext() {}

    public static void set(String token) { AUTH_TOKEN.set(token); }

    public static String get() { return AUTH_TOKEN.get(); }

    public static void clear() { AUTH_TOKEN.remove(); }
}
