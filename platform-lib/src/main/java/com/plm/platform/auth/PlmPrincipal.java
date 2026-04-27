package com.plm.platform.auth;

import java.util.Set;

/**
 * Normalised JWT payload shared across backend services. Each service's
 * AuthContextBinder copies the fields it cares about into its local
 * SecurityContext holder.
 */
public record PlmPrincipal(
    String userId,
    String username,
    boolean isAdmin,
    Set<String> roleIds,
    String projectSpaceId,
    String tokenType
) {}
