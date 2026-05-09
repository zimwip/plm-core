import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

/**
 * Generic editor pane driven entirely by a server-supplied
 * {@code DetailDescriptor}. Source services declare their get endpoint
 * via {@code descriptor.get.path} (with {@code {id}} substituted);
 * the response carries title + subtitle + ordered fields + actions, and
 * this component renders all of it without source-specific code.
 *
 * <p>Custom plugins may still ship richer editors (PSM nodes use
 * {@code NodeEditor}); this is the default + showcase implementation
 * adopted by DST and any future user service.
 */

function fmtValue(field) {
  const v = field.value;
  if (v == null || v === '') return <span style={{ color: 'var(--muted2)' }}>—</span>;
  switch (field.widget) {
    case 'datetime': {
      try {
        const d = new Date(v);
        if (!isNaN(d.getTime())) return d.toLocaleString();
      } catch {}
      return String(v);
    }
    case 'code':
      return <code style={{ fontSize: 10, wordBreak: 'break-all' }}>{String(v)}</code>;
    case 'number':
      return <span style={{ fontFamily: 'var(--mono)' }}>{Number(v).toLocaleString()}</span>;
    case 'link':
      return <a href={String(v)} target="_blank" rel="noreferrer">{String(v)}</a>;
    case 'badge':
      return <span className="settings-badge">{String(v)}</span>;
    case 'image':
      return <img src={String(v)} alt={field.label} style={{ maxWidth: '100%', maxHeight: 240 }} />;
    case 'multiline':
      return <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{String(v)}</pre>;
    default:
      return String(v);
  }
}

export default function GenericDetailEditor({ tab, ctx, descriptorOverride }) {
  const { userId, toast } = ctx || {};
  const resolvedDescriptor = descriptorOverride || tab.get || {};
  const detailPathTpl = resolvedDescriptor.path;
  const httpMethod = (resolvedDescriptor.httpMethod || 'GET').toUpperCase();
  const serviceCode = descriptorOverride?.serviceCode || tab.serviceCode;
  const svcBase = serviceCode ? `/api/${serviceCode}` : '';

  const [detail, setDetail] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [textPreview, setTextPreview] = useState(null);
  const [textPreviewLoading, setTextPreviewLoading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!detailPathTpl || !tab.nodeId) {
      setError('No get action declared for this source');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const path = svcBase + detailPathTpl.replace('{id}', encodeURIComponent(tab.nodeId));
      const res = await api.gatewayJson(httpMethod, path);
      setDetail(res);
    } catch (e) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [detailPathTpl, httpMethod, tab.nodeId, svcBase]);

  useEffect(() => { loadDetail(); }, [loadDetail]);

  useEffect(() => {
    const url = detail?.metadata?.downloadUrl;
    if (!url) { setTextPreview(null); return; }
    let cancelled = false;
    setTextPreviewLoading(true);
    api.gatewayRawText(url)
      .then(text => { if (!cancelled) { setTextPreview(text); setTextPreviewLoading(false); } })
      .catch(() => { if (!cancelled) { setTextPreview(null); setTextPreviewLoading(false); } });
    return () => { cancelled = true; };
  }, [detail?.metadata?.downloadUrl]);

  // Push text content to the central preview pane
  useEffect(() => {
    ctx?.onRegisterPreview?.({ text: textPreview, loading: textPreviewLoading });
  }, [textPreview, textPreviewLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear preview on unmount / item change
  useEffect(() => () => { ctx?.onRegisterPreview?.(null); }, [tab.nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function invokeAction(a) {
    if (a.confirmRequired && !window.confirm(`${a.label}?\n\n${a.description || ''}`)) return;
    if (a.metadata?.openInNewTab) {
      window.open(svcBase + a.path.replace('{id}', encodeURIComponent(tab.nodeId)), '_blank', 'noreferrer');
      return;
    }
    setBusyAction(a.code);
    try {
      const path = svcBase + a.path.replace('{id}', encodeURIComponent(tab.nodeId));
      await api.gatewayJson(a.httpMethod, path, a.parameters?.length ? {} : undefined);
      if (toast) toast(`${a.label} done`, 'success');
      // Refresh detail; navigation/dismissal is the caller's concern via WS.
      loadDetail();
    } catch (e) {
      if (toast) toast(e, 'error');
    } finally {
      setBusyAction(null);
    }
  }

  if (loading) return <div className="settings-loading">Loading…</div>;
  if (error) {
    return (
      <div className="editor-empty">
        <div className="editor-empty-icon">⚠</div>
        <div className="editor-empty-text">Failed to load</div>
        <div className="editor-empty-hint">{error}</div>
      </div>
    );
  }
  if (!detail) return null;

  return (
    <div style={{ padding: 24, overflow: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
        {detail.color && (
          <span style={{ width: 10, height: 10, borderRadius: 2, background: detail.color, flexShrink: 0 }} />
        )}
        <h2 style={{ margin: 0, fontSize: 18 }}>{detail.title || detail.id}</h2>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{detail.id}</span>
      </div>
      {detail.subtitle && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
          {detail.subtitle}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────── */}
      {detail.actions && detail.actions.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {detail.actions.map(a => (
            <button
              key={a.code}
              className={`btn btn-sm ${a.dangerous ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => invokeAction(a)}
              disabled={busyAction === a.code}
              title={a.description || a.label}
            >
              {busyAction === a.code ? '…' : a.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Fields ─────────────────────────────────────────────── */}
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 24 }}>
        <tbody>
          {detail.fields.map(f => (
            <tr key={f.name} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px', color: 'var(--muted)', width: 180, verticalAlign: 'top' }}>
                {f.label}
                {f.hint && (
                  <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{f.hint}</div>
                )}
              </td>
              <td style={{ padding: '6px 8px' }}>{fmtValue(f)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Image preview (metadata.isImage) ── */}
      {detail.metadata?.isImage && detail.metadata?.downloadUrl && (
        <div>
          <div className="settings-sub-label" style={{ marginBottom: 8 }}>Preview</div>
          <img
            src={detail.metadata.downloadUrl}
            alt={detail.title}
            style={{ maxWidth: '100%', maxHeight: 480, border: '1px solid var(--border)', borderRadius: 4 }}
          />
        </div>
      )}
    </div>
  );
}
