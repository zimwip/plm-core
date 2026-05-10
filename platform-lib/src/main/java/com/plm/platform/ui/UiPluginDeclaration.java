package com.plm.platform.ui;

/**
 * Descriptor for a frontend plugin component served by this service.
 * Declare one bean per plugin zone; collected by {@link UiPluginsController}
 * and exposed at {@code /internal/ui/plugins} for platform-api to aggregate.
 *
 * @param pluginId           unique id across the cluster, e.g. {@code "psm-nav"}
 * @param zone               target shell zone: {@code "nav"}, {@code "editor"},
 *                           {@code "console-tab"}, {@code "collab-tab"}, {@code "status"}
 * @param entryPath          filename under {@code /ui/}, e.g. {@code "nav.js"}
 *                           — served at {@code /api/<serviceCode>/ui/<entryPath>}
 * @param requiredPermission optional permission code; {@code null} = all authenticated users
 */
public record UiPluginDeclaration(
        String pluginId,
        String zone,
        String entryPath,
        String requiredPermission
) {
    /** Convenience constructor for publicly visible plugins (no permission required). */
    public UiPluginDeclaration(String pluginId, String zone, String entryPath) {
        this(pluginId, zone, entryPath, null);
    }
}
