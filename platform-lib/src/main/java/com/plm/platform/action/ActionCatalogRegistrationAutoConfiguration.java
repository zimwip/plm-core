package com.plm.platform.action;

import com.plm.platform.action.guard.ActionGuard;
import com.plm.platform.nats.NatsListenerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.List;

/**
 * Auto-configuration for action/guard catalog registration with platform-api.
 * Activates when {@code platform.registration.platform-url} and
 * {@code platform.registration.service-code} are set.
 *
 * Both PSM and DST already configure these properties.
 */
@AutoConfiguration
@ConditionalOnProperty(name = {"platform.registration.platform-url", "platform.registration.service-code"})
@EnableScheduling
public class ActionCatalogRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(ActionCatalogRegistrationClient.class)
    public ActionCatalogRegistrationClient actionCatalogRegistrationClient(
            ObjectProvider<ActionHandler> handlerProvider,
            ObjectProvider<ActionGuard> guardProvider,
            ObjectProvider<AlgorithmCatalogContribution> contributionProvider,
            RestTemplateBuilder restTemplateBuilder,
            @org.springframework.beans.factory.annotation.Value("${platform.registration.platform-url:http://platform-api:8084}") String platformUrl,
            @org.springframework.beans.factory.annotation.Value("${platform.registration.service-code}") String serviceCode,
            @org.springframework.beans.factory.annotation.Value("${platform.registration.service-secret:${plm.service.secret:}}") String serviceSecret,
            @Autowired(required = false) NatsListenerFactory natsListenerFactory) {

        List<ActionHandler> handlers = handlerProvider.orderedStream().toList();
        List<ActionGuard> guards = guardProvider.orderedStream().toList();
        List<AlgorithmCatalogContribution> contributions = contributionProvider.orderedStream().toList();

        return new ActionCatalogRegistrationClient(
            platformUrl, serviceCode, serviceSecret, restTemplateBuilder.build(),
            handlers, guards, contributions, natsListenerFactory);
    }
}
