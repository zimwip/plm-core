package com.plm.platform.authz;

import java.util.Set;

/**
 * Minimal per-request context the platform-lib enforcer needs. Services wire
 * an {@link AuthzContextProvider} bean that adapts their internal
 * security-context abstraction to this shape.
 */
public interface AuthzContext {

    String userId();

    Set<String> roleIds();

    boolean isAdmin();

    /** Required for every authorization check. May be {@code null} if the request isn't scoped to one. */
    String projectSpaceId();
}
