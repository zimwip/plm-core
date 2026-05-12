import { initPsmApi, psmApi } from './psmApi';

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

// ── Drag state (module-level) ─────────────────────────────────────────────────

let _draggedNode = null;

function setDraggedNode(payload) { _draggedNode = payload; }
function clearDraggedNode() { _draggedNode = null; }

// ── Shell API reference ───────────────────────────────────────────────────────

let _shellAPI = null;

// ── NavLabel — content area only (shell owns chrome) ─────────────────────────

function PsmNavLabel({ item, ctx }) {
  const { userId, stateColorMap } = ctx;
  const rev       = item.revision || item.REVISION || 'A';
  const iter      = item.iteration ?? item.ITERATION ?? 1;
  const state     = item.lifecycle_state_id || item.LIFECYCLE_STATE_ID;
  const logicalId = item.logical_id || item.LOGICAL_ID || '';
  const lockedBy  = item.locked_by || item.LOCKED_BY || null;
  const txStatus  = item.tx_status || item.TX_STATUS || 'COMMITTED';
  const isPending = txStatus === 'OPEN';
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

// Extra props for the outer shell div (drag-and-drop support).
function psmGetRowProps(item, descriptor, ctx) {
  const id = item.id || item.ID;
  const logicalId = item.logical_id || item.LOGICAL_ID || '';
  const lockedBy  = item.locked_by || item.LOCKED_BY || null;
  const txStatus  = item.tx_status || item.TX_STATUS || 'COMMITTED';
  const isPending = txStatus === 'OPEN';
  const rev  = item.revision || 'A';
  const iter = item.iteration ?? 1;
  return {
    draggable: true,
    title: lockedBy
      ? `Locked by ${lockedBy}`
      : isPending
        ? `${iter === 0 ? rev : rev + '.' + iter} — pending changes`
        : (logicalId || id),
    onDragStart(e) {
      e.dataTransfer.effectAllowed = 'link';
      setDraggedNode({ nodeId: id, nodeTypeId: descriptor?.itemKey, logicalId, typeName: descriptor?.displayName });
      e.dataTransfer.setData('text/plain', 'plm-node');
    },
    onDragEnd() { clearDraggedNode(); },
  };
}

// Inlined — cannot import from shell internals
const PSM_NODE_DESCRIPTOR = Object.freeze({
  serviceCode: 'psm',
  itemCode:    'node',
  itemKey:     null,
  get:         Object.freeze({ httpMethod: 'GET', path: '/nodes/{id}/description' }),
});

// ── ChildRow — link tree row ──────────────────────────────────────────────────

function PsmLinkRowRemote({
  link, depth, parentPath, ancestorIds,
  ctx,
  childCacheRef, expandedPaths, toggleNodeChildren,
}) {
  const { stateColorMap, onNavigate, activeNodeId } = ctx;
  const tgtId   = link.targetNodeId;
  const isV2V   = link.linkPolicy === 'VERSION_TO_VERSION';
  const isCycle = ancestorIds.has(tgtId);
  const childPath = `${parentPath}/${link.linkId}`;
  const isExp   = !isCycle && expandedPaths.has(childPath);
  const cached  = childCacheRef.current[tgtId];
  const loading = cached === 'loading';
  const paddingLeft = 10 + depth * 14;
  const ltColor = link.linkTypeColor || null;
  const hasChildrenFromApi = link.targetChildrenCount != null
    ? link.targetChildrenCount > 0
    : !Array.isArray(cached) || cached.length > 0;
  const showChevron = !isCycle && hasChildrenFromApi;

  return (
    <div
      className={`ni-link-row${tgtId === activeNodeId ? ' active' : ''}`}
      style={{ paddingLeft }}
      onClick={() => onNavigate(tgtId, link.targetLogicalId || undefined, PSM_NODE_DESCRIPTOR)}
      title={`${link.linkLogicalId || link.linkId} → ${link.targetLogicalId || tgtId} ${link.targetRevision}.${link.targetIteration}`}
    >
      <span
        className="ni-expand"
        style={{ visibility: (showChevron || loading) ? 'visible' : 'hidden' }}
        onClick={e => { if (!isCycle) toggleNodeChildren(childPath, tgtId, e); else e.stopPropagation(); }}
      >
        {isCycle
          ? <span style={{ fontSize: 9, color: 'var(--muted2)', lineHeight: 1 }}>↺</span>
          : loading
            ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
            : isExp
              ? <ChevronDown size={9} strokeWidth={2.5} color="var(--muted)" />
              : <ChevronRight size={9} strokeWidth={2.5} color="var(--muted)" />}
      </span>
      {ltColor && (
        <span style={{ width: 6, height: 6, borderRadius: 1, background: ltColor, flexShrink: 0, display: 'inline-block' }} />
      )}
      <span className="ni-dot" style={{ background: stateColorMap?.[link.targetState] || '#6b7280' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, color: ltColor || undefined }}>
        {link.targetLogicalId || <span className="ni-no-id" style={{ color: 'var(--muted2)' }}>—</span>}
        {link.linkLogicalId && (
          <span style={{ opacity: 0.65, marginLeft: 3 }}>[{link.linkLogicalId}]</span>
        )}
      </span>
      <span className="ni-reviter">{link.targetRevision}.{link.targetIteration}</span>
      <span className={`ni-policy ni-policy-${isV2V ? 'v2v' : 'v2m'}`}>{isV2V ? 'V2V' : 'V2M'}</span>
    </div>
  );
}

// ── Plugin export ─────────────────────────────────────────────────────────────

export default {
  id: 'psm-nav',
  zone: 'nav',

  match: { serviceCode: 'psm', itemCode: 'node' },

  NavLabel: PsmNavLabel,
  getRowProps: psmGetRowProps,

  ChildRow: PsmLinkRowRemote,
  hasItemChildren: (item) => {
    const cc = item.children_count ?? item.CHILDREN_COUNT;
    return cc == null || cc > 0;
  },
  fetchChildren: async (item) => {
    const id = item.id || item.ID;
    try {
      const data = await psmApi.getChildLinks(null, id);
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  },

  init(shellAPI) {
    _shellAPI = shellAPI;
    initPsmApi(shellAPI);
  },

  matches(descriptor) {
    return descriptor?.serviceCode === 'psm';
  },
};
