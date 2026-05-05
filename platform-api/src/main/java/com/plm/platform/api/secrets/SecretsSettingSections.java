package com.plm.platform.api.secrets;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.plm.platform.settings.dto.SettingSectionDto;

/**
 * Settings section published by platform-api (self-registered via platform-lib).
 * Hosts the Secrets admin tab — backed by {@link SecretsAdminController} at
 * {@code /api/platform/admin/secrets}.
 */
@Configuration
class SecretsSettingSections {

    @Bean
    SettingSectionDto secretsSection() {
        return new SettingSectionDto("secrets", "Secrets", "PLATFORM", 15, "MANAGE_SECRETS", "key");
    }
}
