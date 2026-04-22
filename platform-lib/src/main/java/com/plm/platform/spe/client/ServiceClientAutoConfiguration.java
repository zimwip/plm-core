package com.plm.platform.spe.client;

import com.plm.platform.spe.SpeRegistrationAutoConfiguration;
import com.plm.platform.spe.SpeRegistrationProperties;
import com.plm.platform.spe.registry.LocalServiceRegistry;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;

/**
 * Auto-configures the registry-aware ServiceClient with Resilience4j.
 * Only active when SPE registration is enabled (same guard as the registration client).
 */
@AutoConfiguration(after = SpeRegistrationAutoConfiguration.class)
@EnableConfigurationProperties(ServiceClientProperties.class)
@ConditionalOnBean(LocalServiceRegistry.class)
public class ServiceClientAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public ServiceClientResilience serviceClientResilience(ServiceClientProperties props) {
        return new ServiceClientResilience(props);
    }

    @Bean
    @ConditionalOnMissingBean
    public ServiceClient serviceClient(
            LocalServiceRegistry registry,
            ServiceClientResilience resilience,
            SpeRegistrationProperties props,
            RestTemplateBuilder restTemplateBuilder) {
        return new ServiceClient(registry, resilience, props, restTemplateBuilder.build());
    }
}
