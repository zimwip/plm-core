package com.plm.platform.spe;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Configuration driving service self-registration with spe-api. All paths
 * and identifiers are explicit so each service declares its own identity
 * in application.yml rather than hardcoding constants in Java.
 */
@ConfigurationProperties(prefix = "spe.registration")
public record SpeRegistrationProperties(
    String serviceCode,
    String routePrefix,
    List<String> extraPaths,
    String selfBaseUrl,
    String speUrl,
    String serviceSecret,
    Boolean enabled,
    String spaceTag
) {
    public SpeRegistrationProperties {
        if (extraPaths == null) extraPaths = List.of();
        if (speUrl == null || speUrl.isBlank()) speUrl = "http://spe-api:8082";
        if (enabled == null) enabled = Boolean.TRUE;
    }
}
