package com.dst.security;

import com.plm.platform.authz.PermissionCatalogPort;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Static permission catalog for dst — the only codes the service knows about
 * are the three data-management permissions, all under the {@code DATA} scope.
 *
 * If dst grows more permissions later, snapshot this from pno-api the same way
 * psm-api does.
 */
@Component
public class DstPermissionCatalog implements PermissionCatalogPort {

    private static final Map<String, String> SCOPES = Map.of(
        "READ_DATA",   "DATA",
        "WRITE_DATA",  "DATA",
        "MANAGE_DATA", "DATA"
    );

    @Override
    public String scopeFor(String permissionCode) {
        return SCOPES.get(permissionCode);
    }

    @Override
    public boolean exists(String permissionCode) {
        return SCOPES.containsKey(permissionCode);
    }
}
