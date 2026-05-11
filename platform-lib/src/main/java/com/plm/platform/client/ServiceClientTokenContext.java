package com.plm.platform.client;

import java.util.Set;

/**
 * Async-context auth override for ServiceClient. Supports two modes:
 * - JWT string (legacy): set/get for raw "Bearer ..." token forwarding.
 * - Delegated context: setDelegated/getDelegated for service-secret + user-identity
 *   headers, used when the caller JWT has expired (e.g., long-running async jobs).
 */
public final class ServiceClientTokenContext {

    public record DelegatedContext(
        String userId,
        String username,
        Set<String> roleIds,
        boolean isAdmin,
        String projectSpaceId
    ) {}

    private static final ThreadLocal<String>           AUTH_TOKEN = new ThreadLocal<>();
    private static final ThreadLocal<DelegatedContext> DELEGATED  = new ThreadLocal<>();

    private ServiceClientTokenContext() {}

    public static void set(String token)                     { AUTH_TOKEN.set(token); }
    public static String get()                               { return AUTH_TOKEN.get(); }

    public static void setDelegated(DelegatedContext ctx)    { DELEGATED.set(ctx); }
    public static DelegatedContext getDelegated()            { return DELEGATED.get(); }

    public static void clear() {
        AUTH_TOKEN.remove();
        DELEGATED.remove();
    }
}
