package com.plm.shared.authorization;

/**
 * Read-only port for permission metadata lookups.
 *
 * <p>Implementation lives in the permission module ({@code PermissionRegistry}).
 * Action module and other consumers depend on this interface only — no
 * compile-time coupling to the permission module.
 *
 * <p>Backed by the {@code permission} table.
 */
public interface PermissionCatalogPort {

    /**
     * Returns the scope for a permission code, or {@code null} if the code
     * is not registered.
     */
    PermissionScope scopeFor(String permissionCode);

    /**
     * Returns {@code true} if the permission code exists in the catalog.
     */
    boolean exists(String permissionCode);
}
