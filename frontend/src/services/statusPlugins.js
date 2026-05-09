const _plugins = [];

export function registerStatusPlugin(plugin) {
  _plugins.push(plugin);
}

export function getStatusPlugins() {
  return [..._plugins];
}
