// plugins/index.jsx — registers built-in source plugins at app boot.
// NavLabel / ChildRow / fetchChildren injected later by PluginLoader
// when remote service plugins load via the manifest.

import React from 'react';
import { registerSourcePlugin, registerDefaultPlugin } from '../services/sourcePlugins';
import { defaultPlugin } from './defaultPlugin';
import StepPreviewPanel from '../components/StepPreviewPanel';
import GenericDetailEditor from '../components/GenericDetailEditor';
import TextPreviewPanel from '../components/TextPreviewPanel';
import { LockIcon, EditIcon } from '../components/Icons';

// Fallback NavLabel components — shown until remote nav plugins finish loading.
// Content area only; shell chrome (chevron, icon, pin/unpin) is provided by NavItem.

function PsmFallbackNavLabel({ item, ctx }) {
  const { userId, stateColorMap } = ctx;
  const rev        = item.revision || item.REVISION || 'A';
  const iter       = item.iteration ?? item.ITERATION ?? 1;
  const state      = item.lifecycle_state_id || item.LIFECYCLE_STATE_ID;
  const logicalId  = item.logical_id || item.LOGICAL_ID || '';
  const lockedBy   = item.locked_by || item.LOCKED_BY || null;
  const txStatus   = item.tx_status || item.TX_STATUS || 'COMMITTED';
  const isPending  = txStatus === 'OPEN';
  const lockedByOther = lockedBy && lockedBy !== userId;
  const lockedByMe    = lockedBy && lockedBy === userId;
  return (
    <>
      <span className="ni-dot" style={{ background: stateColorMap?.[state] || '#6b7280' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {logicalId || <span className="ni-no-id">—</span>}
        {(item.display_name || item.DISPLAY_NAME) && (
          <span className="ni-dname">{item.display_name || item.DISPLAY_NAME}</span>
        )}
      </span>
      <span className="ni-reviter" style={isPending ? { color: 'var(--warn)' } : undefined}>
        {iter === 0 ? rev : `${rev}.${iter}`}
      </span>
      {lockedByOther && <LockIcon size={10} strokeWidth={2.5} color="var(--muted)" style={{ flexShrink: 0 }} />}
      {lockedByMe    && <EditIcon size={10} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />}
    </>
  );
}

function DstFallbackNavLabel({ item }) {
  const name = item.originalName || item.ORIGINAL_NAME || item.id;
  return (
    <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {name}
    </span>
  );
}

let _registered = false;
export function registerBuiltinPlugins() {
  if (_registered) return;
  _registered = true;

  registerDefaultPlugin(defaultPlugin);

  // PSM nodes — Preview + hasItemChildren registered at boot.
  // NavLabel / ChildRow / fetchChildren injected async by PluginLoader (psm-nav).
  registerSourcePlugin({
    match: { serviceCode: 'psm', itemCode: 'node' },
    name: 'psm-shell',
    NavLabel: PsmFallbackNavLabel,
    Preview: StepPreviewPanel,
    previewLabel: '3D Preview',
    hasItemChildren: (item) => {
      const cc = item.children_count ?? item.CHILDREN_COUNT;
      return cc == null || cc > 0;
    },
  });

  // DST data objects — Editor + Preview registered at boot.
  // NavLabel / LinkRow injected async by PluginLoader (dst-nav remote plugin).
  registerSourcePlugin({
    match: { serviceCode: 'dst', itemCode: 'data-object' },
    name: 'dst-shell',
    NavLabel: DstFallbackNavLabel,
    Editor: GenericDetailEditor,
    Preview: TextPreviewPanel,
    previewLabel: 'Preview',
    hasItemChildren: () => false,
  });
}
