package com.plm.domain.security;

import lombok.Getter;

import java.util.Collections;
import java.util.Set;

/**
 * Contexte utilisateur courant pour une requête PLM.
 *
 * Porté par un ThreadLocal via l'infrastructure (ThreadLocalSecurityContext).
 * Contient l'identité de l'utilisateur et ses rôles résolus.
 *
 * En production, ce contexte serait alimenté depuis un JWT / OAuth2 token.
 * Pour l'instant il est initialisé manuellement ou via un header HTTP.
 */
@Getter
public class PlmUserContext {

    private final String      userId;
    private final String      username;
    private final Set<String> roleIds;
    private final boolean     admin;

    public PlmUserContext(String userId, String username, Set<String> roleIds, boolean admin) {
        this.userId   = userId;
        this.username = username;
        this.roleIds  = Collections.unmodifiableSet(roleIds);
        this.admin    = admin;
    }

    public boolean hasRole(String roleId) {
        return admin || roleIds.contains(roleId);
    }

    public boolean hasAnyRole(Set<String> roles) {
        if (admin) return true;
        return roles.stream().anyMatch(roleIds::contains);
    }

    @Override
    public String toString() {
        return "PlmUserContext{userId='" + userId + "', roles=" + roleIds + ", admin=" + admin + "}";
    }
}
