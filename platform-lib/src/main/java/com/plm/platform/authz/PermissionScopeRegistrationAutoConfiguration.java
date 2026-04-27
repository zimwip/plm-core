package com.plm.platform.authz;

import com.plm.platform.spe.SpeRegistrationProperties;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

/**
 * Activates the platform-lib sidecar for permission-scope registration and
 * the auto-mounted scope-value endpoint when {@code plm.permission.enabled=true}.
 *
 * <p>Sidecar identity ({@code serviceCode}, {@code selfBaseUrl}, {@code serviceSecret})
 * is reused from {@link SpeRegistrationProperties} so each service declares it once.
 */
@AutoConfiguration
@EnableConfigurationProperties(PermissionScopeRegistrationProperties.class)
@ConditionalOnProperty(prefix = "plm.permission", name = "enabled", havingValue = "true", matchIfMissing = false)
@EnableScheduling
public class PermissionScopeRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public PermissionScopeRegistrationClient permissionScopeRegistrationClient(
            PermissionScopeRegistrationProperties props,
            SpeRegistrationProperties speProps,
            RestTemplateBuilder restTemplateBuilder,
            org.springframework.beans.factory.ObjectProvider<List<PermissionScopeContribution>> contributionsProvider) {
        RestTemplate rest = restTemplateBuilder.build();
        List<PermissionScopeContribution> contributions = contributionsProvider.getIfAvailable(Collections::emptyList);
        return new PermissionScopeRegistrationClient(props, speProps, rest, contributions);
    }

    @Bean
    @ConditionalOnMissingBean
    public ScopeValueProviderController scopeValueProviderController(
            org.springframework.beans.factory.ObjectProvider<List<ScopeValueProvider>> providersProvider) {
        List<ScopeValueProvider> providers = providersProvider.getIfAvailable(Collections::emptyList);
        return new ScopeValueProviderController(providers);
    }
}
