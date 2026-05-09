package com.cad.security;

import com.plm.platform.authz.PermissionCatalogPort;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Static permission catalog for cad-api.
 * SUBMIT_IMPORT: trigger a new CAD import job.
 * READ_IMPORT:   view job status and results.
 * MANAGE_IMPORT: admin operations (cancel, purge).
 */
@Component
public class CadPermissionCatalog implements PermissionCatalogPort {

    private static final Map<String, String> SCOPES = Map.of(
        "SUBMIT_IMPORT", "CAD_IMPORT",
        "READ_IMPORT",   "CAD_IMPORT",
        "MANAGE_IMPORT", "CAD_IMPORT"
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
