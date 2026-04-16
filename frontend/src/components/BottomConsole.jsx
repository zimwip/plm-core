import React from 'react';
import { CommitIcon, RollbackIcon, ChevronDownIcon, ChevronRightIcon } from './Icons';

const STATE_COLORS = {
  'st-draft':    '#5b9cf6',
  'st-inreview': '#e8a947',
  'st-released': '#56d18e',
  'st-frozen':   '#a78bfa',
  'st-obsolete': '#6b7280',
};

const CHANGE_COLORS = {
  CONTENT:   'var(--accent)',
  LIFECYCLE: 'var(--success)',
  SIGNATURE: 'var(--warn)',
};

export default function BottomConsole({
  tx,
  txVersions,
  onCommit,
  onRollback,
  onNavigate,
  activeNodeId,
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const txId = tx?.ID || tx?.id;

  return (
    <div className={`bottom-console ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Console header ── */}
      <div className="console-hd" onClick={() => setCollapsed(c => !c)}>
        <span className="console-toggle">
          {collapsed
            ? <ChevronRightIcon size={12} strokeWidth={2.5} color="var(--muted)" />
            : <ChevronDownIcon  size={12} strokeWidth={2.5} color="var(--muted)" />
          }
        </span>
        <span className="console-label">Transaction</span>
        {txId && (
          <span className="console-tx-id">{txId.slice(0, 8)}…</span>
        )}
        {txId && !collapsed && (
          <div className="console-tx-actions" onClick={e => e.stopPropagation()}>
            <button className="btn btn-success btn-sm" onClick={onCommit}>
              <CommitIcon size={12} strokeWidth={2} />
              Commit
            </button>
            <button className="btn btn-danger btn-sm" onClick={onRollback}>
              <RollbackIcon size={12} strokeWidth={2} />
              Rollback
            </button>
          </div>
        )}
        {!txId && (
          <span className="console-idle-label">No active transaction</span>
        )}
      </div>

      {/* ── Console body ── */}
      {!collapsed && (
        <div className="console-body">
          {!txId ? (
            <div className="console-empty">
              Checkout an object to begin — a transaction will open automatically
            </div>
          ) : txVersions.length === 0 ? (
            <div className="console-empty">
              Transaction open · no objects checked out yet
            </div>
          ) : (
            <div className="console-items">
              {txVersions.map((v, i) => {
                const nid     = v.node_id        || v.NODE_ID;
                const rev     = v.revision       || v.REVISION    || 'A';
                const iter    = v.iteration      ?? v.ITERATION   ?? 1;
                const ct      = v.change_type    || v.CHANGE_TYPE || '';
                const state   = v.lifecycle_state_id || v.LIFECYCLE_STATE_ID || '';
                const typeName = v.node_type_name || v.NODE_TYPE_NAME || '';
                const isActive = nid === activeNodeId;
                const ctColor = CHANGE_COLORS[ct] || 'var(--muted)';
                const stColor = STATE_COLORS[state] || '#6b7280';
                return (
                  <div
                    key={i}
                    className={`cvi ${isActive ? 'active' : ''}`}
                    onClick={() => onNavigate(nid)}
                  >
                    <span className="cvi-dot" style={{ background: stColor }} />
                    <span className="cvi-rev">{iter === 0 ? rev : `${rev}.${iter}`}</span>
                    <span className="cvi-type">{typeName}</span>
                    <span className="cvi-ct" style={{ color: ctColor }}>{ct}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
