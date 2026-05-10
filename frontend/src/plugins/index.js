// plugins/index.js — single import point that registers every built-in
// source plugin at app boot. Imported once from App.jsx; the order here
// matters only insofar as `registerSourcePlugin` keeps plugins sorted by
// match-specificity, so registration order is irrelevant.

import { registerSourcePlugin, registerDefaultPlugin } from '../services/sourcePlugins';
import { registerStatusPlugin } from '../services/statusPlugins';
import { registerPlugin } from '../shell/pluginRegistry';
import { psmNodePlugin } from './psmNodePlugin';
import { dstDataPlugin } from './dstDataPlugin';
import { dstStatusPlugin } from './dstStatusPlugin';
import { defaultPlugin } from './defaultPlugin';
import {
  NodeTypesSection, DomainsSection, EnumsSection, LifecyclesSection,
  SourcesSection, ImportContextsSection,
} from '../components/SettingsPage';

let _registered = false;
export function registerBuiltinPlugins() {
  if (_registered) return;
  _registered = true;
  registerDefaultPlugin(defaultPlugin);
  registerSourcePlugin(psmNodePlugin);
  // serviceCode 'dst'       → NavRow/Editor (descriptor comes from DST service registration)
  // serviceCode 'DATA_LOCAL' → LinkRow       (targetSourceCode in PSM links uses the source table ID)
  registerSourcePlugin(dstDataPlugin);
  registerSourcePlugin({ ...dstDataPlugin, match: { serviceCode: 'DATA_LOCAL' }, name: 'dst-data-link', NavRow: undefined, Editor: undefined });
  registerStatusPlugin(dstStatusPlugin);

  // psa (psm-admin) settings sections — shell-bundled for now, future: loaded from psm-admin/ui/settings.js
  registerPlugin({
    id: 'psa-settings',
    zone: 'settings',
    sections: {
      'node-types':      NodeTypesSection,
      'domains':         DomainsSection,
      'enums':           EnumsSection,
      'lifecycles':      LifecyclesSection,
      'sources':         SourcesSection,
      'import-contexts': ImportContextsSection,
    },
  });
}
