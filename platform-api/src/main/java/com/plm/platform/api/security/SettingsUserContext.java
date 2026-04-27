package com.plm.platform.api.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/**
 * User context for the current request in platform-api.
 */
@Getter
public class SettingsUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;
    private final Set<String> globalPermissions;

    public SettingsUserContext(String userId, String username, Set<String> roleIds, boolean admin) {
        this(userId, username, roleIds, admin, Set.of());
    }

    public SettingsUserContext(String userId, String username, Set<String> roleIds, boolean admin,
                               Set<String> globalPermissions) {
        this.userId            = userId;
        this.username          = username;
        this.roleIds           = Collections.unmodifiableSet(roleIds);
        this.admin             = admin;
        this.globalPermissions = Collections.unmodifiableSet(globalPermissions);
    }

    @Override
    public String toString() {
        return "SettingsUserContext{userId='" + userId + "', roles=" + roleIds
            + ", admin=" + admin + ", globalPermissions=" + globalPermissions + "}";
    }
}
