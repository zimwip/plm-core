package com.plm.platform.resource;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

import java.util.Collections;
import java.util.List;

/**
 * Activates the resource catalog endpoints when {@code plm.resources.enabled=true}.
 *
 * <p>Platform-api no longer caches descriptors: it discovers services through
 * {@link com.plm.platform.spe.registry.LocalServiceRegistry} and fans out live
 * to every source's {@code /internal/resources/visible} via
 * {@link com.plm.platform.spe.client.ServiceClient}. So this auto-config only
 * wires the service-side endpoint + its default resolver — no registration
 * sidecar, no cached state.
 *
 * <p>Beans registered here:
 * <ul>
 *   <li>{@link ResourceVisibilityController} — exposes {@code /internal/resources/visible}.</li>
 *   <li>{@link DefaultResourceVisibilityResolver} — fallback resolver returning
 *       all contributed descriptors when the service does not provide its own.</li>
 * </ul>
 */
@AutoConfiguration
@ConditionalOnProperty(prefix = "plm.resources", name = "enabled", havingValue = "true", matchIfMissing = false)
public class ResourceCatalogRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(ResourceVisibilityResolver.class)
    public ResourceVisibilityResolver defaultResourceVisibilityResolver() {
        return new DefaultResourceVisibilityResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    public ResourceVisibilityController resourceVisibilityController(
            org.springframework.beans.factory.ObjectProvider<List<ResourceCatalogContribution>> contributionsProvider,
            ResourceVisibilityResolver resolver) {
        List<ResourceCatalogContribution> contributions =
            contributionsProvider.getIfAvailable(Collections::emptyList);
        return new ResourceVisibilityController(contributions, resolver);
    }
}
