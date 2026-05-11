package com.plm.admin.config;

import com.plm.platform.ui.UiPluginDeclaration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the PSA (psm-admin) microfrontend plugin entry points.
 * Collected by {@link com.plm.platform.ui.UiPluginsController} (activated when
 * {@code plm.ui.enabled=true}) and exposed at {@code /internal/ui/plugins}.
 */
@Configuration
public class UiPluginsConfig {

    @Bean
    public UiPluginDeclaration psaSettingsPlugin() {
        return new UiPluginDeclaration("psa-settings", "settings", "settings.js", "MANAGE_PSM");
    }
}
