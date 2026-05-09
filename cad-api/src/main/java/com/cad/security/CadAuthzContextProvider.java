package com.cad.security;

import com.plm.platform.authz.AuthzContext;
import com.plm.platform.authz.AuthzContextProvider;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Bridges the cad-api per-request user context onto the platform-lib enforcer SPI.
 */
@Component
public class CadAuthzContextProvider implements AuthzContextProvider {

    @Override
    public AuthzContext currentOrNull() {
        CadUserContext u = CadSecurityContext.getOrNull();
        if (u == null) return null;
        return new CadAuthzContext(u);
    }

    @Override
    public AuthzContext current() {
        AuthzContext c = currentOrNull();
        if (c == null) throw new IllegalStateException("No CAD security context on current thread");
        return c;
    }

    private record CadAuthzContext(CadUserContext user) implements AuthzContext {
        @Override public String userId()         { return user.getUserId(); }
        @Override public Set<String> roleIds()   { return user.getRoleIds(); }
        @Override public boolean isAdmin()       { return user.isAdmin(); }
        @Override public String projectSpaceId() { return user.getProjectSpaceId(); }
    }
}
