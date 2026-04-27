package com.plm.admin.authz;

import com.plm.platform.authz.PermissionScopeContribution;
import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeValueSourceDefinition;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Declares the {@code LIFECYCLE} scope: child of {@code NODE}, adds
 * {@code transition} as an attribute of the node's lifecycle. The full
 * effective key list for grants is {@code [nodeType, transition]}.
 */
@Component
public class LifecycleScopeContribution implements PermissionScopeContribution {

    @Override
    public ScopeRegistration definition() {
        return new ScopeRegistration(
            "LIFECYCLE",
            "NODE",
            "Role + nodeType + transition. Transition is an attribute of the node lifecycle.",
            List.of(new ScopeKeyDefinition("transition", "Lifecycle transition id")),
            List.of(new ScopeValueSourceDefinition("transition", "/scope-values/LIFECYCLE/transition"))
        );
    }
}
