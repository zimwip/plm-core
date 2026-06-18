package com.plm.platform.action.guard;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.algorithm.AlgorithmRegistryAutoConfiguration;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigRegistrationAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Lazy;

import java.util.List;

/**
 * Wires the appropriate {@link ActionGuardPort} implementation:
 * <ul>
 *   <li>{@link ActionGuardService} — when {@link ConfigCache} is present (services with action config)</li>
 *   <li>{@link LocalActionGuardService} — fallback for simple services (DST, etc.)</li>
 * </ul>
 */
@AutoConfiguration(after = {ConfigRegistrationAutoConfiguration.class, AlgorithmRegistryAutoConfiguration.class})
@ConditionalOnMissingBean(ActionGuardPort.class)
public class PlmActionGuardAutoConfiguration {

    // Gate on the SAME property that creates ConfigCache (psm.config.admin-url),
    // NOT @ConditionalOnBean(ConfigCache.class): the bean-presence condition is
    // order-sensitive and was evaluating false here, so the LocalActionGuardService
    // fallback won — it ignores config-cache guards, leaving every action ungated.
    @Bean
    @ConditionalOnProperty(prefix = "psm.config", name = "admin-url")
    public ActionGuardService configCacheActionGuardService(
            ConfigCache configCache,
            @Lazy AlgorithmRegistry algorithmRegistry) {
        return new ActionGuardService(configCache, algorithmRegistry);
    }

    @Bean
    @ConditionalOnMissingBean(ActionGuardService.class)
    public LocalActionGuardService localActionGuardService(
            List<ActionGuardRegistration> registrations,
            List<ActionGuard> guards) {
        return new LocalActionGuardService(registrations, guards);
    }
}
