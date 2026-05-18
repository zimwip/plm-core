package com.plm.platform.auth;

import java.util.List;
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
    String tokenType,
    List<String> allowedServiceCodes,
    String jobId  // non-null only for typ=op tokens; binds token to a specific job
) {
    public boolean canAccessService(String serviceCode) {
        return isAdmin || (allowedServiceCodes != null && allowedServiceCodes.contains(serviceCode));
    }
}
