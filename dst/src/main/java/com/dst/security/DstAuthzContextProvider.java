package com.dst.security;

import com.plm.platform.authz.AuthzContext;
import com.plm.platform.authz.AuthzContextProvider;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Bridges the dst per-request user context onto the platform-lib enforcer SPI.
 * dst does not have a project-space concept so {@code projectSpaceId} is always null.
 */
@Component
public class DstAuthzContextProvider implements AuthzContextProvider {

    @Override
    public AuthzContext currentOrNull() {
        DstUserContext u = DstSecurityContext.getOrNull();
        if (u == null) return null;
        return new DstAuthzContext(u);
    }

    @Override
    public AuthzContext current() {
        AuthzContext c = currentOrNull();
        if (c == null) throw new IllegalStateException("No DST security context on current thread");
        return c;
    }

    private record DstAuthzContext(DstUserContext user) implements AuthzContext {
        @Override public String userId()         { return user.getUserId(); }
        @Override public Set<String> roleIds()   { return user.getRoleIds(); }
        @Override public boolean isAdmin()       { return user.isAdmin(); }
        @Override public String projectSpaceId() { return user.getProjectSpaceId(); }
    }
}
