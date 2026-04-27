package com.plm.platform.authz;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration driving the permission-scope sidecar.
 *
 * <p>Service identity ({@code serviceCode}, {@code selfBaseUrl}, {@code serviceSecret})
 * is intentionally <em>not</em> redeclared here — those are shared sidecar
 * concerns and already live on {@code spe.registration} (see
 * {@link com.plm.platform.spe.SpeRegistrationProperties}). The auto-config
 * reads them from there so a service declares its identity exactly once.
 *
 * <p>{@code enabled} defaults to {@code false} — pno-api itself never enables
 * this (it is the registry).
 */
@ConfigurationProperties(prefix = "plm.permission")
public record PermissionScopeRegistrationProperties(
    String pnoUrl,
    Boolean enabled
) {
    public PermissionScopeRegistrationProperties {
        if (pnoUrl == null || pnoUrl.isBlank()) pnoUrl = "http://pno-api:8081";
        if (enabled == null) enabled = Boolean.FALSE;
    }
}
