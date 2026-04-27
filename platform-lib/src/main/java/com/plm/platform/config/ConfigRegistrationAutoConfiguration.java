package com.plm.platform.config;

import com.plm.platform.nats.NatsListenerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Auto-configuration for config sync between psm-data and psm-admin.
 * Activates when {@code psm.config.admin-url} is set (i.e. a config consumer, not psm-admin itself).
 *
 * <p>Pulls initial snapshot from psm-admin at startup, then subscribes to NATS
 * for change notifications (if NATS is available).
 */
@AutoConfiguration
@EnableConfigurationProperties(ConfigRegistrationProperties.class)
@ConditionalOnProperty(prefix = "psm.config", name = "admin-url")
public class ConfigRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ConfigCache configCache() {
        return new ConfigCache();
    }

    @Bean
    @ConditionalOnMissingBean
    public ConfigRegistrationClient configRegistrationClient(
            ConfigRegistrationProperties props,
            RestTemplateBuilder restTemplateBuilder,
            ConfigCache configCache,
            @Autowired(required = false) NatsListenerFactory natsListenerFactory,
            ApplicationEventPublisher eventPublisher) {
        RestTemplate rest = restTemplateBuilder.build();
        return new ConfigRegistrationClient(props, rest, configCache, natsListenerFactory, eventPublisher);
    }
}
