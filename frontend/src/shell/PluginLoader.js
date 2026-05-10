import { registerPlugin } from './pluginRegistry';
import { api } from '../services/api';

export async function loadRemotePlugins(shellAPI) {
  let manifest;
  try {
    manifest = await api.getUiManifest();
  } catch (e) {
    console.warn('[PluginLoader] Failed to fetch UI manifest:', e.message);
    return;
  }

  await Promise.allSettled(manifest.map(async (entry) => {
    try {
      // @vite-ignore — URL is dynamic, resolved at runtime from platform-api manifest
      const mod = await import(/* @vite-ignore */ entry.url);
      const plugin = mod.default;
      if (!plugin?.id) {
        console.warn('[PluginLoader] Plugin at', entry.url, 'has no id — skipped');
        return;
      }
      if (plugin.init) plugin.init(shellAPI);
      registerPlugin(plugin);
    } catch (e) {
      console.warn('[PluginLoader] Failed to load plugin', entry.pluginId, ':', e.message);
    }
  }));
}
