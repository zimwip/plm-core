package com.plm.shared.security;

import com.plm.platform.authz.AuthzContext;
import com.plm.platform.authz.AuthzContextProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Bridges {@link SecurityContextPort} + {@link PlmProjectSpaceContext} onto the
 * platform-lib {@link AuthzContextProvider} SPI, so the shared enforcer can
 * read user + project-space context without knowing about psm-api internals.
 */
@Component
@RequiredArgsConstructor
public class PsmAuthzContextProvider implements AuthzContextProvider {

    private final SecurityContextPort secCtx;

    @Override
    public AuthzContext currentOrNull() {
        PlmUserContext user = secCtx.currentUserOrNull();
        if (user == null) return null;
        return new PsmAuthzContext(user, PlmProjectSpaceContext.get());
    }

    @Override
    public AuthzContext current() {
        AuthzContext c = currentOrNull();
        if (c == null) throw new IllegalStateException("No PLM security context on current thread");
        return c;
    }

    private record PsmAuthzContext(PlmUserContext user, String projectSpaceId) implements AuthzContext {
        @Override public String userId()          { return user.getUserId(); }
        @Override public Set<String> roleIds()    { return user.getRoleIds(); }
        @Override public boolean isAdmin()        { return user.isAdmin(); }
    }
}
