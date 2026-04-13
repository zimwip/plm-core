package com.pno.infrastructure.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/**
 * Contexte utilisateur courant pour une requête PNO.
 * Porté par un ThreadLocal via PnoSecurityContext.
 */
@Getter
public class PnoUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;

    public PnoUserContext(String userId, String username, Set<String> roleIds, boolean admin) {
        this.userId   = userId;
        this.username = username;
        this.roleIds  = Collections.unmodifiableSet(roleIds);
        this.admin    = admin;
    }

    @Override
    public String toString() {
        return "PnoUserContext{userId='" + userId + "', roles=" + roleIds + ", admin=" + admin + "}";
    }
}
