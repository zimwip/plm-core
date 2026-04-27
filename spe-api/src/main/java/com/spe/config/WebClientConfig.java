package com.spe.config;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.client.RestTemplateCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder();
    }

    /**
     * RestTemplateBuilder for platform-lib registration clients (SPE + Settings).
     * RestTemplateAutoConfiguration is disabled in reactive apps, so we provide the
     * bean manually but still pick up every RestTemplateCustomizer the context exposes
     * (notably ObservationRestTemplateCustomizer from Micrometer Tracing) so outbound
     * calls propagate traceparent headers.
     */
    @Bean
    @ConditionalOnMissingBean
    public RestTemplateBuilder restTemplateBuilder(ObjectProvider<RestTemplateCustomizer> customizers) {
        RestTemplateBuilder builder = new RestTemplateBuilder();
        List<RestTemplateCustomizer> ordered = customizers.orderedStream().toList();
        if (!ordered.isEmpty()) {
            builder = builder.additionalCustomizers(ordered);
        }
        return builder;
    }
}
