import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { NODE_ICONS } from './Icons';
import { psmNodeDescriptor } from '../plugins/psmDescriptor';

const CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

// Color by displayCategory (enum from action table: PRIMARY / SECONDARY / DANGEROUS).
// Fallback handles any new category added to the DB without code changes.
const CATEGORY_COLOR = {
  PRIMARY:   'var(--accent)',
  SECONDARY: 'var(--muted)',
  DANGEROUS: 'var(--danger)',
};

function RevTag({ revision, iteration }) {
  const label = iteration === 0 ? revision : `${revision}.${iteration}`;
  return <span className="dash-rev">{label}</span>;
}

function StateDot({ lifecycleStateId, stateColorMap }) {
  const color = stateColorMap?.[lifecycleStateId] || '#6b7280';
  return <span className="dash-state-dot" style={{ background: color }} title={lifecycleStateId} />;
}

function NodeTypeChip({ nodeTypeId, nodeTypeName, nodeTypes }) {
  const nt = (nodeTypes || []).find(t => (t.id || t.ID) === nodeTypeId);
  const color = nt?.color || nt?.COLOR || null;
  const icon  = nt?.icon  || nt?.ICON  || null;
  const Icon  = icon ? NODE_ICONS[icon] : null;
  return (
    <span className="dash-type-chip">
      {Icon
        ? <Icon size={9} color={color || 'var(--muted2)'} strokeWidth={2} />
        : color
          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: color, display: 'inline-block', flexShrink: 0 }} />
          : null
      }
      <span style={{ color: 'var(--muted2)' }}>{nodeTypeName || nodeTypeId}</span>
    </span>
  );
}

// ── Section: Open Transaction ────────────────────────────────────────
function TxSection({ userId, stateColorMap, nodeTypes, onNavigate }) {
  const [data,    setData]    = useState(undefined); // undefined=loading, null=none
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardTransaction(userId);
      setData(res || null);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="dash-section">
      <div className="dash-section-hd">
        <span className="dash-section-title">Open transaction</span>
        <button className="dash-refresh-btn" onClick={load} title="Refresh" disabled={loading}>
          <span style={{ display: 'inline-block', transform: loading ? 'none' : 'none' }}>⟳</span>
        </button>
      </div>

      {loading && <div className="dash-loading">Loading…</div>}
      {error   && <div className="dash-error">{error}</div>}

      {!loading && !error && !data && (
        <div className="dash-empty">No open transaction</div>
      )}

      {!loading && !error && data && (
        <div className="dash-tx-card">
          <div className="dash-tx-header">
            <span className="dash-tx-id">{data.txId?.slice(0, 8)}…</span>
            <span className="dash-tx-title">{data.title}</span>
            <span className="dash-tx-count">{data.nodes?.length || 0} object{data.nodes?.length !== 1 ? 's' : ''}</span>
          </div>
          {data.nodes?.length > 0 && (
            <div className="dash-tx-nodes">
              {data.nodes.map(n => {
                const badge = CHANGE_BADGE[(n.changeType || 'CONTENT').toUpperCase()] || CHANGE_BADGE.CONTENT;
                return (
                  <button
                    key={n.nodeId}
                    className="dash-tx-node"
                    onClick={() => onNavigate(n.nodeId, n.logicalId || n.nodeId, psmNodeDescriptor)}
                  >
                    <StateDot lifecycleStateId={n.lifecycleStateId} stateColorMap={stateColorMap} />
                    <span className="dash-node-lid">{n.logicalId || n.nodeId}</span>
                    <RevTag revision={n.revision} iteration={n.iteration} />
                    <NodeTypeChip nodeTypeId={n.nodeTypeId} nodeTypeName={n.nodeTypeName} nodeTypes={nodeTypes} />
                    <span className="dash-badge" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Section: Work Items ──────────────────────────────────────────────
function WorkItemsSection({ userId, stateColorMap, nodeTypes, onNavigate }) {
  const [items,   setItems]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardWorkItems(userId);
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  return (
    <section className="dash-section">
      <div className="dash-section-hd">
        <span className="dash-section-title">Objects you can work on</span>
        <span className="dash-section-hint">last 10 · sorted by available actions</span>
        <button className="dash-refresh-btn" onClick={load} title="Refresh" disabled={loading}>⟳</button>
      </div>

      {loading && <div className="dash-loading">Loading…</div>}
      {error   && <div className="dash-error">{error}</div>}

      {!loading && !error && items?.length === 0 && (
        <div className="dash-empty">No actionable objects found</div>
      )}

      {!loading && !error && items?.length > 0 && (
        <div className="dash-work-list">
          {items.map(item => (
            <button
              key={item.nodeId}
              className="dash-work-item"
              onClick={() => onNavigate(item.nodeId, item.logicalId || item.nodeId, psmNodeDescriptor)}
            >
              <div className="dash-work-row">
                <StateDot lifecycleStateId={item.lifecycleStateId} stateColorMap={stateColorMap} />
                <span className="dash-node-lid">{item.logicalId || item.nodeId}</span>
                <RevTag revision={item.revision} iteration={item.iteration} />
                <NodeTypeChip nodeTypeId={item.nodeTypeId} nodeTypeName={item.nodeTypeName} nodeTypes={nodeTypes} />
              </div>
              <div className="dash-action-chips">
                {item.actions.map(a => {
                  const blocked = a.guardViolations?.length > 0;
                  const tip = blocked
                    ? 'Blocked: ' + a.guardViolations.map(v => v.message || v.code).join('; ')
                    : (a.description || a.label);
                  return (
                    <span
                      key={a.code}
                      className="dash-action-chip"
                      title={tip}
                      style={{
                        color: CATEGORY_COLOR[a.metadata?.displayCategory] || 'var(--muted)',
                        opacity: blocked ? 0.45 : 1,
                      }}
                    >
                      {a.label}
                    </span>
                  );
                })}
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Dashboard root ───────────────────────────────────────────────────
export default function DashboardView({ userId, stateColorMap, nodeTypes, onNavigate }) {
  return (
    <div className="dashboard">
      <div className="dash-hero">
        <span className="dash-hero-icon">⬡</span>
        <div>
          <div className="dash-hero-title">Dashboard</div>
          <div className="dash-hero-sub">Quick overview of your work session</div>
        </div>
      </div>

      <div className="dash-body">
        <TxSection
          userId={userId}
          stateColorMap={stateColorMap}
          nodeTypes={nodeTypes}
          onNavigate={onNavigate}
        />
        <WorkItemsSection
          userId={userId}
          stateColorMap={stateColorMap}
          nodeTypes={nodeTypes}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
