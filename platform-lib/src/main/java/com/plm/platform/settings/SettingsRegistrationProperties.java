package com.plm.platform.settings;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration driving service registration with platform-api.
 * Mirrors {@code SpeRegistrationProperties} / {@code ConfigRegistrationProperties} pattern.
 * <p>
 * {@code enabled} defaults to {@code false} — each service explicitly opts in.
 */
@ConfigurationProperties(prefix = "plm.settings")
public record SettingsRegistrationProperties(
    String settingsUrl,
    String serviceCode,
    String selfBaseUrl,
    String serviceSecret,
    Boolean enabled
) {
    public SettingsRegistrationProperties {
        if (settingsUrl == null || settingsUrl.isBlank()) settingsUrl = "http://platform-api:8084";
        if (enabled == null) enabled = Boolean.FALSE;
    }
}
