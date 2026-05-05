package com.dst.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/** User context bound by {@link DstAuthContextBinder} for each request. */
@Getter
public class DstUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;
    private final String      projectSpaceId;

    public DstUserContext(String userId, String username, Set<String> roleIds, boolean admin, String projectSpaceId) {
        this.userId         = userId;
        this.username       = username;
        this.roleIds        = Collections.unmodifiableSet(roleIds);
        this.admin          = admin;
        this.projectSpaceId = projectSpaceId;
    }
}
