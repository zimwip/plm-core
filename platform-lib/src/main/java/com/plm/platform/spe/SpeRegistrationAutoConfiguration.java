package com.plm.platform.spe;

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
    public SpeRegistrationClient speRegistrationClient(
            SpeRegistrationProperties props,
            RestTemplateBuilder restTemplateBuilder,
            org.springframework.beans.factory.ObjectProvider<BuildProperties> buildPropertiesProvider) {
        RestTemplate rest = restTemplateBuilder.build();
        return new SpeRegistrationClient(props, rest, buildPropertiesProvider.getIfAvailable());
    }
}
