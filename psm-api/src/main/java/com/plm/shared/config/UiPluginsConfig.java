package com.plm.shared.config;

import com.plm.platform.ui.UiPluginDeclaration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Declares the PSM microfrontend plugin entry points.
 * Collected by {@link com.plm.platform.ui.UiPluginsController} (activated when
 * {@code plm.ui.enabled=true}) and exposed at {@code /internal/ui/plugins}.
 */
@Configuration
public class UiPluginsConfig {

    @Bean
    public UiPluginDeclaration psmNavPlugin() {
        return new UiPluginDeclaration("psm-nav", "nav", "nav.js");
    }

    @Bean
    public UiPluginDeclaration psmEditorPlugin() {
        return new UiPluginDeclaration("psm-editor", "editor", "editor.js");
    }
}
