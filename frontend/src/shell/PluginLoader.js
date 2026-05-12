import { registerPlugin } from './pluginRegistry';
import { registerSourcePlugin, updateSourcePlugin } from '../services/sourcePlugins';
import { api } from '../services/api';

// Loads all remote plugins declared in the platform-api manifest.
// Throws if the manifest fetch fails.
// Returns an array of error strings for any individual plugin that failed to load.
export async function loadRemotePlugins(shellAPI) {
  const manifest = await api.getUiManifest();

  const results = await Promise.allSettled(manifest.map(async (entry) => {
    // @vite-ignore — URL is dynamic, resolved at runtime from platform-api manifest
    const mod = await import(/* @vite-ignore */ entry.url);
    const plugin = mod.default;
    if (!plugin?.id) throw new Error(`Plugin at ${entry.url} has no id`);

    if (plugin.init) plugin.init(shellAPI);
    registerPlugin(plugin);

    // Bridge nav plugins into sourcePlugins so NavItem can use their
    // NavLabel / getRowProps / ChildRow / fetchChildren.
    if (plugin.zone === 'nav' && plugin.match) {
      updateSourcePlugin(plugin.match.serviceCode, plugin.match.itemCode, {
        NavLabel:        plugin.NavLabel        ?? null,
        getRowProps:     plugin.getRowProps      ?? null,
        ChildRow:        plugin.ChildRow         ?? null,
        hasItemChildren: plugin.hasItemChildren  ?? (() => false),
        fetchChildren:   plugin.fetchChildren    ?? null,
        LinkRow:         plugin.LinkRow          ?? null,
      });

      if (plugin.linkSources && plugin.LinkRow) {
        for (const sc of plugin.linkSources) {
          updateSourcePlugin(sc, null, { LinkRow: plugin.LinkRow });
        }
      }
    }
  }));

  return results
    .map((r, i) => r.status === 'rejected'
      ? `${manifest[i]?.pluginId ?? manifest[i]?.url}: ${r.reason?.message ?? r.reason}`
      : null)
    .filter(Boolean);
}
