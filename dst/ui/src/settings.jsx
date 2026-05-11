import { useState, useEffect } from 'react';
import { initDstApi, dstApi } from './dstApi';

let _shellAPI = null;

function fmtStorageBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function StorageStatsSection({ toast }) {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setStats(await dstApi.getStats());
    } catch (e) {
      toast(e?.message || String(e), 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !stats) return <div style={{ padding: 24, color: 'var(--muted)', fontSize: 12 }}>Loading…</div>;
  if (!stats) return null;

  return (
    <div className="settings-section">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Storage Statistics</h2>
        <button className="btn btn-xs" onClick={refresh} disabled={loading}>Refresh</button>
      </div>

      {/* Summary row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { v: stats.totalFiles.toLocaleString(), l: 'Total Files' },
          { v: fmtStorageBytes(stats.totalSizeBytes), l: 'Total Size' },
          { v: stats.maxFileSize, l: 'Max Upload' },
        ].map(({ v, l }) => (
          <div key={l} style={{
            background: 'var(--surface2)', borderRadius: 8, padding: '12px 18px', flex: 1,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{v}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Storage root */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Storage Root</div>
        <code style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--surface2)', padding: '4px 8px', borderRadius: 4 }}>
          {stats.storageRoot}
        </code>
      </div>

      {/* Per project space */}
      {stats.perProjectSpace?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>By Project Space</div>
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
                  <td style={{ textAlign: 'right' }}>{fmtStorageBytes(ps.totalSizeBytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Per content type */}
      {stats.perContentType?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>By Content Type</div>
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
    </div>
  );
}

export default {
  id: 'dst-settings',
  zone: 'settings',
  init(shellAPI) {
    _shellAPI = shellAPI;
    initDstApi(shellAPI);
  },
  sections: {
    'dst-stats': StorageStatsSection,
  },
};
