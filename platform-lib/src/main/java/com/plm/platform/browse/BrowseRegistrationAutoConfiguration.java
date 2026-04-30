package com.plm.platform.browse;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

import java.util.Collections;
import java.util.List;

/**
 * Activates the federated browse endpoints when {@code plm.resources.enabled=true}
 * (same flag as the create axis — a service exposing one usually exposes the
 * other).
 *
 * <p>Mirror of {@link com.plm.platform.resource.ResourceCatalogRegistrationAutoConfiguration}:
 * platform-api fans out live to every source through
 * {@link com.plm.platform.spe.registry.LocalServiceRegistry} and
 * {@link com.plm.platform.spe.client.ServiceClient}, so no registration
 * sidecar is wired here — only the service-side endpoint and a default
 * resolver. Each source enforces visibility itself
 * ({@code READ_NODE} per nodeType in psm, {@code READ_DATA} in dst).
 */
@AutoConfiguration
@ConditionalOnProperty(prefix = "plm.resources", name = "enabled", havingValue = "true", matchIfMissing = false)
public class BrowseRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(BrowseVisibilityResolver.class)
    public BrowseVisibilityResolver defaultBrowseVisibilityResolver() {
        return new DefaultBrowseVisibilityResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    public BrowseVisibilityController browseVisibilityController(
            org.springframework.beans.factory.ObjectProvider<List<ListableContribution>> contributionsProvider,
            BrowseVisibilityResolver resolver) {
        List<ListableContribution> contributions =
            contributionsProvider.getIfAvailable(Collections::emptyList);
        return new BrowseVisibilityController(contributions, resolver);
    }
}
