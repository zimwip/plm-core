package com.plm.platform.spe;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import com.plm.platform.spe.registry.RegistryUpdateController;

/**
 * Splits into two sub-configurations:
 * <ul>
 *   <li>{@code LocalServiceRegistry} is always registered — it is a local in-memory
 *       cache of the SPE snapshot and downstream beans (ServiceClient) depend on it.
 *       Making it unconditional means test contexts that disable registration still
 *       satisfy ServiceClient injection.</li>
 *   <li>The registration client (which actually posts to spe-api) is gated on
 *       {@code spe.registration.enabled}.</li>
 * </ul>
 */
@AutoConfiguration
@EnableConfigurationProperties(SpeRegistrationProperties.class)
@EnableScheduling
public class SpeRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public LocalServiceRegistry localServiceRegistry() {
        return new LocalServiceRegistry();
    }

    @Configuration
    @ConditionalOnProperty(prefix = "spe.registration", name = "enabled", havingValue = "true", matchIfMissing = true)
    static class RegistrationEnabledConfiguration {

        @Bean
        @ConditionalOnMissingBean
        public RegistryUpdateController registryUpdateController(
                LocalServiceRegistry localRegistry, SpeRegistrationProperties props) {
            return new RegistryUpdateController(localRegistry, props);
        }

        @Bean
        @ConditionalOnMissingBean
        public SpeRegistrationClient speRegistrationClient(
                SpeRegistrationProperties props,
                RestTemplateBuilder restTemplateBuilder,
                LocalServiceRegistry localRegistry,
                org.springframework.beans.factory.ObjectProvider<BuildProperties> buildPropertiesProvider,
                org.springframework.beans.factory.ObjectProvider<NatsListenerFactory> natsListenerFactoryProvider,
                org.springframework.context.ApplicationContext applicationContext) {
            RestTemplate rest = restTemplateBuilder.build();
            return new SpeRegistrationClient(props, rest, localRegistry,
                    buildPropertiesProvider.getIfAvailable(),
                    natsListenerFactoryProvider.getIfAvailable(),
                    applicationContext);
        }
    }
}
