// plugins/index.js — single import point that registers every built-in
// source plugin at app boot. Imported once from App.jsx; the order here
// matters only insofar as `registerSourcePlugin` keeps plugins sorted by
// match-specificity, so registration order is irrelevant.

import { registerSourcePlugin, registerDefaultPlugin } from '../services/sourcePlugins';
import { psmNodePlugin } from './psmNodePlugin';
import { dstDataPlugin } from './dstDataPlugin';
import { defaultPlugin } from './defaultPlugin';

let _registered = false;
export function registerBuiltinPlugins() {
  if (_registered) return;
  _registered = true;
  registerDefaultPlugin(defaultPlugin);
  registerSourcePlugin(psmNodePlugin);
  registerSourcePlugin(dstDataPlugin);
}
