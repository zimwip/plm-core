package com.plm.platform.client;

/**
 * Async-context auth propagation for ServiceClient.
 * Captures the inbound JWT + project space at request time so that
 * background threads can forward them on S2S calls when no active
 * HttpServletRequest is available.
 */
public final class ServiceClientTokenContext {

    private static final ThreadLocal<String> AUTH_TOKEN    = new ThreadLocal<>();
    private static final ThreadLocal<String> PROJECT_SPACE = new ThreadLocal<>();

    private ServiceClientTokenContext() {}

    public static void set(String token)          { AUTH_TOKEN.set(token); }
    public static String get()                    { return AUTH_TOKEN.get(); }

    public static void setProjectSpace(String ps) { PROJECT_SPACE.set(ps); }
    public static String getProjectSpace()        { return PROJECT_SPACE.get(); }

    public static void clear() {
        AUTH_TOKEN.remove();
        PROJECT_SPACE.remove();
    }
}
