package com.plm.admin.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/**
 * User context for the current request in psm-admin.
 */
@Getter
public class PlmAdminUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;

    public PlmAdminUserContext(String userId, String username, Set<String> roleIds, boolean admin) {
        this.userId   = userId;
        this.username = username;
        this.roleIds  = Collections.unmodifiableSet(roleIds);
        this.admin    = admin;
    }

    @Override
    public String toString() {
        return "PlmAdminUserContext{userId='" + userId + "', roles=" + roleIds + ", admin=" + admin + "}";
    }
}
