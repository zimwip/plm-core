package com.plm.admin.authz;

import com.plm.platform.authz.PermissionScopeContribution;
import com.plm.platform.authz.dto.ScopeKeyDefinition;
import com.plm.platform.authz.dto.ScopeRegistration;
import com.plm.platform.authz.dto.ScopeValueSourceDefinition;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Declares the {@code NODE} scope: role + nodeType. {@code nodeType} is the
 * object key. psm-admin owns the {@code node_type} table and serves the value list.
 */
@Component
public class NodeScopeContribution implements PermissionScopeContribution {

    @Override
    public ScopeRegistration definition() {
        return new ScopeRegistration(
            "NODE",
            null,
            "Role + nodeType. The nodeType identifies the node being authorized.",
            List.of(new ScopeKeyDefinition("nodeType", "Node type id")),
            List.of(new ScopeValueSourceDefinition("nodeType", "/scope-values/NODE/nodeType"))
        );
    }
}
