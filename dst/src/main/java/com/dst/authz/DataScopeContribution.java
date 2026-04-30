package com.dst.authz;

import com.plm.platform.authz.PermissionScopeContribution;
import com.plm.platform.authz.dto.ScopeRegistration;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Declares the {@code DATA} scope owned by dst.
 *
 * <p>Role-only check (no keys): dst objects are referenced by an opaque UUID
 * the service mints itself, so authorization is global per role rather than
 * per-data-row. If per-object ACLs are needed later, add a key here and a
 * value source endpoint.
 */
@Component
public class DataScopeContribution implements PermissionScopeContribution {

    @Override
    public ScopeRegistration definition() {
        return new ScopeRegistration(
            "DATA",
            null,
            "Role-only access to the data store. Permissions: READ_DATA, WRITE_DATA, MANAGE_DATA.",
            List.of(),
            List.of()
        );
    }
}
