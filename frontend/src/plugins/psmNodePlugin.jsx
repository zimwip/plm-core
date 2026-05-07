import React from 'react';
import { api } from '../services/api';
import { setDraggedNode, clearDraggedNode } from '../services/dragState';
import { NODE_ICONS } from '../components/Icons';
import {
  ChevronDownIcon, ChevronRightIcon, LockIcon, EditIcon,
} from '../components/Icons';
import NodeEditor from '../components/NodeEditor';

/**
 * Frozen descriptor used by PSM-internal navigation shortcuts (dashboard,
 * header search, link rows, post-create). All of them resolve to the same
 * get endpoint regardless of node type, so the descriptor is defined
 * once here and reused.
 */
export const psmNodeDescriptor = Object.freeze({
  serviceCode: 'psm',
  itemCode:    'node',
  itemKey:     null,
  get:         Object.freeze({ httpMethod: 'GET', path: '/nodes/{id}/detail' }),
});

/**
 * PSM node plugin — owns rich-row rendering (state, lock, drag, rev/iter),
 * child link tree expansion, and the rich NodeEditor pane.
 */

export function PsmNodeNavRow({
  descriptor, item, ctx,
  isActive, hasChildren, isExpanded, isLoading,
  onToggleChildren,
}) {
  const { userId, stateColorMap, onNavigate } = ctx;
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
  const typeColor = descriptor.color || null;
  const NtIcon = descriptor.icon ? NODE_ICONS[descriptor.icon] : null;

  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      draggable
      onDragStart={e => {
        e.dataTransfer.effectAllowed = 'link';
        const payload = {
          nodeId: id,
          nodeTypeId: descriptor.itemKey,
          logicalId,
          typeName: descriptor.displayName,
        };
        e.dataTransfer.setData('text/plain', 'plm-node');
        setDraggedNode(payload);
      }}
      onDragEnd={() => clearDraggedNode()}
      onClick={() => onNavigate(id, logicalId || undefined, descriptor)}
      title={lockedByOther
        ? `Locked by ${lockedBy}`
        : (isPending
          ? `${iter === 0 ? rev : rev + '.' + iter} — pending changes`
          : (logicalId || id))}
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
      {NtIcon
        ? <NtIcon size={10} color={typeColor || 'var(--muted2)'} strokeWidth={2} style={{ flexShrink: 0 }} />
        : typeColor
          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: typeColor, flexShrink: 0, display: 'inline-block' }} />
          : null}
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
      {lockedByOther && (
        <LockIcon size={10} strokeWidth={2.5} color="var(--muted)" style={{ flexShrink: 0 }} />
      )}
      {lockedByMe && (
        <EditIcon size={10} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />
      )}
    </div>
  );
}

/**
 * One V2M / V2V child link row. Receives the cycle-detected ancestor set
 * + pre-resolved expand state from BrowseNav.
 */
export function PsmLinkRow({
  link, depth, parentPath, ancestorIds,
  ctx,
  childCacheRef, expandedPaths, toggleNodeChildren,
}) {
  const { stateColorMap, onNavigate, activeNodeId } = ctx;
  const tgtId = link.targetNodeId;
  const isV2V = link.linkPolicy === 'VERSION_TO_VERSION';
  const isCycle = ancestorIds.has(tgtId);
  const childPath = `${parentPath}/${link.linkId}`;
  const isExp = !isCycle && expandedPaths.has(childPath);
  const cached = childCacheRef.current[tgtId];
  const loading = cached === 'loading';
  const paddingLeft = 10 + depth * 14;
  const ltColor = link.linkTypeColor || null;
  const LtIcon = link.linkTypeIcon ? NODE_ICONS[link.linkTypeIcon] : null;
  const hasChildrenFromApi = link.targetChildrenCount != null
    ? link.targetChildrenCount > 0
    : !Array.isArray(cached) || cached.length > 0;
  const showChevron = !isCycle && hasChildrenFromApi;

  return (
    <>
      <div
        className={`ni-link-row${tgtId === activeNodeId ? ' active' : ''}`}
        style={{ paddingLeft }}
        onClick={() => onNavigate(tgtId, link.targetLogicalId || undefined, psmNodeDescriptor)}
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
                ? <ChevronDownIcon size={9} strokeWidth={2.5} color="var(--muted)" />
                : <ChevronRightIcon size={9} strokeWidth={2.5} color="var(--muted)" />}
        </span>
        {LtIcon
          ? <LtIcon size={10} color={ltColor || 'var(--muted2)'} strokeWidth={2} style={{ flexShrink: 0 }} />
          : ltColor
            ? <span style={{ width: 6, height: 6, borderRadius: 1, background: ltColor, flexShrink: 0, display: 'inline-block' }} />
            : null}
        <span className="ni-dot" style={{ background: stateColorMap?.[link.targetState] || '#6b7280' }} />
        <span className="ni-logical" style={{ flex: 1, minWidth: 0, color: ltColor || undefined }}>
          {link.targetLogicalId || <span className="ni-no-id" style={{ color: 'var(--muted2)' }}>—</span>}
          {link.linkLogicalId && (
            <span style={{ opacity: 0.65, marginLeft: 3 }}>[{link.linkLogicalId}]</span>
          )}
        </span>
        <span className="ni-reviter">{link.targetRevision}.{link.targetIteration}</span>
        <span className={`ni-policy ni-policy-${isV2V ? 'v2v' : 'v2m'}`}>
          {isV2V ? 'V2V' : 'V2M'}
        </span>
      </div>
    </>
  );
}

export function PsmNodeEditor({ tab, ctx }) {
  const {
    userId, tx, nodeTypes, stateColorMap, onAutoOpenTx, toast,
    onDescriptionLoaded, onOpenCommentsForVersion, onCommentAttribute,
    onSubTabChange, onNavigate,
  } = ctx;
  return (
    <NodeEditor
      key={tab.nodeId}
      nodeId={tab.nodeId}
      userId={userId}
      tx={tx}
      nodeTypes={nodeTypes}
      stateColorMap={stateColorMap}
      activeSubTab={tab.activeSubTab || 'attributes'}
      onSubTabChange={key => onSubTabChange(tab.id, key)}
      toast={toast}
      onAutoOpenTx={onAutoOpenTx}
      onDescriptionLoaded={onDescriptionLoaded}
      onOpenCommentsForVersion={onOpenCommentsForVersion}
      onCommentAttribute={onCommentAttribute}
      onNavigate={onNavigate}
    />
  );
}

export const psmNodePlugin = {
  match: { serviceCode: 'psm', itemCode: 'node' },
  name: 'psm-node',
  NavRow: PsmNodeNavRow,
  ChildRow: PsmLinkRow,
  Editor: PsmNodeEditor,
  hasItemChildren: (item) => {
    const cc = item.children_count ?? item.CHILDREN_COUNT;
    return cc == null || cc > 0;
  },
  fetchChildren: async (item, ctx) => {
    const id = item.id || item.ID;
    try {
      const links = await api.getChildLinks(ctx.userId, id);
      return Array.isArray(links) ? links : [];
    } catch {
      return [];
    }
  },
};
