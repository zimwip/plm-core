import React, { useMemo, useState, useEffect, useRef } from 'react';
import { api, pollJobStatus, uploadWithProgress, getSessionToken, getProjectSpaceId } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { descriptorKey, descriptorMatchesRef } from '../shell/navTypes';
import { CloseIcon, LayersIcon } from './Icons';
import NavSection from './NavSection';

/**
 * Search-first navigation panel. Shows one section per descriptor
 * (MAIN panel section only). Each section contains the deduped union
 * of items that are either open in a tab or pinned in the basket.
 *
 * No server-side list fetch — items enter only through open/pin actions.
 */
export default function NavPanel({
  openItems = [],        // NavItemRef[] from App.jsx tabs
  openItemDataMap = {},  // { [nodeId]: detailToItem(tabData) }
  activeNodeId,
  stateColorMap,
  onNavigate,
  onCreateNode,
  toast,
}) {
  const storeItems  = usePlmStore(s => s.items);
  const itemsStatus = usePlmStore(s => s.itemsStatus);
  const basketItems = usePlmStore(s => s.basketItems);
  const storeUserId = usePlmStore(s => s.userId);

  // Import modal state (mirrors BrowseNav for MAIN descriptors).
  const [importModal,       setImportModal]       = useState(null);
  const [importFile,        setImportFile]        = useState(null);
  const [importParamValues, setImportParamValues] = useState({});
  const [importing,         setImporting]         = useState(false);
  const [uploadProgress,    setUploadProgress]    = useState(null);
  const [activeJob,         setActiveJob]         = useState(null);
  const cadJobPollRef = useRef(null);

  useEffect(() => () => { if (cadJobPollRef.current) clearInterval(cadJobPollRef.current); }, []);

  const ctx = useMemo(() => ({
    userId: storeUserId, activeNodeId, stateColorMap, onNavigate,
  }), [storeUserId, activeNodeId, stateColorMap, onNavigate]);

  // Descriptors to show: MAIN section, must have create|import|list.
  const descriptors = useMemo(() => {
    return storeItems.filter(d => {
      const section = (d.panelSection || 'MAIN').toUpperCase();
      return section === 'MAIN' && (d.list || d.create || d.importActions?.length > 0);
    });
  }, [storeItems]);

  // Group by sourceCode → sorted sources (mirrors BrowseNav grouping).
  const groupedSources = useMemo(() => {
    const bySource = new Map();
    for (const d of descriptors) {
      const code = d.serviceCode || '_unknown';
      if (!bySource.has(code)) bySource.set(code, []);
      bySource.get(code).push(d);
    }
    const sources = [];
    for (const [code, ds] of bySource.entries()) {
      ds.sort((a, b) => (b.priority ?? 100) - (a.priority ?? 100));
      const maxP  = ds.reduce((m, d) => Math.max(m, d.priority ?? 100), 0);
      const label = ds[0].sourceLabel || code;
      sources.push({ serviceCode: code, label, maxPriority: maxP, descriptors: ds });
    }
    sources.sort((a, b) => b.maxPriority - a.maxPriority);
    return sources;
  }, [descriptors]);

  // Build lookup: descriptorKey → { openIds: string[], pinnedIds: string[] }
  const itemsByDescriptor = useMemo(() => {
    const map = {}; // descriptorKey → { openIds: Set, pinnedIds: Set }

    // Index open items.
    for (const ref of openItems) {
      const desc = descriptors.find(d => descriptorMatchesRef(d, ref));
      if (!desc) continue;
      const k = descriptorKey(desc);
      if (!map[k]) map[k] = { openIds: [], pinnedIds: [] };
      if (!map[k].openIds.includes(ref.key)) map[k].openIds.push(ref.key);
    }

    // Index pinned items from basket.
    for (const [basketKey, ids] of Object.entries(basketItems)) {
      const colonIdx = basketKey.indexOf(':');
      const source   = colonIdx > -1 ? basketKey.slice(0, colonIdx) : basketKey;
      const typeCode = colonIdx > -1 ? basketKey.slice(colonIdx + 1) : '';
      const desc     = descriptors.find(d =>
        d.serviceCode === source && (d.itemCode === typeCode || d.itemKey === typeCode),
      );
      if (!desc) continue;
      const k = descriptorKey(desc);
      if (!map[k]) map[k] = { openIds: [], pinnedIds: [] };
      for (const id of ids) {
        if (!map[k].pinnedIds.includes(id)) map[k].pinnedIds.push(id);
      }
    }

    return map;
  }, [openItems, basketItems, descriptors]);

  async function submitImport() {
    if (!importModal || !importFile) return;
    const { descriptor, action } = importModal;
    const url = `/api/${descriptor.serviceCode}${action.path}`;
    const fd  = new FormData();
    fd.append('file', importFile);
    (action.parameters || []).forEach(p => {
      const val = importParamValues[p.name];
      if (val != null && val !== '') fd.append(p.name, val);
    });
    const headers = {};
    const token = getSessionToken();
    const ps    = getProjectSpaceId();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (ps)    headers['X-PLM-ProjectSpace'] = ps;
    setImporting(true);
    setUploadProgress(0);
    try {
      const res = await uploadWithProgress(url, 'POST', headers, fd, pct => setUploadProgress(pct));
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || `HTTP ${res.status}`);
      }
      const result = await res.json().catch(() => null);
      setImportModal(null);
      setUploadProgress(null);
      if (result?.jobId && action.jobStatusPath) {
        const statusUrl = action.jobStatusPath.replace('{jobId}', result.jobId);
        setActiveJob({ id: result.jobId, data: { job: { id: result.jobId, status: result.status || 'PENDING' }, results: [] } });
        if (cadJobPollRef.current) clearInterval(cadJobPollRef.current);
        cadJobPollRef.current = setInterval(async () => {
          try {
            const data = await pollJobStatus(descriptor.serviceCode, statusUrl);
            setActiveJob(prev => prev ? { ...prev, data } : null);
            if (data.job?.status === 'DONE' || data.job?.status === 'FAILED') {
              clearInterval(cadJobPollRef.current);
              cadJobPollRef.current = null;
            }
          } catch (_) {}
        }, 2000);
      } else {
        toast?.(`${importFile.name} imported`, 'success');
      }
    } catch (e) {
      setImportModal(null);
      setUploadProgress(null);
      toast?.(e, 'error');
    } finally {
      setImporting(false);
    }
  }

  if (itemsStatus !== 'loaded') {
    return <div className="panel-empty">Loading…</div>;
  }

  return (
    <>
      {/* ── Import file modal ─────────────────────────────────── */}
      {importModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget && !importing) setImportModal(null); }}
        >
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', width: 360, maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{importModal.action.name}</span>
              <button className="panel-icon-btn" onClick={() => !importing && setImportModal(null)} disabled={importing}>
                <CloseIcon size={14} />
              </button>
            </div>
            {importModal.action.description && (
              <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, marginTop: 0 }}>
                {importModal.action.description}
              </p>
            )}
            {uploadProgress !== null && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  <span>Uploading…</span><span>{uploadProgress}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--accent)', borderRadius: 3, transition: 'width 0.15s ease' }} />
                </div>
              </div>
            )}
            <input
              type="file"
              accept={importModal.action.acceptedTypes || undefined}
              disabled={importing}
              onChange={e => setImportFile(e.target.files?.[0] ?? null)}
              style={{ width: '100%', marginBottom: 14, fontSize: 12 }}
            />
            {importFile && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>
                {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            {(importModal.action.parameters || []).map(p => (
              <div key={p.name} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>
                  {p.label}{p.required ? ' *' : ''}
                </label>
                {p.widgetType === 'DROPDOWN' && p.allowedValues ? (
                  <select
                    disabled={importing}
                    value={importParamValues[p.name] ?? (p.defaultValue || '')}
                    onChange={e => setImportParamValues(v => ({ ...v, [p.name]: e.target.value }))}
                    style={{ width: '100%', fontSize: 12, padding: '4px 6px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)' }}
                  >
                    {JSON.parse(p.allowedValues).map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={importing}
                    value={importParamValues[p.name] ?? (p.defaultValue || '')}
                    onChange={e => setImportParamValues(v => ({ ...v, [p.name]: e.target.value }))}
                    style={{ width: '100%', fontSize: 12, padding: '4px 6px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                )}
                {p.tooltip && <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{p.tooltip}</div>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => !importing && setImportModal(null)} disabled={importing}>Cancel</button>
              <button className="btn btn-primary" onClick={submitImport} disabled={!importFile || importing}>
                {importing ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import job status modal ───────────────────────────── */}
      {activeJob && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 901, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setActiveJob(null); }}
        >
          <div
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', width: 480, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <ImportJobStatus jobData={activeJob.data} onClose={() => setActiveJob(null)} />
          </div>
        </div>
      )}

      {/* ── Sections ─────────────────────────────────────────── */}
      {groupedSources.map(({ serviceCode, label, descriptors: ds }) => (
        <div key={serviceCode} className="panel-section" style={{ flex: '0 0 auto', minHeight: 0 }}>
          <div className="panel-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayersIcon size={12} color="var(--muted)" strokeWidth={2} />
              <span className="panel-label">{label}</span>
            </div>
          </div>
          <div className="node-list">
            {ds.map(d => {
              const k = descriptorKey(d);
              const { openIds = [], pinnedIds = [] } = itemsByDescriptor[k] || {};
              return (
                <NavSection
                  key={k}
                  descriptor={d}
                  openItemIds={openIds}
                  pinnedItemIds={pinnedIds}
                  openItemDataMap={openItemDataMap}
                  ctx={ctx}
                  onCreateNode={onCreateNode}
                  onOpenImport={(desc, action) => {
                    setImportFile(null);
                    setImportParamValues({});
                    setImportModal({ descriptor: desc, action });
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

// ── Import job status display ─────────────────────────────────────────────
function ImportJobStatus({ jobData, onClose }) {
  const { job, results = [] } = jobData;
  const done = job.status === 'DONE' || job.status === 'FAILED';
  const summary = results.reduce((acc, r) => { acc[r.action] = (acc[r.action] || 0) + 1; return acc; }, {});
  const actionColor = a => a === 'CREATED' ? 'var(--success)' : a === 'UPDATED' ? 'var(--accent)' : a === 'REJECTED' ? 'var(--danger)' : 'var(--muted)';
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>{job.status === 'DONE' ? '✓' : job.status === 'FAILED' ? '✕' : '⏳'}</span>
        <span style={{ fontWeight: 600, color: job.status === 'FAILED' ? 'var(--danger)' : job.status === 'DONE' ? (job.errorSummary ? 'var(--warning, #f5a623)' : 'var(--success)') : undefined }}>
          {job.status === 'PENDING' && 'Queued…'}
          {job.status === 'RUNNING' && 'Processing…'}
          {job.status === 'DONE'    && `Complete — ${results.length} node${results.length !== 1 ? 's' : ''}${job.errorSummary ? ' (with warnings)' : ''}`}
          {job.status === 'FAILED'  && `Failed: ${job.errorSummary || 'unknown error'}`}
        </span>
      </div>
      {job.status === 'DONE' && job.errorSummary && (
        <div style={{ marginBottom: 12, padding: '8px 10px', background: 'var(--warning-bg, #fff8e1)', border: '1px solid var(--warning, #f5a623)', borderRadius: 6, fontSize: 12, color: 'var(--warning-text, #7a4f00)', whiteSpace: 'pre-wrap' }}>
          {job.errorSummary}
        </div>
      )}
      {Object.keys(summary).length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          {Object.entries(summary).map(([action, count]) => (
            <span key={action} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, border: `1px solid ${actionColor(action)}40`, color: actionColor(action) }}>
              {action}: {count}
            </span>
          ))}
        </div>
      )}
      {results.length > 0 && (
        <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 16 }}>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', position: 'sticky', top: 0 }}>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Type</th>
                <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.id || i} style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}>
                  <td style={{ padding: '5px 10px' }}>{r.name}</td>
                  <td style={{ padding: '5px 10px', color: 'var(--muted)', fontSize: 11 }}>{r.type}</td>
                  <td style={{ padding: '5px 10px' }}>
                    <span style={{ color: actionColor(r.action), fontSize: 11 }}>
                      {r.action}{r.errorMessage ? ` — ${r.errorMessage}` : ''}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-sm" onClick={onClose}>{done ? 'Close' : 'Dismiss (job continues in background)'}</button>
      </div>
    </>
  );
}
