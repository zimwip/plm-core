import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { setDraggedNode, clearDraggedNode } from '../services/dragState';
import { NODE_ICONS } from './Icons';
import {
  ChevronRightIcon, ChevronDownIcon,
  LayersIcon, CommitIcon, RollbackIcon, GearIcon, PlusIcon, LockIcon,
  EditIcon, XCircleIcon,
} from './Icons';
import { SECTIONS } from './SettingsPage';


const CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

// Max tree depth to prevent runaway rendering on circular structures
const MAX_DEPTH = 8;

export default function LeftPanel({
  nodes,
  nodeTypes,
  tx,
  txNodes,
  userId,
  activeNodeId,
  stateColorMap,
  onNavigate,
  canCreateNode,
  onCreateNode,
  onCommit,
  onRollback,
  onReleaseNode,
  showSettings,
  onToggleSettings,
  activeSettingsSection,
  onSettingsSectionChange,
  isDashboardOpen,
  onOpenDashboard,
  style,
}) {
  const [expandedTypes,    setExpandedTypes]    = useState(new Set());
  // Path-based expand state: pathKey = nodeId for top-level, parentPath/linkId for children
  // This makes expand state local to each tree position, not global by nodeId
  const [expandedPaths,    setExpandedPaths]    = useState(new Set());
  const [releaseConfirmId, setReleaseConfirmId] = useState(null);

  // Child-link cache: nodeId → LinkItem[] | 'loading'
  // Cache is keyed by nodeId (data is the same regardless of tree position)
  const childCacheRef = useRef({});
  const [, setCacheTick] = useState(0);

  const txId = tx?.ID || tx?.id;

  // Auto-expand the type group of the active node
  useEffect(() => {
    if (!activeNodeId) return;
    const node = (nodes || []).find(n => (n.id || n.ID) === activeNodeId);
    if (!node) return;
    const typeId = node.node_type_id || node.NODE_TYPE_ID;
    if (typeId) setExpandedTypes(prev => new Set([...prev, typeId]));
  }, [activeNodeId, nodes]);

  // Group nodes by type — also capture color + icon for display
  const nodesByType = useMemo(() => {
    const groups = new Map();
    (nodeTypes || []).forEach(nt => {
      const id = nt.id || nt.ID;
      groups.set(id, {
        name:  nt.name  || nt.NAME  || id,
        color: nt.color || nt.COLOR || null,
        icon:  nt.icon  || nt.ICON  || null,
        nodes: [],
      });
    });
    (nodes || []).forEach(n => {
      const tid   = n.node_type_id   || n.NODE_TYPE_ID   || '_unknown';
      const tname = n.node_type_name || n.NODE_TYPE_NAME || tid;
      if (!groups.has(tid)) groups.set(tid, { name: tname, color: null, icon: null, nodes: [] });
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

  // Expand/collapse using the full path key (so same node at two positions expands independently)
  // nodeId is the actual node whose children we fetch
  const toggleNode = useCallback(async (pathKey, nodeId, e) => {
    if (e) e.stopPropagation();

    setExpandedPaths(prev => {
      const next = new Set(prev);
      next.has(pathKey) ? next.delete(pathKey) : next.add(pathKey);
      return next;
    });

    // Already cached — nothing to fetch
    if (childCacheRef.current[nodeId] !== undefined) return;

    // Kick off fetch
    childCacheRef.current[nodeId] = 'loading';
    setCacheTick(t => t + 1);
    try {
      const links = await api.getChildLinks(userId, nodeId);
      childCacheRef.current[nodeId] = Array.isArray(links) ? links : [];
    } catch {
      childCacheRef.current[nodeId] = [];
    }
    setCacheTick(t => t + 1);
  }, [userId]);

  // ── Recursive link-row renderer ─────────────────────────────────────
  // `parentPath`    — path key of the parent node row (used to build child path keys)
  // `ancestorIds`   — set of nodeIds already in the ancestor chain (cycle detection)
  function renderLinkRows(links, depth, parentPath, ancestorIds) {
    if (!links || links.length === 0 || depth > MAX_DEPTH) return null;

    return links.map(link => {
      const tgtId      = link.targetNodeId;
      const isV2V      = link.linkPolicy === 'VERSION_TO_VERSION';
      const isCycle    = ancestorIds.has(tgtId);
      // Path key for this specific link position
      const childPath  = `${parentPath}/${link.linkId}`;
      const isExp      = !isCycle && expandedPaths.has(childPath);
      const cached     = childCacheRef.current[tgtId];
      const loading    = cached === 'loading';

      // Indentation: each depth level adds 14px
      const paddingLeft = 10 + depth * 14;
      const ltColor     = link.linkTypeColor || null;
      const LtIcon      = link.linkTypeIcon ? NODE_ICONS[link.linkTypeIcon] : null;
      // Hide chevron: use targetChildrenCount from API if available, else fall back to cache
      const hasChildrenFromApi  = link.targetChildrenCount != null
        ? link.targetChildrenCount > 0
        : !Array.isArray(cached) || cached.length > 0;
      const showChevron = !isCycle && hasChildrenFromApi;

      return (
        <React.Fragment key={childPath}>
          {/* ── Link row ── */}
          <div
            className={`ni-link-row${tgtId === activeNodeId ? ' active' : ''}`}
            style={{ paddingLeft }}
            onClick={() => onNavigate(tgtId)}
            title={`${link.linkLogicalId || link.linkId} → ${link.targetLogicalId || tgtId} ${link.targetRevision}.${link.targetIteration}`}
          >
            {/* Expand toggle */}
            <span
              className="ni-expand"
              style={{ visibility: (showChevron || loading) ? 'visible' : 'hidden' }}
              onClick={e => { if (!isCycle) toggleNode(childPath, tgtId, e); else e.stopPropagation(); }}
            >
              {isCycle
                ? <span style={{ fontSize: 9, color: 'var(--muted2)', lineHeight: 1 }}>↺</span>
                : loading
                  ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
                  : isExp
                    ? <ChevronDownIcon  size={9} strokeWidth={2.5} color="var(--muted)" />
                    : <ChevronRightIcon size={9} strokeWidth={2.5} color="var(--muted)" />
              }
            </span>

            {/* Link type icon / color dot */}
            {LtIcon
              ? <LtIcon size={10} color={ltColor || 'var(--muted2)'} strokeWidth={2} style={{ flexShrink: 0 }} />
              : ltColor
                ? <span style={{ width: 6, height: 6, borderRadius: 1, background: ltColor, flexShrink: 0, display: 'inline-block' }} />
                : null
            }

            {/* State dot */}
            <span className="ni-dot" style={{ background: stateColorMap?.[link.targetState] || '#6b7280' }} />

            {/* Target logical ID [link logical ID] — link type color */}
            <span className="ni-logical" style={{ flex: 1, minWidth: 0, color: ltColor || undefined }}>
              {link.targetLogicalId || <span className="ni-no-id" style={{ color: 'var(--muted2)' }}>—</span>}
              {link.linkLogicalId && (
                <span style={{ opacity: 0.65, marginLeft: 3 }}>[{link.linkLogicalId}]</span>
              )}
            </span>

            {/* Rev.iter */}
            <span className="ni-reviter">{link.targetRevision}.{link.targetIteration}</span>

            {/* Policy badge */}
            <span className={`ni-policy ni-policy-${isV2V ? 'v2v' : 'v2m'}`}>
              {isV2V ? 'V2V' : 'V2M'}
            </span>
          </div>

          {/* Recursively render this target's children */}
          {isExp && Array.isArray(cached) && renderLinkRows(
            cached, depth + 1, childPath, new Set([...ancestorIds, tgtId])
          )}
        </React.Fragment>
      );
    });
  }

  const txNodeList = txNodes || [];

  return (
    <aside className="left-panel" style={style}>

      {showSettings ? (
        <div className="settings-section-nav">
          {SECTIONS.map(({ key, label, Icon }) => (
            <div
              key={key}
              className={`settings-nav-item${activeSettingsSection === key ? ' active' : ''}`}
              onClick={() => onSettingsSectionChange(key)}
            >
              <Icon size={13} strokeWidth={1.8} color={activeSettingsSection === key ? 'var(--accent)' : 'var(--muted)'} />
              {label}
            </div>
          ))}
        </div>
      ) : (<>

      {/* ── Dashboard shortcut (only when not on dashboard) ── */}
      {!isDashboardOpen && (
        <button className="panel-dash-btn" onClick={onOpenDashboard} title="Open dashboard">
          <span style={{ opacity: .7, lineHeight: 1 }}>⬡</span>
          Dashboard
        </button>
      )}

      {/* ── Objects ─────────────────────────────────── */}
      <div className="panel-section" style={{ flex: 1, minHeight: 0 }}>
        <div className="panel-section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <LayersIcon size={12} color="var(--muted)" strokeWidth={2} />
            <span className="panel-label">Objects</span>
          </div>
          {canCreateNode && (
            <button className="panel-icon-btn" title="Create new object" onClick={onCreateNode}>
              <PlusIcon size={13} color="var(--accent)" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="node-list">
          {nodesByType.size === 0 ? (
            <div className="panel-empty">No objects</div>
          ) : [...nodesByType.entries()].map(([typeId, { name, color: typeColor, icon: typeIconName, nodes: typeNodes }]) => {
            const NtIcon = typeIconName ? NODE_ICONS[typeIconName] : null;

            return (
              <div key={typeId}>
                {/* Type group header */}
                <div className="type-group-hd" onClick={() => toggleType(typeId)}>
                  <span className="type-chevron">
                    {expandedTypes.has(typeId)
                      ? <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted)" />
                      : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted)" />
                    }
                  </span>
                  {/* Type color/icon dot in group header */}
                  {NtIcon
                    ? <NtIcon size={11} color={typeColor || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
                    : typeColor
                      ? <span style={{ width: 7, height: 7, borderRadius: 1, background: typeColor, flexShrink: 0, display: 'inline-block' }} />
                      : null
                  }
                  <span className="type-group-name">{name}</span>
                  <span className="type-group-count">{typeNodes.length}</span>
                </div>

                {expandedTypes.has(typeId) && typeNodes.map(n => {
                  const id          = n.id       || n.ID;
                  const rev         = n.revision  || n.REVISION  || 'A';
                  const iter        = n.iteration ?? n.ITERATION ?? 1;
                  const state       = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID;
                  const logicalId   = n.logical_id || n.LOGICAL_ID || '';
                  const lockedBy    = n.locked_by  || n.LOCKED_BY  || null;
                  const txStatus    = n.tx_status  || n.TX_STATUS  || 'COMMITTED';
                  const isPending   = txStatus === 'OPEN';
                  const lockedByOther = lockedBy && lockedBy !== userId;
                  const lockedByMe    = lockedBy && lockedBy === userId;
                  const childrenCount = n.children_count ?? n.CHILDREN_COUNT ?? null;

                  // Path key for this top-level node row
                  const nodePathKey = id;
                  const isNodeExp   = expandedPaths.has(nodePathKey);
                  const cached      = childCacheRef.current[id];
                  const loading     = cached === 'loading';
                  // Hide chevron when: known 0 children from list data, or confirmed empty after fetch
                  const hasChildren = childrenCount !== null
                    ? childrenCount > 0
                    : !Array.isArray(cached) || cached.length > 0;

                  return (
                    <React.Fragment key={id}>
                      {/* ── Node row ── */}
                      <div
                        className={`node-item${id === activeNodeId ? ' active' : ''}`}
                        draggable
                        onDragStart={e => {
                          e.dataTransfer.effectAllowed = 'link';
                          const payload = { nodeId: id, nodeTypeId: typeId, logicalId, typeName: name };
                          // Keep dataTransfer for cross-window compatibility, but also store in
                          // module variable as primary source (reliable on Linux/Wayland).
                          e.dataTransfer.setData('text/plain', 'plm-node');
                          setDraggedNode(payload);
                        }}
                        onDragEnd={() => clearDraggedNode()}
                        onClick={() => onNavigate(id)}
                        title={lockedByOther ? `Locked by ${lockedBy}` : (isPending ? `${iter === 0 ? rev : rev + '.' + iter} — pending changes` : (logicalId || id))}
                      >
                        {/* Expand toggle — hidden when node is known to have no children */}
                        <span
                          className="ni-expand"
                          style={{ visibility: (loading || hasChildren) ? 'visible' : 'hidden' }}
                          onClick={e => toggleNode(nodePathKey, id, e)}
                        >
                          {loading
                            ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
                            : isNodeExp
                              ? <ChevronDownIcon  size={9} strokeWidth={2.5} color="var(--muted)" />
                              : <ChevronRightIcon size={9} strokeWidth={2.5} color="var(--muted)" />
                          }
                        </span>

                        {/* Node type icon */}
                        {NtIcon
                          ? <NtIcon size={10} color={typeColor || 'var(--muted2)'} strokeWidth={2} style={{ flexShrink: 0 }} />
                          : typeColor
                            ? <span style={{ width: 6, height: 6, borderRadius: 1, background: typeColor, flexShrink: 0, display: 'inline-block' }} />
                            : null
                        }

                        <span className="ni-dot" style={{ background: stateColorMap?.[state] || '#6b7280' }} />
                        <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {logicalId || <span className="ni-no-id">—</span>}
                          {(n.display_name || n.DISPLAY_NAME) && (
                            <span className="ni-dname">{n.display_name || n.DISPLAY_NAME}</span>
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

                      {/* ── Children link rows ── */}
                      {isNodeExp && renderLinkRows(
                        Array.isArray(cached) ? cached : [],
                        1,
                        nodePathKey,
                        new Set([id])
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
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
            const typeId    = n.node_type_id   || n.NODE_TYPE_ID   || '';
            const rev       = n.revision       || n.REVISION    || 'A';
            const iter      = n.iteration      ?? n.ITERATION   ?? 1;
            const ct        = (n.change_type   || n.CHANGE_TYPE || 'CONTENT').toUpperCase();
            const state     = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
            const badge     = CHANGE_BADGE[ct] || CHANGE_BADGE.CONTENT;
            const isActive  = nid === activeNodeId;
            const confirming = releaseConfirmId === nid;
            // Type appearance — look up from nodesByType map
            const txNtData  = nodesByType.get(typeId) || (typeName ? [...nodesByType.values()].find(g => g.name === typeName) : null);
            const txColor   = txNtData?.color || null;
            const txIconName= txNtData?.icon  || null;
            const TxIcon    = txIconName ? NODE_ICONS[txIconName] : null;
            return confirming ? (
              <div key={i} className="tx-item tx-item-confirm" onClick={e => e.stopPropagation()}>
                <span className="tx-dot" style={{ background: stateColorMap?.[state] || '#6b7280' }} />
                <span className="tx-confirm-msg">Release {logicalId || nid}?</span>
                <button className="btn btn-danger btn-xs"
                  onClick={() => { onReleaseNode && onReleaseNode(nid); setReleaseConfirmId(null); }}>
                  Yes
                </button>
                <button className="btn btn-xs" onClick={() => setReleaseConfirmId(null)}>No</button>
              </div>
            ) : (
              <div key={i} className={`tx-item${isActive ? ' active' : ''}`} onClick={() => onNavigate(nid)}>
                <span className="tx-dot" style={{ background: stateColorMap?.[state] || '#6b7280' }} />
                <div className="tx-item-body">
                  <div className="tx-item-main">
                    <span className="tx-logical">{logicalId || nid}</span>
                    <span className="tx-reviter">{iter === 0 ? rev : `${rev}.${iter}`}</span>
                  </div>
                  <div className="tx-item-sub">
                    <span className="tx-typename" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {TxIcon
                        ? <TxIcon size={10} color={txColor || 'var(--muted2)'} strokeWidth={2} />
                        : txColor
                          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: txColor, display: 'inline-block', flexShrink: 0 }} />
                          : null
                      }
                      {typeName}
                    </span>
                    <span className="tx-ct-badge" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                <button className="tx-release-btn" title="Release from transaction"
                  onClick={e => { e.stopPropagation(); setReleaseConfirmId(nid); }}>
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

      </>)}

      {/* ── Footer ──────────────────────────────────── */}
      <div className="panel-footer">
        <button className={`settings-btn${showSettings ? ' active' : ''}`} onClick={onToggleSettings}>
          <GearIcon size={13} color={showSettings ? 'var(--accent)' : 'var(--muted)'} strokeWidth={1.8} />
          <span>Settings &amp; Metadata</span>
        </button>
      </div>
    </aside>
  );
}
