package com.plm.platform.settings;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.List;

/**
 * Auto-configuration for settings registration with platform-api.
 * Only activates when {@code plm.settings.enabled=true} (matchIfMissing=false
 * so platform-api itself does not activate this).
 * <p>
 * Mirrors {@code SpeRegistrationAutoConfiguration} / {@code ConfigRegistrationAutoConfiguration} pattern.
 */
@AutoConfiguration
@EnableConfigurationProperties(SettingsRegistrationProperties.class)
@ConditionalOnProperty(prefix = "plm.settings", name = "enabled", havingValue = "true", matchIfMissing = false)
@EnableScheduling
public class SettingsRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public SettingsRegistrationClient settingsRegistrationClient(
            SettingsRegistrationProperties props,
            RestTemplateBuilder restTemplateBuilder,
            List<SettingSectionDto> sections,
            @Autowired(required = false) NatsListenerFactory natsListenerFactory) {
        return new SettingsRegistrationClient(props, restTemplateBuilder.build(), sections, natsListenerFactory);
    }
}
