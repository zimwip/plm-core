package com.plm.platform.resource.dto;

import java.util.Set;

/**
 * User context passed by platform-api to each service's
 * {@code /internal/resources/visible} endpoint.
 *
 * <p>Resolvers use it to decide which contributed descriptors the user can
 * create, without each service having to re-fetch the user from pno-api.
 *
 * @param userId          authenticated user id
 * @param projectSpaceId  active project space (may be null for global context)
 * @param admin           true when the user is platform admin (bypass filters)
 * @param roleIds         user's role ids in the active project space
 * @param globalPerms     permission codes granted at GLOBAL scope (null/empty
 *                        means no global grants — scope-specific rules still apply)
 */
public record ResourceVisibilityContext(
    String userId,
    String projectSpaceId,
    boolean admin,
    Set<String> roleIds,
    Set<String> globalPerms
) {}
