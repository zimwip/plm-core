package com.cad.security;

import com.plm.platform.auth.PlmAuthContextBinder;
import com.plm.platform.auth.PlmPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class CadAuthContextBinder implements PlmAuthContextBinder {

    @Override
    public void bind(PlmPrincipal p, HttpServletRequest request) {
        CadSecurityContext.set(new CadUserContext(p.userId(), p.username(), p.roleIds(), p.isAdmin(), p.projectSpaceId()));
    }

    @Override
    public void clear() {
        CadSecurityContext.clear();
    }
}
