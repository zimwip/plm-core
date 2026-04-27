import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function SignaturePanel({
  nodeId,
  userId,
  filterVersionId,
  onClose,
}) {
  const [signatures, setSignatures] = useState([]);

  const load = useCallback(async () => {
    if (!nodeId) return;
    try {
      const s = await api.getSignatureHistory(userId, nodeId);
      setSignatures(Array.isArray(s) ? s : []);
    } catch {}
  }, [nodeId, userId]);

  useEffect(() => { load(); }, [load]);

  useWebSocket(
    nodeId ? `/topic/nodes/${nodeId}` : null,
    (evt) => {
      if (evt.nodeId && evt.nodeId !== nodeId) return;
      if (evt.event === 'SIGNED') load();
    },
    userId,
  );

  // Filter by version if provided
  const filtered = filterVersionId
    ? signatures.filter(s => (s.node_version_id || s.NODE_VERSION_ID) === filterVersionId)
    : signatures;

  // Group signatures by revision.iteration
  const groups = [];
  const groupMap = {};
  filtered.forEach(s => {
    const rev = s.revision || s.REVISION || '';
    const iter = s.iteration ?? s.ITERATION ?? 0;
    const key = `${rev}.${iter}`;
    if (!groupMap[key]) {
      groupMap[key] = { key, revision: rev, iteration: iter, items: [] };
      groups.push(groupMap[key]);
    }
    groupMap[key].items.push(s);
  });

  return (
    <div className="signature-modal-overlay" onClick={onClose}>
      <div className="signature-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="signature-modal-header">
          <span>
            Signatures
            {filtered.length > 0 && (
              <span className="comment-count-badge">{filtered.length}</span>
            )}
          </span>
          <button className="comment-close-btn" onClick={onClose} title="Close">&#x2715;</button>
        </div>

        {/* Signature list */}
        <div className="signature-modal-body">
          {groups.length === 0 ? (
            <div className="comment-empty">No signatures on this version</div>
          ) : groups.map(g => (
            <div key={g.key} className="sig-group">
              <div className="sig-group-header">
                Rev {g.iteration === 0 ? g.revision : `${g.revision}.${g.iteration}`}
              </div>
              {g.items.map((s, i) => {
                const m = s.meaning || s.MEANING || '';
                const by = s.signed_by || s.SIGNED_BY || s.signedBy || '';
                const cmt = s.comment || s.COMMENT || '';
                const at = s.signed_at || s.SIGNED_AT || s.signedAt || '';
                const dateStr = at ? new Date(at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '';
                return (
                  <div key={i} className="sig-entry">
                    <span className={`sig-meaning-badge ${m === 'Rejected' ? 'sig-rejected' : 'sig-approved'}`}>
                      {m}
                    </span>
                    <span className="sig-by">{by}</span>
                    {cmt && <span className="sig-comment-text">{cmt}</span>}
                    <span className="sig-date">{dateStr}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
