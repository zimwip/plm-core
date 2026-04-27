package com.plm.platform.authz;

/**
 * Read-only port for permission metadata lookups.
 *
 * <p>Backed by the {@code permission} table (snapshotted locally by each
 * service). Returns {@code null} when the code is unknown.
 */
public interface PermissionCatalogPort {

    /**
     * Returns the scope code for a permission (e.g. {@code "GLOBAL"},
     * {@code "NODE"}, {@code "LIFECYCLE"}, or any future service-contributed
     * scope code), or {@code null} if the code is not registered.
     */
    String scopeFor(String permissionCode);

    /** Returns {@code true} if the permission code exists in the catalog. */
    boolean exists(String permissionCode);
}
