import React, { useState } from 'react';
import { NODE_ICONS, SECTION_ICONS, CommitIcon, RollbackIcon, PlusIcon, XCircleIcon } from './Icons';
import BrowseNav from './BrowseNav';
import { psmNodeDescriptor } from '../plugins/psmNodePlugin';

const CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

function LeftPanel({
  nodeTypes,            // kept only to colour/icon the transaction panel rows
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
  activeSettingsSection,
  onSettingsSectionChange,
  settingsSections,
  isDashboardOpen,
  onOpenDashboard,
  browseRefreshKey,     // bumped by App on websocket events to force /browse re-fetch
  style,
}) {
  const [releaseConfirmId, setReleaseConfirmId] = useState(null);
  const txId = tx?.ID || tx?.id;
  const txNodeList = txNodes || [];

  // Lookup table for transaction-panel type icons. Built from the cached
  // nodeTypes prop (still derived in App from /browse) — purely cosmetic.
  const nodeTypeMap = React.useMemo(() => {
    const m = new Map();
    (nodeTypes || []).forEach(nt => {
      const id = nt.id || nt.ID;
      m.set(id, {
        name:  nt.name  || nt.NAME  || id,
        color: nt.color || nt.COLOR || null,
        icon:  nt.icon  || nt.ICON  || null,
      });
    });
    return m;
  }, [nodeTypes]);

  return (
    <aside className="left-panel" style={style}>

      {showSettings ? (
        <div className="settings-section-nav">
          {(settingsSections || []).map(group => (
            <div key={group.groupKey}>
              <div className="settings-nav-group-label">{group.groupLabel}</div>
              {group.sections.map(({ key, label, icon }) => {
                const Icon = icon ? SECTION_ICONS[icon] : null;
                return (
                  <div
                    key={key}
                    className={`settings-nav-item${activeSettingsSection === key ? ' active' : ''}`}
                    onClick={() => onSettingsSectionChange(key)}
                  >
                    {Icon && <Icon size={13} strokeWidth={1.8} color={activeSettingsSection === key ? 'var(--accent)' : 'var(--muted)'} />}
                    {label}
                  </div>
                );
              })}
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

        {/* ── Create object shortcut (header for the unified browse nav) ── */}
        {canCreateNode && (
          <div className="panel-section-header" style={{ flex: '0 0 auto' }}>
            <div style={{ flex: 1 }} />
            <button className="panel-icon-btn" title="Create new object" onClick={() => onCreateNode()}>
              <PlusIcon size={13} color="var(--accent)" strokeWidth={2.5} />
            </button>
          </div>
        )}

        {/* ── MAIN browse zone — central scrollable area ─────────
            Renders only descriptors with panelSection=MAIN. Sources
            are sorted by the max priority of their descriptors
            (descending), so the most important source sits at top. */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <BrowseNav
            userId={userId}
            activeNodeId={activeNodeId}
            stateColorMap={stateColorMap}
            onNavigate={onNavigate}
            onCreateNode={onCreateNode}
            refreshKey={browseRefreshKey}
            panelSection="MAIN"
          />
        </div>

        {/* ── INFO browse zone — compact bottom band for context
              state (alerts, future transaction-as-descriptor, etc).
              Same /browse feed, filtered by panelSection=INFO. */}
        <BrowseNav
          userId={userId}
          activeNodeId={activeNodeId}
          stateColorMap={stateColorMap}
          onNavigate={onNavigate}
          refreshKey={browseRefreshKey}
          panelSection="INFO"
        />

        {/* ── Transaction (PSM-specific for now; may move into a browse
              descriptor's UI metadata in a later pass) ─────────────── */}
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
              const ntInfo    = nodeTypeMap.get(typeId);
              const txColor   = ntInfo?.color || null;
              const TxIcon    = ntInfo?.icon ? NODE_ICONS[ntInfo.icon] : null;
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
                <div key={i} className={`tx-item${isActive ? ' active' : ''}`} onClick={() => onNavigate(nid, logicalId || undefined, psmNodeDescriptor)}>
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

    </aside>
  );
}

export default React.memo(LeftPanel);
