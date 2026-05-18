package com.plm.platform.auth;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.client.OperationTokenClient;
import com.plm.platform.client.ServiceClient;
import com.plm.platform.client.ServiceClientAutoConfiguration;
import com.plm.platform.nats.NatsListenerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;

import jakarta.servlet.Filter;

/**
 * Wires {@link PlmAuthFilter} + pno role-cache infrastructure into servlet-based services.
 */
@AutoConfiguration(after = ServiceClientAutoConfiguration.class)
@ConditionalOnClass(Filter.class)
@ConditionalOnWebApplication(type = Type.SERVLET)
@ConditionalOnProperty(prefix = "plm.auth", name = "enabled", matchIfMissing = true)
@EnableConfigurationProperties(AuthProperties.class)
public class PlmAuthAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public JwtVerifier plmJwtVerifier(AuthProperties props) {
        return new JwtVerifier(props.getServiceSecret(), props.getClockSkewSeconds());
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(ServiceClient.class)
    public PnoRoleClient pnoRoleClient(ServiceClient serviceClient) {
        return new PnoRoleClient(serviceClient);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnBean(PnoRoleClient.class)
    public PnoRoleCache pnoRoleCache(PnoRoleClient client, AuthProperties props) {
        return new PnoRoleCache(client, props.getRoleCacheTtlSeconds());
    }

    @Bean
    @ConditionalOnBean({PnoRoleCache.class, NatsListenerFactory.class})
    public PnoChangedSubscriber pnoChangedSubscriber(NatsListenerFactory natsListeners,
                                                     PnoRoleCache cache,
                                                     ObjectMapper objectMapper) {
        return new PnoChangedSubscriber(natsListeners, cache, objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean
    public PlmAuthFilter plmAuthFilter(AuthProperties props,
                                       JwtVerifier verifier,
                                       ObjectProvider<PlmAuthContextBinder> binders,
                                       ObjectProvider<PnoRoleCache> roleCacheProvider) {
        List<PlmAuthContextBinder> ordered = binders.orderedStream().toList();
        PnoRoleCache roleCache = roleCacheProvider.getIfAvailable();
        return new PlmAuthFilter(props, verifier, ordered, roleCache);
    }

    @Bean
    public FilterRegistrationBean<PlmAuthFilter> plmAuthFilterRegistration(PlmAuthFilter filter) {
        FilterRegistrationBean<PlmAuthFilter> reg = new FilterRegistrationBean<>(filter);
        reg.addUrlPatterns("/*");
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        reg.setName("plmAuthFilter");
        return reg;
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(prefix = "plm.operation-token", name = "spe-url")
    public OperationTokenClient operationTokenClient(
            RestTemplateBuilder builder,
            @Value("${plm.operation-token.spe-url}") String speUrl,
            @Value("${plm.service.secret}") String serviceSecret) {
        return new OperationTokenClient(builder, speUrl, serviceSecret);
    }
}
