package com.dav.security;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class DavAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        DavSecurityContext.set(new DavUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin(), p.projectSpaceId()));
    }

    @Override
    public void clear() {
        DavSecurityContext.clear();
    }
}
