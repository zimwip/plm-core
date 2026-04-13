import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRightIcon, ChevronDownIcon,
  LayersIcon, CommitIcon, RollbackIcon, GearIcon, PlusIcon, LockIcon,
  EditIcon, XCircleIcon,
} from './Icons';

const STATE_COLORS = {
  'st-draft':    '#6aacff',
  'st-inreview': '#f0b429',
  'st-released': '#4dd4a0',
  'st-frozen':   '#a78bfa',
  'st-obsolete': '#6b7280',
};

const CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

export default function LeftPanel({
  nodes,
  nodeTypes,
  tx,
  txNodes,
  userId,
  activeNodeId,
  onNavigate,
  onCreateNode,
  onCommit,
  onRollback,
  onReleaseNode,
  onOpenSettings,
}) {
  const [expandedTypes,    setExpandedTypes]    = useState(new Set());
  const [releaseConfirmId, setReleaseConfirmId] = useState(null);
  const txId = tx?.ID || tx?.id;

  // Auto-expand the type group of the active node
  useEffect(() => {
    if (!activeNodeId) return;
    const node = (nodes || []).find(n => (n.id || n.ID) === activeNodeId);
    if (!node) return;
    const typeId = node.node_type_id || node.NODE_TYPE_ID;
    if (typeId) setExpandedTypes(prev => new Set([...prev, typeId]));
  }, [activeNodeId, nodes]);

  // Group all nodes by node type
  const nodesByType = useMemo(() => {
    const groups = new Map();
    (nodeTypes || []).forEach(nt => {
      const id = nt.id || nt.ID;
      groups.set(id, { name: nt.name || nt.NAME || id, nodes: [] });
    });
    (nodes || []).forEach(n => {
      const tid   = n.node_type_id   || n.NODE_TYPE_ID   || '_unknown';
      const tname = n.node_type_name || n.NODE_TYPE_NAME || tid;
      if (!groups.has(tid)) groups.set(tid, { name: tname, nodes: [] });
      groups.get(tid).nodes.push(n);
    });
    for (const [k, v] of groups) {
      if (v.nodes.length === 0) groups.delete(k);
    }
    return groups;
  }, [nodes, nodeTypes]);

  function toggleType(typeId) {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      next.has(typeId) ? next.delete(typeId) : next.add(typeId);
      return next;
    });
  }

  const txNodeList = txNodes || [];

  return (
    <aside className="left-panel">

      {/* ── Objects ─────────────────────────────────── */}
      <div className="panel-section" style={{ flex: 1, minHeight: 0 }}>
        <div className="panel-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayersIcon size={12} color="var(--muted)" strokeWidth={2} />
            <span className="panel-label">Objects</span>
          </div>
          <button className="panel-icon-btn" title="Create new object" onClick={onCreateNode}>
            <PlusIcon size={13} color="var(--accent)" strokeWidth={2.5} />
          </button>
        </div>

        <div className="node-list">
          {nodesByType.size === 0 ? (
            <div className="panel-empty">No objects</div>
          ) : [...nodesByType.entries()].map(([typeId, { name, nodes: typeNodes }]) => (
            <div key={typeId}>
              <div className="type-group-hd" onClick={() => toggleType(typeId)}>
                <span className="type-chevron">
                  {expandedTypes.has(typeId)
                    ? <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted)" />
                    : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted)" />
                  }
                </span>
                <span className="type-group-name">{name}</span>
                <span className="type-group-count">{typeNodes.length}</span>
              </div>
              {expandedTypes.has(typeId) && typeNodes.map(n => {
                const id        = n.id    || n.ID;
                const rev       = n.revision  || n.REVISION  || 'A';
                const iter      = n.iteration || n.ITERATION || 1;
                const state     = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID;
                const logicalId = n.logical_id || n.LOGICAL_ID || '';
                const lockedBy  = n.locked_by  || n.LOCKED_BY  || null;
                const lockedByOther = lockedBy && lockedBy !== userId;
                const lockedByMe    = lockedBy && lockedBy === userId;
                return (
                  <div
                    key={id}
                    className={`node-item ${id === activeNodeId ? 'active' : ''}`}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.effectAllowed = 'link';
                      e.dataTransfer.setData('application/plm-node', JSON.stringify({ nodeId: id, nodeTypeId: typeId, logicalId, typeName: name }));
                    }}
                    onClick={() => onNavigate(id)}
                    title={lockedByOther ? `Locked by ${lockedBy}` : (logicalId || id)}
                  >
                    <span className="ni-dot" style={{ background: STATE_COLORS[state] || '#6b7280' }} />
                    <span className="ni-logical">
                      {logicalId || <span className="ni-no-id">—</span>}
                    </span>
                    <span className="ni-reviter">{rev}.{iter}</span>
                    {lockedByOther && (
                      <LockIcon size={10} strokeWidth={2.5} color="var(--muted)" style={{ flexShrink: 0 }} />
                    )}
                    {lockedByMe && (
                      <EditIcon size={10} strokeWidth={2.5} color="var(--accent)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Transaction ─────────────────────────────── */}
      <div className="panel-section tx-panel">
        <div className="panel-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CommitIcon size={12} color="var(--muted)" strokeWidth={2} />
            <span className="panel-label">
              Transaction
              {txId && (
                <span className="tx-id-badge">{txId.slice(0, 8)}…</span>
              )}
            </span>
          </div>
          {txNodeList.length > 0 && (
            <span className="tx-count-badge">{txNodeList.length}</span>
          )}
        </div>

        <div className="tx-list">
          {!txId ? (
            <div className="panel-empty">
              No active transaction.
              <br />
              <span style={{ fontSize: 10, color: 'var(--muted2)' }}>Checkout an object to begin.</span>
            </div>
          ) : txNodeList.length === 0 ? (
            <div className="panel-empty">
              Transaction open —
              <br />
              <span style={{ fontSize: 10, color: 'var(--muted2)' }}>no objects checked out yet.</span>
            </div>
          ) : txNodeList.map((n, i) => {
            const nid       = n.node_id        || n.NODE_ID;
            const logicalId = n.logical_id     || n.LOGICAL_ID  || '';
            const typeName  = n.node_type_name || n.NODE_TYPE_NAME || '';
            const rev       = n.revision       || n.REVISION    || 'A';
            const iter      = n.iteration      || n.ITERATION   || 1;
            const ct        = (n.change_type   || n.CHANGE_TYPE || 'CONTENT').toUpperCase();
            const state     = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
            const badge     = CHANGE_BADGE[ct] || CHANGE_BADGE.CONTENT;
            const isActive  = nid === activeNodeId;
            const confirming = releaseConfirmId === nid;
            return confirming ? (
              <div
                key={i}
                className="tx-item tx-item-confirm"
                onClick={e => e.stopPropagation()}
              >
                <span className="tx-dot" style={{ background: STATE_COLORS[state] || '#6b7280' }} />
                <span className="tx-confirm-msg">Release {logicalId || nid}?</span>
                <button
                  className="btn btn-danger btn-xs"
                  onClick={() => { onReleaseNode && onReleaseNode(nid); setReleaseConfirmId(null); }}
                >
                  Yes
                </button>
                <button className="btn btn-xs" onClick={() => setReleaseConfirmId(null)}>
                  No
                </button>
              </div>
            ) : (
              <div
                key={i}
                className={`tx-item ${isActive ? 'active' : ''}`}
                onClick={() => onNavigate(nid)}
              >
                <span className="tx-dot" style={{ background: STATE_COLORS[state] || '#6b7280' }} />
                <div className="tx-item-body">
                  <div className="tx-item-main">
                    <span className="tx-logical">{logicalId || nid}</span>
                    <span className="tx-reviter">{rev}.{iter}</span>
                  </div>
                  <div className="tx-item-sub">
                    <span className="tx-typename">{typeName}</span>
                    <span
                      className="tx-ct-badge"
                      style={{ background: badge.bg, color: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>
                <button
                  className="tx-release-btn"
                  title="Release from transaction"
                  onClick={e => { e.stopPropagation(); setReleaseConfirmId(nid); }}
                >
                  <XCircleIcon size={12} strokeWidth={2} color="var(--muted)" />
                </button>
              </div>
            );
          })}
        </div>

        {txId && (
          <div className="tx-actions">
            <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={onCommit}>
              <CommitIcon size={12} strokeWidth={2} />
              Commit
            </button>
            <button className="btn btn-danger btn-sm" onClick={onRollback}>
              <RollbackIcon size={12} strokeWidth={2} />
              Rollback
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────── */}
      <div className="panel-footer">
        <button className="settings-btn" onClick={onOpenSettings}>
          <GearIcon size={13} color="var(--muted)" strokeWidth={1.8} />
          <span>Settings &amp; Metadata</span>
        </button>
      </div>
    </aside>
  );
}
