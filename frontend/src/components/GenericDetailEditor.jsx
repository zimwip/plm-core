import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { getItemTypeDescriptor } from '../services/itemTypeCache';

/**
 * Generic editor pane driven entirely by a server-supplied
 * {@code DetailDescriptor}. Source services declare their get endpoint
 * via {@code descriptor.get.path} (with {@code {id}} substituted);
 * the response carries per-instance values + actions, while field labels,
 * widgets, and hints come from the cached {@code ItemTypeDescriptor}.
 *
 * Custom plugins may still ship richer editors (PSM nodes use
 * {@code NodeEditor}); this is the default + showcase implementation
 * adopted by DST and any future user service.
 */

// Client-side validation from the generic validator hints carried by
// staticMetadata.fieldMeta[attrId] — `regex` (string pattern) and
// `allowedValues` (array or comma/JSON list). Returns null when there is no
// hint or no value to check, true if valid, false if it violates a hint.
function safeRegex(src) { try { return new RegExp(`^(?:${src})$`); } catch { return null; } }

function toList(allowed) {
  if (allowed == null) return null;
  if (Array.isArray(allowed)) return allowed.map(String);
  if (typeof allowed === 'string') {
    const s = allowed.trim();
    if (!s) return null;
    if (s.startsWith('[')) { try { return JSON.parse(s).map(String); } catch { /* fall through */ } }
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }
  return null;
}

