package com.plm.platform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration driving psm-data's registration with psm-admin for config sync.
 * Mirrors {@code SpeRegistrationProperties} pattern.
 */
@ConfigurationProperties(prefix = "psm.config")
public record ConfigRegistrationProperties(
    String adminUrl,
    String serviceCode,
    String selfBaseUrl,
    String serviceSecret
) {
    public ConfigRegistrationProperties {
        if (adminUrl == null || adminUrl.isBlank()) adminUrl = "http://psm-admin:8083";
    }
}
