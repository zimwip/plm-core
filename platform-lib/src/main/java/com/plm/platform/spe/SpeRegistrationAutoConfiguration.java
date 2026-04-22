package com.plm.platform.spe;

import com.plm.platform.spe.registry.LocalServiceRegistry;
import com.plm.platform.spe.registry.RegistryUpdateController;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@AutoConfiguration
@EnableConfigurationProperties(SpeRegistrationProperties.class)
@ConditionalOnProperty(prefix = "spe.registration", name = "enabled", havingValue = "true", matchIfMissing = true)
@EnableScheduling
public class SpeRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public LocalServiceRegistry localServiceRegistry() {
        return new LocalServiceRegistry();
    }

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
            org.springframework.beans.factory.ObjectProvider<BuildProperties> buildPropertiesProvider) {
        RestTemplate rest = restTemplateBuilder.build();
        return new SpeRegistrationClient(props, rest, localRegistry, buildPropertiesProvider.getIfAvailable());
    }
}
