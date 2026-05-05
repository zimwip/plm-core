package com.plm.platform.item;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

import java.util.Collections;
import java.util.List;

/**
 * Activates the federated item catalog endpoint when
 * {@code plm.resources.enabled=true}.
 *
 * <p>Platform-api discovers services through
 * {@link com.plm.platform.spe.registry.LocalServiceRegistry} and fans out
 * live to every source's {@code /internal/items/visible} via
 * {@link com.plm.platform.spe.client.ServiceClient}. So this auto-config
 * only wires the service-side endpoint + its default resolver — no
 * registration sidecar, no cached state.
 *
 * <p>The flag name {@code plm.resources.enabled} is preserved from the
 * previous resource/browse split for compatibility with existing
 * {@code application.properties} entries.
 *
 * <p>Beans registered here:
 * <ul>
 *   <li>{@link ItemVisibilityController} — exposes {@code /internal/items/visible}.</li>
 *   <li>{@link DefaultItemVisibilityResolver} — fallback resolver returning
 *       all contributed descriptors unfiltered when the service does not
 *       provide its own.</li>
 * </ul>
 */
@AutoConfiguration
@ConditionalOnProperty(prefix = "plm.resources", name = "enabled", havingValue = "true", matchIfMissing = false)
public class ItemCatalogRegistrationAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(ItemVisibilityResolver.class)
    public ItemVisibilityResolver defaultItemVisibilityResolver() {
        return new DefaultItemVisibilityResolver();
    }

    @Bean
    @ConditionalOnMissingBean
    public ItemVisibilityController itemVisibilityController(
            org.springframework.beans.factory.ObjectProvider<List<ItemCatalogContribution>> contributionsProvider,
            ItemVisibilityResolver resolver) {
        List<ItemCatalogContribution> contributions =
            contributionsProvider.getIfAvailable(Collections::emptyList);
        return new ItemVisibilityController(contributions, resolver);
    }
}
