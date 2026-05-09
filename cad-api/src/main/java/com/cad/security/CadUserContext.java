package com.cad.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/** User context bound by {@link CadAuthContextBinder} for each request. */
@Getter
public class CadUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;
    private final String      projectSpaceId;

    public CadUserContext(String userId, String username, Set<String> roleIds, boolean admin, String projectSpaceId) {
        this.userId         = userId;
        this.username       = username;
        this.roleIds        = Collections.unmodifiableSet(roleIds);
        this.admin          = admin;
        this.projectSpaceId = projectSpaceId;
    }
}
