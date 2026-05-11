package com.plm.platform.api.security;

import com.plm.platform.authz.PermissionScopeContribution;
import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeValueSourceDefinition;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceScopeContribution implements PermissionScopeContribution {

    @Override
    public ScopeRegistration definition() {
        return new ScopeRegistration(
            "SERVICE",
            null,
            "Controls which users can access each service. Permission: SERVICE_ACCESS.",
            List.of(new ScopeKeyDefinition("service_code", "Service code of the target service (e.g. psm, psa, dst)")),
            List.of(new ScopeValueSourceDefinition("service_code", "/scope-values/SERVICE/service_code"))
        );
    }
}
