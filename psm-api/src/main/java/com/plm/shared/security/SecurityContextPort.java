package com.plm.shared.security;

/**
 * Port interface for accessing the current request's security context.
 *
 * Domain services depend on this interface rather than directly accessing
 * infrastructure ThreadLocals (PlmSecurityContext, PlmProjectSpaceContext).
 *
 * Implemented by {@code ThreadLocalSecurityContext} in the infrastructure layer.
 */
public interface SecurityContextPort {

    /**
     * Returns the current user context.
     * @throws IllegalStateException if no security context is set on the current thread
     */
    PlmUserContext currentUser();

    /**
     * Returns the current user context, or {@code null} if not set.
     * Used by the AOP aspect where absence of context means unauthenticated.
     */
    PlmUserContext currentUserOrNull();

    /**
     * Returns the active project space ID, or {@code null} if not set.
     */
    String currentProjectSpaceId();

    /**
     * Returns the active project space ID.
     * @throws IllegalStateException if no project space context is set (missing X-PLM-ProjectSpace header)
     */
    String requireProjectSpaceId();
}
