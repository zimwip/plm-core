package com.plm.platform.environment;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Configuration driving service self-registration with platform-api. All
 * paths and identifiers are explicit so each service declares its own
 * identity in {@code application.properties} rather than hardcoding
 * constants in Java.
 *
 * <p>Replaces the former {@code spe.registration.*} properties: registration
 * now targets platform-api (the central control plane), not spe-api (which
 * is a pure consumer of the resulting registry).
 */
@ConfigurationProperties(prefix = "platform.registration")
public record PlatformRegistrationProperties(
    String serviceCode,
    String routePrefix,
    List<String> extraPaths,
    String selfBaseUrl,
    String platformUrl,
    String serviceSecret,
    Boolean enabled,
    String spaceTag,
    Boolean subscribeOnly
) {
    public PlatformRegistrationProperties {
        if (extraPaths == null) extraPaths = List.of();
        if (platformUrl == null || platformUrl.isBlank()) platformUrl = "http://platform-api:8084";
        if (enabled == null) enabled = Boolean.TRUE;
        if (subscribeOnly == null) subscribeOnly = Boolean.FALSE;
        if ((routePrefix == null || routePrefix.isBlank()) && serviceCode != null && !serviceCode.isBlank()) {
            routePrefix = "/api/" + serviceCode + "/**";
        }
    }

    public String contextPath() {
        return (serviceCode == null || serviceCode.isBlank()) ? "" : "/api/" + serviceCode;
    }

    /**
     * Path the platform exposes for service-to-service environment registry
     * operations. Includes platform-api's own context-path.
     */
    public String registrationPath() {
        return "/api/platform/internal/environment/register";
    }

    public String snapshotPath() {
        return "/api/platform/internal/environment/snapshot";
    }
}
