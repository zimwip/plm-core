import React from 'react';

function fmtBytes(b) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function TextPreviewPanel({ data }) {
  const { text, loading, truncated, totalBytes } = data || {};
  if (loading) return (
    <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>Loading…</div>
  );
  if (!text) return (
    <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>No preview available</div>
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <pre style={{
        margin: 0, padding: 14, fontSize: 11, lineHeight: 1.55,
        fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
        color: 'var(--text)', overflow: 'auto', flex: 1, boxSizing: 'border-box',
      }}>
        {text}
      </pre>
      {truncated && (
        <div style={{
          padding: '6px 14px', fontSize: 11, color: 'var(--muted)',
          borderTop: '1px solid var(--border)', background: 'var(--surface)',
          flexShrink: 0,
        }}>
          Preview limited to first 64 KB{totalBytes ? ` — file is ${fmtBytes(totalBytes)}` : ''}.
        </div>
      )}
    </div>
  );
}
