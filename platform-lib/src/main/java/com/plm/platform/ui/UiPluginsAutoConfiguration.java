package com.plm.platform.ui;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;

import java.util.List;

/**
 * Auto-configuration for the {@link UiPluginsController}.
 * Only activates when {@code plm.ui.enabled=true} (matchIfMissing=false
 * so platform-api itself and services without UI do not activate this).
 */
@AutoConfiguration
@ConditionalOnProperty(prefix = "plm.ui", name = "enabled", havingValue = "true", matchIfMissing = false)
public class UiPluginsAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean(UiPluginsController.class)
    public UiPluginsController uiPluginsController(List<UiPluginDeclaration> plugins) {
        return new UiPluginsController(plugins);
    }
}
