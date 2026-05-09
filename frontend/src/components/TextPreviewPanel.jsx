import React from 'react';

export default function TextPreviewPanel({ data }) {
  const { text, loading } = data || {};
  if (loading) return (
    <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>Loading…</div>
  );
  if (!text) return (
    <div style={{ padding: 14, fontSize: 12, color: 'var(--muted)' }}>No preview available</div>
  );
  return (
    <pre style={{
      margin: 0, padding: 14, fontSize: 11, lineHeight: 1.55,
      fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
      color: 'var(--text)', overflow: 'auto', height: '100%', boxSizing: 'border-box',
    }}>
      {text}
    </pre>
  );
}
