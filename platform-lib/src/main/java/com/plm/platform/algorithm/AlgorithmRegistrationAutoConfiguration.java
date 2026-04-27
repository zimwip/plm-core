package com.plm.platform.algorithm;

import com.plm.platform.config.ConfigRegistrationProperties;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Activates only when an {@link AlgorithmCatalogProvider} bean exists in the
 * application context AND {@code psm.config.admin-url} is configured.
 * Services with no algorithm beans simply skip this.
 */
@AutoConfiguration
@EnableConfigurationProperties(ConfigRegistrationProperties.class)
@ConditionalOnProperty(prefix = "psm.config", name = "admin-url")
@ConditionalOnBean(AlgorithmCatalogProvider.class)
public class AlgorithmRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public AlgorithmRegistrationClient algorithmRegistrationClient(
            ConfigRegistrationProperties props,
            RestTemplateBuilder restTemplateBuilder,
            AlgorithmCatalogProvider provider) {
        RestTemplate rest = restTemplateBuilder.build();
        return new AlgorithmRegistrationClient(props, rest, provider);
    }
}
