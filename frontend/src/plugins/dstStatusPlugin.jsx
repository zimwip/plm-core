import React, { useState, useEffect } from 'react';
import { dstApi } from '../services/api';

function fmtBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function DstStatusTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setStats(await dstApi.getStats());
      setError(null);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !stats) return (
    <div style={{ padding: 20, color: 'var(--muted)', fontSize: 12 }}>Loading…</div>
  );
  if (error) return (
    <div style={{ padding: 20, color: 'var(--error)', fontSize: 12 }}>{error}</div>
  );
  if (!stats) return null;

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto' }}>

      {/* Summary cards */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        {[
          { v: stats.totalFiles.toLocaleString(), l: 'Files' },
          { v: fmtBytes(stats.totalSizeBytes),    l: 'Total Size' },
          { v: stats.maxFileSize,                 l: 'Max Upload' },
        ].map(({ v, l }) => (
          <div key={l} style={{
            background: 'var(--surface2)', borderRadius: 6, padding: '8px 14px', flex: 1,
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Storage root */}
      <div style={{ marginBottom: 14, fontSize: 11, color: 'var(--muted2)' }}>
        Root: <code style={{ color: 'var(--text2)', fontSize: 11 }}>{stats.storageRoot}</code>
      </div>

      {/* Per project space */}
      {stats.perProjectSpace?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>By Project Space</div>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Project Space</th>
                <th style={{ textAlign: 'right' }}>Files</th>
                <th style={{ textAlign: 'right' }}>Size</th>
              </tr>
            </thead>
            <tbody>
              {stats.perProjectSpace.map(ps => (
                <tr key={ps.projectSpaceId}>
                  <td><code style={{ fontSize: 11 }}>{ps.projectSpaceId || '—'}</code></td>
                  <td style={{ textAlign: 'right' }}>{ps.fileCount.toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>{fmtBytes(ps.totalSizeBytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per content type */}
      {stats.perContentType?.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>By Content Type</div>
          <table className="settings-table">
            <thead>
              <tr>
                <th>Content Type</th>
                <th style={{ textAlign: 'right' }}>Files</th>
              </tr>
            </thead>
            <tbody>
              {stats.perContentType.map(ct => (
                <tr key={ct.contentType || 'unknown'}>
                  <td><code style={{ fontSize: 11 }}>{ct.contentType || '—'}</code></td>
                  <td style={{ textAlign: 'right' }}>{ct.fileCount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ textAlign: 'right' }}>
        <button className="btn btn-xs" onClick={load} disabled={loading}>Refresh</button>
      </div>
    </div>
  );
}

export const dstStatusPlugin = {
  key:       'dst',
  label:     'Storage',
  Component: DstStatusTab,
};
