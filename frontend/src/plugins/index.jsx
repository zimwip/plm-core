// plugins/index.jsx — registers built-in source plugins at app boot.
// Nav capabilities (NavRow, ChildRow, fetchChildren) are injected later by
// PluginLoader when remote service plugins load via the manifest.
// PSM Editor is owned by psm-editor remote plugin (psm-api/ui/src/editor.jsx).

import { registerSourcePlugin, registerDefaultPlugin } from '../services/sourcePlugins';
import { defaultPlugin } from './defaultPlugin';
import StepPreviewPanel from '../components/StepPreviewPanel';
import GenericDetailEditor from '../components/GenericDetailEditor';
import TextPreviewPanel from '../components/TextPreviewPanel';
import { ChevronRightIcon, ChevronDownIcon, LockIcon, EditIcon, PinIcon, PinOffIcon } from '../components/Icons';

// Fallback nav rows — shown until remote nav plugins finish loading.
// These use only shell-available modules (no shellAPI needed).

function PsmFallbackNavRow({ descriptor, item, ctx, isActive, hasChildren, isExpanded, isLoading, onToggleChildren, isPinned, onPin, onUnpin }) {
  const { userId, stateColorMap, onNavigate } = ctx;
  const id         = item.id || item.ID;
  const rev        = item.revision || item.REVISION || 'A';
  const iter       = item.iteration ?? item.ITERATION ?? 1;
  const state      = item.lifecycle_state_id || item.LIFECYCLE_STATE_ID;
  const logicalId  = item.logical_id || item.LOGICAL_ID || '';
  const lockedBy   = item.locked_by || item.LOCKED_BY || null;
  const txStatus   = item.tx_status || item.TX_STATUS || 'COMMITTED';
  const isPending  = txStatus === 'OPEN';
  const lockedByOther = lockedBy && lockedBy !== userId;
  const lockedByMe    = lockedBy && lockedBy === userId;
  const typeColor  = descriptor?.color ?? null;
  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => onNavigate(id, logicalId || undefined, descriptor)}
      title={logicalId || id}
    >
      <span
        className="ni-expand"
        style={{ visibility: (isLoading || hasChildren) ? 'visible' : 'hidden' }}
        onClick={e => onToggleChildren && onToggleChildren(e)}
      >
        {isLoading
          ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
          : isExpanded
            ? <ChevronDownIcon size={9} strokeWidth={2.5} color="var(--muted)" />
            : <ChevronRightIcon size={9} strokeWidth={2.5} color="var(--muted)" />}
      </span>
      {typeColor && <span style={{ width: 6, height: 6, borderRadius: 1, background: typeColor, flexShrink: 0, display: 'inline-block' }} />}
      <span className="ni-dot" style={{ background: stateColorMap?.[state] || '#6b7280' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {logicalId || <span className="ni-no-id">—</span>}
        {(item.display_name || item.DISPLAY_NAME) && <span className="ni-dname">{item.display_name || item.DISPLAY_NAME}</span>}
      </span>
      <span className="ni-reviter" style={isPending ? { color: 'var(--warn)' } : undefined}>
        {iter === 0 ? rev : `${rev}.${iter}`}
      </span>
      {lockedByOther && <LockIcon size={10} strokeWidth={2.5} color="var(--muted)" style={{ flexShrink: 0 }} />}
      {lockedByMe    && <EditIcon size={10} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />}
      {(onPin || onUnpin) && (
        <button
          className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
          title={isPinned ? 'Remove from basket' : 'Add to basket'}
          onClick={e => { e.stopPropagation(); isPinned ? onUnpin?.() : onPin?.(); }}
        >
          {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
        </button>
      )}
    </div>
  );
}

function DstFallbackNavRow({ descriptor, item, ctx, isActive, isPinned, onPin, onUnpin }) {
  const id    = item.id;
  const name  = item.originalName || id;
  const color = descriptor?.color || 'var(--muted2)';
  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => ctx.onNavigate(id, name, descriptor)}
      title={name}
    >
      <span className="ni-expand" style={{ visibility: 'hidden' }} />
      <span style={{ width: 6, height: 6, borderRadius: 1, background: color, flexShrink: 0, display: 'inline-block' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      {(onPin || onUnpin) && (
        <button
          className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
          title={isPinned ? 'Remove from basket' : 'Add to basket'}
          onClick={e => { e.stopPropagation(); isPinned ? onUnpin?.() : onPin?.(); }}
        >
          {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
        </button>
      )}
    </div>
  );
}

let _registered = false;
export function registerBuiltinPlugins() {
  if (_registered) return;
  _registered = true;

  registerDefaultPlugin(defaultPlugin);

  // PSM nodes — Preview + hasItemChildren registered at boot.
  // Editor owned by psm-editor remote plugin (psm-api/ui/src/editor.jsx).
  // NavRow / ChildRow / fetchChildren injected async by PluginLoader (psm-nav).
  registerSourcePlugin({
    match: { serviceCode: 'psm', itemCode: 'node' },
    name: 'psm-shell',
    NavRow: PsmFallbackNavRow,
    Preview: StepPreviewPanel,
    previewLabel: '3D Preview',
    hasItemChildren: (item) => {
      const cc = item.children_count ?? item.CHILDREN_COUNT;
      return cc == null || cc > 0;
    },
  });

  // DST data objects — Editor + Preview registered at boot.
  // NavRow / LinkRow injected async by PluginLoader (dst-nav remote plugin).
  // DATA_LOCAL LinkRow also injected then (via plugin.linkSources).
  registerSourcePlugin({
    match: { serviceCode: 'dst', itemCode: 'data-object' },
    name: 'dst-shell',
    NavRow: DstFallbackNavRow,
    Editor: GenericDetailEditor,
    Preview: TextPreviewPanel,
    previewLabel: 'Preview',
    hasItemChildren: () => false,
  });

}
