package com.dst.resource;

import com.plm.platform.authz.PlmPermission;
import org.springframework.stereotype.Component;

/**
 * Permission gate for visibility resolvers. Resolvers push a transient
 * {@link com.dst.security.DstUserContext} then call these methods through
 * the Spring AOP proxy so {@link PlmPermission} enforcement fires normally.
 */
@Component
public class DataPermissionGate {

    @PlmPermission("READ_DATA")
    public void assertCanRead() {}

    @PlmPermission("WRITE_DATA")
    public void assertCanWrite() {}
}
