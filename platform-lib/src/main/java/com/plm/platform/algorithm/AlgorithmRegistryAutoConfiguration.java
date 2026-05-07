package com.plm.platform.algorithm;

import com.plm.platform.PlatformService;
import com.plm.platform.algorithm.stats.AlgorithmStatsPublisher;
import com.plm.platform.algorithm.stats.AlgorithmStatsPublisherAutoConfiguration;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigRegistrationAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.Map;

@AutoConfiguration(after = {ConfigRegistrationAutoConfiguration.class, AlgorithmStatsPublisherAutoConfiguration.class})
public class AlgorithmRegistryAutoConfiguration {

    @Bean
    public AlgorithmRegistry algorithmRegistry(ApplicationContext ctx) {
        Class<?> appClass = null;
        try {
            Map<String, PlatformService> apps = ctx.getBeansOfType(PlatformService.class);
            if (!apps.isEmpty()) {
                appClass = apps.values().iterator().next().getClass();
            }
        } catch (Exception ignored) {}
        return new AlgorithmRegistry(ctx, appClass);
    }

    @Bean
    @ConditionalOnBean(AlgorithmStatsPublisher.class)
    public AlgorithmStatsService algorithmStatsService(AlgorithmStatsPublisher publisher) {
        return new AlgorithmStatsService(publisher);
    }

    @Bean
    @ConditionalOnBean(ConfigCache.class)
    public AlgorithmStartupValidator algorithmStartupValidator(
            ConfigCache configCache,
            AlgorithmRegistry algorithmRegistry,
            ApplicationContext appCtx) {
        return new AlgorithmStartupValidator(configCache, algorithmRegistry, appCtx);
    }
}
