package com.dst.config;

import com.plm.platform.ui.UiPluginDeclaration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the DST microfrontend plugin entry points.
 * Collected by {@link com.plm.platform.ui.UiPluginsController} (activated when
 * {@code plm.ui.enabled=true}) and exposed at {@code /internal/ui/plugins}.
 */
@Configuration
public class UiPluginsConfig {

    @Bean
    public UiPluginDeclaration dstNavPlugin() {
        return new UiPluginDeclaration("dst-nav", "nav", "nav.js");
    }

    @Bean
    public UiPluginDeclaration dstSettingsPlugin() {
        return new UiPluginDeclaration("dst-settings", "settings", "settings.js", "MANAGE_DATA");
    }
}
