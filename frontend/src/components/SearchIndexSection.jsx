import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

function fmt(n) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? '—'); }

export default function SearchIndexSection({ canWrite, toast }) {
  const [info,       setInfo]       = useState(null);
  const [reindexing, setReindexing] = useState(false);
  const [lastQueued, setLastQueued] = useState(null);

  function loadInfo() {
    api.searchInfo().then(setInfo).catch(() => setInfo({ available: false }));
  }

  useEffect(() => { loadInfo(); }, []);

  async function handleReindex() {
    setReindexing(true);
    try {
      const res = await api.reindexSearch();
      setLastQueued(res.queued);
      toast?.(`Re-index queued: ${res.queued} nodes`);
      setTimeout(loadInfo, 2000);
    } catch {
      toast?.('Re-index failed — check psm-api logs');
    } finally {
      setReindexing(false);
    }
  }

  const available = info?.available !== false;

  return (
    <div>
      <div className="nats-section-title">Index statistics</div>

      <div className="nats-stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="nats-stat">
          <span className="nats-stat-label">Status</span>
          <span className="nats-stat-value" style={{ fontSize: 13, color: available ? 'var(--success)' : 'var(--warn)' }}>
            {info === null ? '…' : available ? 'Online' : 'Unavailable'}
          </span>
        </div>
        <div className="nats-stat">
          <span className="nats-stat-label">Nodes</span>
          <span className="nats-stat-value">{info === null ? '…' : fmt(info.nodeCount)}</span>
        </div>
        <div className="nats-stat">
          <span className="nats-stat-label">Edges</span>
          <span className="nats-stat-value">{info === null ? '…' : fmt(info.edgeCount)}</span>
        </div>
      </div>

      <div className="nats-section-title" style={{ marginTop: 20 }}>Re-index</div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
        Republishes all PSM nodes through the event pipeline so the search index
        picks up any new stored fields (e.g. after updating the extractor).
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleReindex}
          disabled={reindexing || !canWrite}
        >
          {reindexing ? 'Queuing…' : 'Re-index now'}
        </button>
        {lastQueued != null && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            Last run: {lastQueued} nodes queued
          </span>
        )}
      </div>
    </div>
  );
}