function validateValue(value, regex, allowedValues) {
  if (value == null || value === '') return null;
  const str = String(value);
  if (regex) {
    const re = safeRegex(regex);
    if (re && !re.test(str)) return false;
  }
  const list = toList(allowedValues);
  if (list && list.length && !list.includes(str)) return false;
  return (regex || (list && list.length)) ? true : null;
}

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
  const [typeDesc, setTypeDesc] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [textPreview,          setTextPreview]          = useState(null);
  const [textPreviewLoading,   setTextPreviewLoading]   = useState(false);
  const [textPreviewTruncated, setTextPreviewTruncated] = useState(false);
  const [textPreviewTotalBytes,setTextPreviewTotalBytes] = useState(null);

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

  // Fetch static type descriptor (cached, only changes on metamodel update)
  useEffect(() => {
    if (!detail?.itemType) return;
    getItemTypeDescriptor(detail.itemType).then(setTypeDesc).catch(() => setTypeDesc(null));
  }, [detail?.itemType?.serviceCode, detail?.itemType?.itemCode, detail?.itemType?.itemKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const url = detail?.metadata?.downloadUrl;
    if (!url) { setTextPreview(null); setTextPreviewTruncated(false); setTextPreviewTotalBytes(null); return; }
    let cancelled = false;
    setTextPreviewLoading(true);
    api.gatewayRawText(url)
      .then(({ text, truncated, totalBytes }) => {
        if (!cancelled) {
          setTextPreview(text);
          setTextPreviewTruncated(truncated);
          setTextPreviewTotalBytes(totalBytes);
          setTextPreviewLoading(false);
        }
      })
      .catch(() => { if (!cancelled) { setTextPreview(null); setTextPreviewLoading(false); } });
    return () => { cancelled = true; };
  }, [detail?.metadata?.downloadUrl]);

  // Push text content to the central preview pane
  useEffect(() => {
    ctx?.onRegisterPreview?.({ text: textPreview, truncated: textPreviewTruncated, totalBytes: textPreviewTotalBytes, loading: textPreviewLoading });
  }, [textPreview, textPreviewLoading, textPreviewTruncated, textPreviewTotalBytes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear preview on unmount / item change
  useEffect(() => () => { ctx?.onRegisterPreview?.(null); }, [tab.nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function invokeAction(a) {
    if (a.confirmRequired && !window.confirm(`${a.label}?\n\n${a.description || ''}`)) return;
    if (a.metadata?.openInNewTab) {
      window.open(svcBase + a.path.replace('{id}', encodeURIComponent(tab.nodeId)), '_blank', 'noreferrer');
      return;
    }
    // Presigned download: fetch a short-lived URL, then trigger a browser
    // download straight from object storage (Garage sends Content-Disposition
    // attachment, so the anchor click saves the file instead of navigating).
    if (a.metadata?.presignedDownload) {
      setBusyAction(a.code);
      try {
        const path = svcBase + a.path.replace('{id}', encodeURIComponent(tab.nodeId));
        const res = await api.gatewayJson('GET', path);
        if (res?.url) {
          const link = document.createElement('a');
          link.href = res.url;
          link.rel = 'noreferrer';
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else if (toast) {
          toast('No download URL returned', 'error');
        }
      } catch (e) {
        if (toast) toast(e, 'error');
      } finally {
        setBusyAction(null);
      }
      return;
    }
    setBusyAction(a.code);
    try {
      const path = svcBase + a.path.replace('{id}', encodeURIComponent(tab.nodeId));
      await api.gatewayJson(a.httpMethod, path, a.parameters?.length ? {} : undefined);
      if (toast) toast(`${a.label} done`, 'success');
      loadDetail();
    } catch (e) {
      if (toast) toast(e, 'error');
    } finally {
      setBusyAction(null);
    }
  }

  // Merge type-level metadata (label, widget, hint) with instance values.
  const fieldMetaByName = useMemo(() => {
    const m = {};
    for (const fm of typeDesc?.fields ?? []) m[fm.name] = fm;
    return m;
  }, [typeDesc]);

  const mergedFields = useMemo(() => {
    const rawFields = detail?.values ?? [];
    return rawFields.map(fv => {
      const fm = fieldMetaByName[fv.name] || {};
      const extras = fv.extras || {};
      return {
        name:          fv.name,
        value:         fv.value,
        editable:      extras.editable ?? true,
        required:      extras.required ?? false,
        label:         fm.label  ?? fv.name,
        widget:        fm.widget ?? 'text',
        hint:          fm.hint   ?? null,
        // Generic validator hints — only present when a validator is attached.
        regex:         fm.regex ?? null,
        allowedValues: fm.allowedValues ?? null,
        validity:      validateValue(fv.value, fm.regex, fm.allowedValues),
      };
    });
  }, [detail, fieldMetaByName]);

  // Derive display header from type descriptor's titleField/subtitleField
  const displayTitle = useMemo(() => {
    if (typeDesc?.titleField) {
      const f = mergedFields.find(f => f.name === typeDesc.titleField);
      if (f?.value) return String(f.value);
    }
    return detail?.id;
  }, [typeDesc, mergedFields, detail]);

  const displaySubtitle = useMemo(() => {
    if (typeDesc?.subtitleField) {
      const f = mergedFields.find(f => f.name === typeDesc.subtitleField);
      if (f?.value) return String(f.value);
    }
    return null;
  }, [typeDesc, mergedFields, detail]);

  const displayColor = typeDesc?.color ?? detail?.color;

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
        {displayColor && (
          <span style={{ width: 10, height: 10, borderRadius: 2, background: displayColor, flexShrink: 0 }} />
        )}
        <h2 style={{ margin: 0, fontSize: 18 }}>{displayTitle}</h2>
        <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{detail.id}</span>
      </div>
      {displaySubtitle && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 16 }}>
          {displaySubtitle}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────────────── */}
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

      {/* ── Fields ─────────────────────────────────────────────────────────────── */}
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 24 }}>
        <tbody>
          {mergedFields.map(f => (
            <tr key={f.name} style={{ borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '6px 8px', color: 'var(--muted)', width: 180, verticalAlign: 'top' }}>
                {f.label}
                {f.hint && (
                  <div style={{ fontSize: 10, color: 'var(--muted2)' }}>{f.hint}</div>
                )}
              </td>
              <td style={{ padding: '6px 8px' }}>
                {fmtValue(f)}
                {f.validity === false && (
                  <span
                    title={f.regex ? `Does not match pattern: ${f.regex}` : 'Not an allowed value'}
                    style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger, #f87171)' }}
                  >
                    ✗ invalid
                  </span>
                )}
              </td>
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
            alt={displayTitle}
            style={{ maxWidth: '100%', maxHeight: 480, border: '1px solid var(--border)', borderRadius: 4 }}
          />
        </div>
      )}
    </div>
  );
}
