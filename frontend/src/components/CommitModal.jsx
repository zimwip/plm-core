import React, { useState } from 'react';
import { txApi } from '../services/api';

const COMMIT_CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

export default function CommitModal({ userId, txId, txNodes, stateColorMap, onCommitted, onClose, toast }) {
  const [comment,  setComment]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const allIds = (txNodes || []).map(n => n.node_id || n.NODE_ID);
  const [selectedIds, setSelectedIds] = useState(() => new Set(allIds));

  function toggleNode(nid) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(nid) ? next.delete(nid) : next.add(nid);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(selectedIds.size === allIds.length ? new Set() : new Set(allIds));
  }

  async function submit() {
    if (!comment.trim()) { toast('Commit comment is required', 'warn'); return; }
    if (selectedIds.size === 0) { toast('Select at least one object to commit', 'warn'); return; }
    setLoading(true);
    try {
      const nodeIds = selectedIds.size === allIds.length ? null : [...selectedIds];
      const res = await txApi.commit(userId, txId, comment, nodeIds);
      const contId       = res?.continuationTxId || null;
      const deferredCount = allIds.length - selectedIds.size;
      toast('Transaction committed', 'success');
      onCommitted(contId, deferredCount);
      onClose();
    } catch (e) { toast(e, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="commit-title">
      <div className="card commit-modal">
        <div className="card-hd">
          <span className="card-title" id="commit-title">Commit transaction</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="commit-comment">
              Commit comment <span className="field-req" aria-label="required">*</span>
            </label>
            <input
              id="commit-comment"
              className="field-input"
              placeholder="Describe what you changed…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              autoFocus
            />
          </div>

          {txNodes?.length > 0 && (
            <div className="commit-node-list">
              <div className="commit-node-list-hd">
                <label className="commit-node-all">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === allIds.length}
                    onChange={toggleAll}
                  />
                  <span>Objects to commit</span>
                  <span className="commit-node-count">{selectedIds.size}/{allIds.length}</span>
                </label>
              </div>
              <div className="commit-node-list-scroll">
                {txNodes.map(n => {
                  const nid   = n.node_id || n.NODE_ID;
                  const lid   = n.logical_id || n.LOGICAL_ID || nid;
                  const type  = n.node_type_name || n.NODE_TYPE_NAME || '';
                  const rev   = n.revision  || n.REVISION  || 'A';
                  const iter  = n.iteration ?? n.ITERATION ?? 1;
                  const ct    = (n.change_type || n.CHANGE_TYPE || 'CONTENT').toUpperCase();
                  const state = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
                  const badge = COMMIT_CHANGE_BADGE[ct] || COMMIT_CHANGE_BADGE.CONTENT;
                  return (
                    <label key={nid} className="commit-node-item">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(nid)}
                        onChange={() => toggleNode(nid)}
                      />
                      <span className="commit-node-dot"
                        style={{ background: stateColorMap?.[state] || '#6b7280' }} />
                      <span className="commit-node-lid">{lid}</span>
                      <span className="commit-node-rev">{iter === 0 ? rev : `${rev}.${iter}`}</span>
                      <span className="commit-node-type">{type}</span>
                      <span className="commit-node-badge"
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Committed objects become visible to everyone. Uncommitted objects stay in a new transaction.
          </p>
          <div className="row flex-end" style={{ gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={submit}
              disabled={loading || !comment.trim() || selectedIds.size === 0}>
              {loading ? 'Committing…' : '✓ Commit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
