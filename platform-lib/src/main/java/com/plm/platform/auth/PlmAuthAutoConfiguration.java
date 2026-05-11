package com.plm.platform.auth;

import java.util.List;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;

import jakarta.servlet.Filter;

/**
 * Wires the shared {@link PlmAuthFilter} into servlet-based services.
 *
 * Activation:
 * <ul>
 *   <li>{@code jakarta.servlet.Filter} must be on the classpath (Spring MVC apps).</li>
 *   <li>{@code plm.auth.enabled} defaults to true (opt-out with {@code plm.auth.enabled=false}).</li>
 *   <li>{@code plm.auth.service-secret} must resolve (via Vault or env); if absent the filter
 *       will still register but reject every call on non-public paths — that surfaces
 *       misconfiguration immediately instead of silently permitting traffic.</li>
 * </ul>
 */
@AutoConfiguration
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
    public PlmAuthFilter plmAuthFilter(AuthProperties props,
                                       JwtVerifier verifier,
                                       ObjectProvider<PlmAuthContextBinder> binders,
                                       @Value("${spe.registration.service-code:}") String serviceCode) {
        List<PlmAuthContextBinder> ordered = binders.orderedStream().toList();
        return new PlmAuthFilter(props, verifier, ordered, serviceCode);
    }

    @Bean
    public FilterRegistrationBean<PlmAuthFilter> plmAuthFilterRegistration(PlmAuthFilter filter) {
        FilterRegistrationBean<PlmAuthFilter> reg = new FilterRegistrationBean<>(filter);
        reg.addUrlPatterns("/*");
        reg.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        reg.setName("plmAuthFilter");
        return reg;
    }
}
