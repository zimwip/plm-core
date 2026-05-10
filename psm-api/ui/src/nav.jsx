/**
 * PSM nav plugin — microfrontend entry point.
 *
 * Exported as an ES module; react + react-dom are external (provided by the
 * shell via importmap). No imports from shell-internal files.
 *
 * Plugin contract:
 *   { id, zone, init(shellAPI), matches(descriptor), Component }
 *
 * Component props (injected by the shell's nav zone renderer):
 *   { shellAPI, descriptor, item, isActive, hasChildren, isExpanded,
 *     isLoading, onToggleChildren }
 */
import React from 'react';

// ── Inline icon primitives (no lucide-react / shell Icons dependency) ────────

function ChevronRight({ size = 9, color = 'currentColor', strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronDown({ size = 9, color = 'currentColor', strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function LockIcon({ size = 10, color = 'currentColor', strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EditIcon({ size = 10, color = 'currentColor', strokeWidth = 2.5 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

// ── Drag state (module-level, no shell dependency) ────────────────────────────

let _draggedNode = null;

function setDraggedNode(payload) { _draggedNode = payload; }
function clearDraggedNode() { _draggedNode = null; }

// ── Shell API reference (stored on init) ─────────────────────────────────────

let _shellAPI = null;

// ── NavRow component ─────────────────────────────────────────────────────────

/**
 * Renders a single PSM node row in the left-panel nav zone.
 *
 * Props are injected by the shell's nav zone renderer. The `shellAPI` is used
 * for navigation; stateColorMap is fetched from the Zustand store.
 */
function PsmNavRow({
  shellAPI,
  descriptor,
  item,
  isActive,
  hasChildren,
  isExpanded,
  isLoading,
  onToggleChildren,
}) {
  const store = shellAPI?.getStore?.() ?? {};
  const stateColorMap = store.stateColorMap ?? {};
  const userId = store.userId ?? null;

  const id = item.id || item.ID;
  const rev = item.revision || item.REVISION || 'A';
  const iter = item.iteration ?? item.ITERATION ?? 1;
  const state = item.lifecycle_state_id || item.LIFECYCLE_STATE_ID;
  const logicalId = item.logical_id || item.LOGICAL_ID || '';
  const lockedBy = item.locked_by || item.LOCKED_BY || null;
  const txStatus = item.tx_status || item.TX_STATUS || 'COMMITTED';
  const isPending = txStatus === 'OPEN';
  const lockedByOther = lockedBy && lockedBy !== userId;
  const lockedByMe = lockedBy && lockedBy === userId;
  const typeColor = descriptor?.color ?? null;

  function handleClick() {
    shellAPI?.navigate?.({ ...descriptor, itemKey: descriptor.itemKey, nodeId: id, logicalId: logicalId || undefined });
  }

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'link';
    setDraggedNode({
      nodeId: id,
      nodeTypeId: descriptor?.itemKey,
      logicalId,
      typeName: descriptor?.displayName,
    });
    e.dataTransfer.setData('text/plain', 'plm-node');
  }

  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={() => clearDraggedNode()}
      onClick={handleClick}
      title={
        lockedByOther
          ? `Locked by ${lockedBy}`
          : isPending
            ? `${iter === 0 ? rev : rev + '.' + iter} — pending changes`
            : (logicalId || id)
      }
    >
      <span
        className="ni-expand"
        style={{ visibility: (isLoading || hasChildren) ? 'visible' : 'hidden' }}
        onClick={e => onToggleChildren && onToggleChildren(e)}
      >
        {isLoading
          ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
          : isExpanded
            ? <ChevronDown size={9} strokeWidth={2.5} color="var(--muted)" />
            : <ChevronRight size={9} strokeWidth={2.5} color="var(--muted)" />}
      </span>

      {typeColor && (
        <span style={{ width: 6, height: 6, borderRadius: 1, background: typeColor, flexShrink: 0, display: 'inline-block' }} />
      )}

      <span className="ni-dot" style={{ background: stateColorMap[state] || '#6b7280' }} />

      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {logicalId || <span className="ni-no-id">—</span>}
        {(item.display_name || item.DISPLAY_NAME) && (
          <span className="ni-dname">{item.display_name || item.DISPLAY_NAME}</span>
        )}
      </span>

      <span className="ni-reviter" style={isPending ? { color: 'var(--warn)' } : undefined}>
        {iter === 0 ? rev : `${rev}.${iter}`}
      </span>

      {lockedByOther && (
        <LockIcon size={10} strokeWidth={2.5} color="var(--muted)" style={{ flexShrink: 0 }} />
      )}
      {lockedByMe && (
        <EditIcon size={10} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}

// ── Plugin export ─────────────────────────────────────────────────────────────

export default {
  id: 'psm-nav',
  zone: 'nav',

  init(shellAPI) {
    _shellAPI = shellAPI;
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'psm';
  },

  Component: PsmNavRow,
};
