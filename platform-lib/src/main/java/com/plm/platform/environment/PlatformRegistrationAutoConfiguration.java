package com.plm.platform.environment;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

/**
 * Wires registration with platform-api (replaces the former SPE registration
 * auto-config).
 *
 * <ul>
 *   <li>{@link LocalServiceRegistry} is unconditional — downstream beans
 *       like {@code ServiceClient} depend on it, and tests that disable
 *       registration still need it injectable.</li>
 *   <li>The active registration client is gated by
 *       {@code platform.registration.enabled} (default true) and selects
 *       between full {@link PlatformRegistrationClient} (registers + pulls)
 *       and read-only {@link EnvironmentSubscriber} (subscribe-only mode
 *       for the gateway).</li>
 * </ul>
 */
@AutoConfiguration
@EnableConfigurationProperties(PlatformRegistrationProperties.class)
@EnableScheduling
public class PlatformRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public LocalServiceRegistry localServiceRegistry() {
        return new LocalServiceRegistry();
    }

    @Configuration
    @ConditionalOnProperty(prefix = "platform.registration", name = "enabled", havingValue = "true", matchIfMissing = true)
    static class RegistrationEnabledConfiguration {

        @Bean
        @ConditionalOnMissingBean
        @ConditionalOnProperty(prefix = "platform.registration", name = "subscribe-only", havingValue = "false", matchIfMissing = true)
        public PlatformRegistrationClient platformRegistrationClient(
                PlatformRegistrationProperties props,
                RestTemplateBuilder restTemplateBuilder,
                LocalServiceRegistry localRegistry,
                ObjectProvider<BuildProperties> buildPropertiesProvider,
                ObjectProvider<NatsListenerFactory> natsListenerFactoryProvider,
                ApplicationContext applicationContext) {
            RestTemplate rest = restTemplateBuilder.build();
            return new PlatformRegistrationClient(props, rest, localRegistry,
                buildPropertiesProvider.getIfAvailable(),
                natsListenerFactoryProvider.getIfAvailable(),
                applicationContext);
        }

        @Bean
        @ConditionalOnMissingBean
        @ConditionalOnProperty(prefix = "platform.registration", name = "subscribe-only", havingValue = "true")
        public EnvironmentSubscriber environmentSubscriber(
                PlatformRegistrationProperties props,
                RestTemplateBuilder restTemplateBuilder,
                LocalServiceRegistry localRegistry,
                ObjectProvider<NatsListenerFactory> natsListenerFactoryProvider,
                ApplicationEventPublisher eventPublisher) {
            RestTemplate rest = restTemplateBuilder.build();
            return new EnvironmentSubscriber(props, rest, localRegistry,
                natsListenerFactoryProvider.getIfAvailable(), eventPublisher);
        }
    }
}
