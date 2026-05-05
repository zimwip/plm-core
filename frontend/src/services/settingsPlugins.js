// services/settingsPlugins.js — pluggable settings section renderers
//
// Mirrors sourcePlugins.js: each backend section key maps to a React component.
// SettingsPage.jsx looks up the plugin for the active section instead of
// maintaining a hardcoded if/else chain.
//
// To add sections for a new service:
//   1. Write the section component (in a dedicated file or SettingsPage.jsx)
//   2. Call registerSettingsPlugin('your-key', YourComponent) at module load
//   3. No changes to SettingsPage.jsx required

const _registry = new Map();

/**
 * @param {string}             key       - matches SettingSectionDto.key from the backend
 * @param {React.ComponentType} Component - receives { userId, projectSpaceId, canWrite, toast }
 * @param {{ wrapBody?: boolean }} opts
 *   wrapBody: true (default) wraps content in settings-content-body;
 *             false for full-page sections (ApiPlayground, UserManual)
 */
export function registerSettingsPlugin(key, Component, { wrapBody = true } = {}) {
  _registry.set(key, { Component, wrapBody });
}

/** Returns { Component, wrapBody } or null if no plugin registered for key. */
export function lookupSettingsPlugin(key) {
  return _registry.get(key) ?? null;
}
