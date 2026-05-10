package com.plm.platform.api.api;

/**
 * Single entry in the UI plugin manifest returned to the shell.
 *
 * @param pluginId           unique plugin identifier
 * @param serviceCode        owning service (e.g. {@code "psm"})
 * @param zone               target shell zone
 * @param url                absolute URL to load the plugin JS module from
 * @param requiredPermission permission code required to see this plugin, or {@code null}
 */
public record UiPluginManifestEntry(
        String pluginId,
        String serviceCode,
        String zone,
        String url,
        String requiredPermission
) {}
