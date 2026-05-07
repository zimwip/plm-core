// services/sourcePlugins.js — pluggable navigation + editor renderers
//
// Each backend service (or even each resource type within a service) can
// register a plugin that controls:
//   - how its rows render in the federated navigation panel,
//   - whether rows expand to show children,
//   - which editor component opens for its objects.
//
// Lookup precedence on a descriptor / tab:
//   1. exact match: serviceCode + itemCode + itemKey
//   2. service+item match (any itemKey)
//   3. service-only match
//   4. global default plugin
//
// Plugins keep BrowseNav and EditorArea generic. Adding support for a new
// source is a drop-in: write a plugin, register it once at app boot — no
// changes to the navigation or editor shells.

const _plugins = []; // ordered: most-specific first

/**
 * @typedef {Object} SourcePluginMatch
 * @property {string}   serviceCode   required
 * @property {string=}  itemCode      optional — narrows to one item of the service
 * @property {string=}  itemKey       optional — narrows further (e.g. one psm node-type)
 *
 * @typedef {Object} SourcePlugin
 * @property {SourcePluginMatch}   match
 * @property {React.ComponentType} [NavRow]       optional row renderer; receives
 *                                                 { descriptor, item, ctx, isActive, hasChildren,
 *                                                   isExpanded, isLoading, onToggleChildren }
 * @property {(item:any) => boolean}  [hasItemChildren]   show chevron when true
 * @property {(item:any, ctx:any) => Promise<any[]>} [fetchChildren]
 * @property {React.ComponentType} [ChildRow]     row used for each child (psm renders link rows)
 * @property {React.ComponentType} [Editor]       editor pane for tabs from this source
 * @property {string}              [name]         logging / debug
 */

export function registerSourcePlugin(plugin) {
  if (!plugin || !plugin.match || !plugin.match.serviceCode) {
    throw new Error('Plugin requires match.serviceCode');
  }
  // Insert by specificity so earlier-matching plugins win
  const specificity = (plugin.match.itemKey ? 4 : 0)
    + (plugin.match.itemCode ? 2 : 0)
    + (plugin.match.serviceCode === '*' ? 0 : 1);
  plugin._specificity = specificity;
  _plugins.push(plugin);
  _plugins.sort((a, b) => (b._specificity || 0) - (a._specificity || 0));
}

function descriptorKey(d) {
  return [d?.serviceCode, d?.itemCode, d?.itemKey].filter(Boolean).join(':');
}

function tabKey(tab) {
  return [tab?.serviceCode, tab?.itemCode, tab?.itemKey].filter(Boolean).join(':');
}

function matches(plugin, ref) {
  const m = plugin.match;
  if (m.serviceCode !== '*' && m.serviceCode !== ref.serviceCode) return false;
  if (m.itemCode && m.itemCode !== ref.itemCode) return false;
  if (m.itemKey && m.itemKey !== ref.itemKey) return false;
  return true;
}

export function lookupPluginForDescriptor(descriptor) {
  for (const p of _plugins) {
    if (matches(p, descriptor || {})) return p;
  }
  return _defaultPlugin;
}

export function lookupPluginForTab(tab) {
  if (!tab) return _defaultPlugin;
  for (const p of _plugins) {
    if (matches(p, tab)) return p;
  }
  return _defaultPlugin;
}

export function pluginKeyForDescriptor(d) { return descriptorKey(d); }
export function pluginKeyForTab(t) { return tabKey(t); }

// ── Built-in default plugin ─────────────────────────────────────────
// Used when no source-specific plugin matches. Renders a flat id/label
// row; the editor pane renders a placeholder so unknown sources fail
// visibly rather than silently.
let _defaultPlugin = {
  match: { serviceCode: '*' },
  name: 'default',
  hasItemChildren: () => false,
  // NavRow + Editor injected by registerDefaultPlugin so the registry
  // module stays JSX-free (importable from non-component code if needed).
};

export function registerDefaultPlugin(plugin) {
  _defaultPlugin = { ..._defaultPlugin, ...plugin, match: { serviceCode: '*' } };
}

/**
 * Find the LinkRow renderer for a given source code. Matches on serviceCode
 * only (itemCode/itemKey constraints on the plugin are ignored) so the lookup
 * works with just the source code coming from a link row.
 *
 * @param {string} sourceCode
 * @returns {React.ComponentType|null}
 */
export function lookupLinkRowForSource(sourceCode) {
  for (const p of _plugins) {
    if (!p.LinkRow) continue;
    if (p.match.serviceCode === '*' || p.match.serviceCode === sourceCode) return p.LinkRow;
  }
  return null;
}

// Test / inspection hook — never called in prod paths.
export function _debugListPlugins() {
  return _plugins.map(p => ({ name: p.name, match: p.match, specificity: p._specificity }));
}
