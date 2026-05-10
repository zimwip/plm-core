const registry = new Map();   // pluginId → plugin
const byZone   = new Map();   // zone → plugin[]

export function registerPlugin(plugin) {
  if (!plugin?.id) return;
  registry.set(plugin.id, plugin);
  if (!byZone.has(plugin.zone)) byZone.set(plugin.zone, []);
  byZone.get(plugin.zone).push(plugin);
}

export function getPluginsForZone(zone) {
  return byZone.get(zone) ?? [];
}

export function findEditorPlugin(descriptor) {
  const editors = byZone.get('editor') ?? [];
  return editors.find(p => p.matches?.(descriptor)) ?? null;
}

export function findNavPlugin(context) {
  const navPlugins = byZone.get('nav') ?? [];
  return navPlugins.find(p => p.matches?.(context)) ?? navPlugins[0] ?? null;
}

// Returns { Component, wrapBody } for the given settings section key, or null.
export function findSettingsSectionComponent(key) {
  for (const plugin of byZone.get('settings') ?? []) {
    if (plugin.sections?.[key]) {
      return { Component: plugin.sections[key], wrapBody: true };
    }
  }
  return null;
}
