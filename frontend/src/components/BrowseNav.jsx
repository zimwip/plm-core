import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api, pollJobStatus, uploadWithProgress, getSessionToken, getProjectSpaceId } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { lookupPluginForDescriptor } from '../services/sourcePlugins';
import {
  ChevronDownIcon, ChevronRightIcon, LayersIcon, PlusIcon, UploadIcon, CloseIcon,
} from './Icons';
import { NODE_ICONS } from './Icons';
import NavItem from './NavItem';

/**
 * Unified federated navigation. Single `/api/platform/items` fetch →
 * one section per `groupKey` → one collapsible group per descriptor →
 * lazy-loaded items. Only descriptors with a non-null `list` action are
 * shown — items the user can create but not list don't appear here.
 *
 * <p>Per-row + per-source rendering is delegated to plugins (see
 * `services/sourcePlugins`). BrowseNav owns generic concerns — fetching,
 * pagination, expansion state, child-tree recursion guard — and asks the
 * plugin for the actual JSX. Adding a new source means writing a plugin,
 * not editing this file.
 */

const PAGE_SIZE = 50;
const MAX_LINK_DEPTH = 8;

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

export default function BrowseNav({
  userId,
  activeNodeId,
  stateColorMap,
  onNavigate,
  onCreateNode,
  refreshKey,
  toast,
  // Render only descriptors whose `panelSection` matches. Defaults to MAIN
  // so legacy callers behave unchanged. Pass "INFO" for the bottom band.
  panelSection = 'MAIN',
  // Basket filtering: when true, only items in basketItems are shown.
  basketView = false,
  basketItems = {},
}) {
  const storeItems      = usePlmStore(s => s.items);
  const itemsStatus     = usePlmStore(s => s.itemsStatus);
  const addToBasket     = usePlmStore(s => s.addToBasket);
  const removeFromBasket = usePlmStore(s => s.removeFromBasket);
  const lockedByMe      = usePlmStore(s => s.lockedByMe);
  const storeUserId     = usePlmStore(s => s.userId);
  const storePsId       = usePlmStore(s => s.projectSpaceId);
  const descriptors  = useMemo(() => storeItems.filter(d => d.list), [storeItems]);
  const [pages, setPages] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [expandedDescriptors, setExpandedDescriptors] = useState(new Set());
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const childCacheRef = useRef({});
  const [, setCacheTick] = useState(0);
  const [importModal, setImportModal] = useState(null); // { descriptor, action } | null
  const [importFile, setImportFile] = useState(null);
  const [importParamValues, setImportParamValues] = useState({});
  const [importing, setImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // null | 0-100
  const [activeJob, setActiveJob] = useState(null); // null | { id, data }
  const cadJobPollRef = useRef(null);

  const ctx = useMemo(() => ({
    userId, activeNodeId, stateColorMap, onNavigate,
  }), [userId, activeNodeId, stateColorMap, onNavigate]);

  const keyOf = useCallback(
    (d) => `${d.serviceCode}:${d.itemCode}:${d.itemKey || ''}`,
    [],
  );

  useEffect(() => () => { if (cadJobPollRef.current) clearInterval(cadJobPollRef.current); }, []);

  // ── Auto-expand + auto-fetch on mount / refresh ──────────────────
  useEffect(() => {
    if (descriptors.length === 0) return;
    setExpandedDescriptors(new Set(descriptors.map(keyOf)));
    descriptors.forEach(d => loadDescriptorPage(d, 0).catch(() => null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptors, refreshKey]);

  // ── Auto-expand the descriptor that owns the active node ─────────
  useEffect(() => {
    if (!activeNodeId) return;
    for (const [k, page] of Object.entries(pages)) {
      if ((page?.items || []).some(it => (it.id || it.ID) === activeNodeId)) {
        setExpandedDescriptors(prev => new Set([...prev, k]));
        return;
      }
    }
  }, [activeNodeId, pages]);

  async function loadDescriptorPage(d, page) {
    const k = keyOf(d);
    setLoadingItems(s => ({ ...s, [k]: true }));
    try {
      const res = await api.fetchListableItems(userId, d, page, PAGE_SIZE);
      setPages(s => {
        const prev = s[k];
        const merged = page === 0 || !prev
          ? res
          : { ...res, items: [...(prev.items || []), ...(res.items || [])] };
        return { ...s, [k]: merged };
      });
    } catch {
      setPages(s => ({ ...s, [k]: { items: [], totalElements: 0, page: 0, size: PAGE_SIZE } }));
    } finally {
      setLoadingItems(s => ({ ...s, [k]: false }));
    }
  }

  function toggleDescriptor(d) {
    const k = keyOf(d);
    setExpandedDescriptors(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else {
        next.add(k);
        if (!pages[k] && !loadingItems[k]) loadDescriptorPage(d, 0);
      }
      return next;
    });
  }

  function loadMore(d) {
    const k = keyOf(d);
    const cur = pages[k];
    if (!cur || loadingItems[k]) return;
    const nextPage = (cur.page ?? 0) + 1;
    if (nextPage >= (cur.totalPages ?? 0)) return;
    loadDescriptorPage(d, nextPage);
  }

  // ── Generic child expansion driven by plugin.fetchChildren ───────
  const toggleItemChildren = useCallback(async (pathKey, item, descriptor, e) => {
    if (e) e.stopPropagation();
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey); else next.add(pathKey);
      return next;
    });
    const id = item.id || item.ID;
    if (childCacheRef.current[id] !== undefined) return;

    const plugin = lookupPluginForDescriptor(descriptor);
    if (!plugin.fetchChildren) {
      childCacheRef.current[id] = [];
      return;
    }
    childCacheRef.current[id] = 'loading';
    setCacheTick(t => t + 1);
    try {
      const children = await plugin.fetchChildren(item, ctx);
      childCacheRef.current[id] = Array.isArray(children) ? children : [];
    } catch {
      childCacheRef.current[id] = [];
    }
    setCacheTick(t => t + 1);
  }, [ctx]);

  function renderChildren(plugin, descriptor, parentItem, parentPath, depth, ancestorIds) {
    if (depth > MAX_LINK_DEPTH) return null;
    const parentId = parentItem.id || parentItem.ID || parentPath;
    const cached = childCacheRef.current[parentId];
    if (!Array.isArray(cached)) return null;
    if (cached.length === 0) return null;
    if (!plugin.ChildRow) return null;

    return cached.map(child => {
      const childId = child.targetNodeId || child.id || child.ID;
      const childPath = `${parentPath}/${child.linkId || childId}`;
      const isCycle = ancestorIds.has(childId);
      const isExp = !isCycle && expandedPaths.has(childPath);

      return (
        <React.Fragment key={childPath}>
          <plugin.ChildRow
            link={child}
            child={child}
            depth={depth}
            parentPath={childPath}
            ancestorIds={ancestorIds}
            ctx={ctx}
            childCacheRef={childCacheRef}
            expandedPaths={expandedPaths}
            toggleNodeChildren={(pk, nid, e) => toggleItemChildren(pk, { id: nid }, descriptor, e)}
          />
          {isExp && renderChildren(
            plugin,
            descriptor,
            { id: childId },
            childPath,
            depth + 1,
            new Set([...ancestorIds, childId]),
          )}
        </React.Fragment>
      );
    });
  }

  // Filter by panel section, group by serviceCode (the source), then sort:
  //   - sources by max priority of their descriptors (desc)
  //   - descriptors inside each source by priority (desc)
  // Source label is taken from the highest-priority descriptor's
  // sourceLabel (falls back to the serviceCode itself).
  const groupedSources = useMemo(() => {
    const want = String(panelSection || 'MAIN').toUpperCase();
    const matching = descriptors.filter(d => {
      const ps = String(d.panelSection || 'MAIN').toUpperCase();
      return ps === want;
    });
    const bySource = new Map();
    for (const d of matching) {
      const code = d.serviceCode || '_unknown';
      if (!bySource.has(code)) bySource.set(code, []);
      bySource.get(code).push(d);
    }
    const sources = [];
    for (const [code, ds] of bySource.entries()) {
      ds.sort((a, b) => (b.priority ?? 100) - (a.priority ?? 100));
      const maxP = ds.reduce((m, d) => Math.max(m, d.priority ?? 100), 0);
      const label = ds[0].sourceLabel || code;
      sources.push({ serviceCode: code, label, maxPriority: maxP, descriptors: ds });
    }
    sources.sort((a, b) => b.maxPriority - a.maxPriority);
    return sources;
  }, [descriptors, panelSection]);

  async function submitImport() {
    if (!importModal || !importFile) return;
    const { descriptor, action } = importModal;
    const url = `/api/${descriptor.serviceCode}${action.path}`;
    const fd = new FormData();
    fd.append('file', importFile);
    (action.parameters || []).forEach(p => {
      const val = importParamValues[p.name];
      if (val != null && val !== '') fd.append(p.name, val);
    });
    const headers = {};
    const token = getSessionToken();
    const ps = getProjectSpaceId();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (ps) headers['X-PLM-ProjectSpace'] = ps;
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
              if (data.job?.status === 'DONE') loadDescriptorPage(descriptor, 0);
            }
          } catch (_) {}
        }, 2000);
      } else {
        toast?.(`${importFile.name} imported`, 'success');
        loadDescriptorPage(descriptor, 0);
      }
    } catch (e) {
      setImportModal(null);
      setUploadProgress(null);
      toast?.(e, 'error');
    } finally {
      setImporting(false);
    }
  }

  if (itemsStatus !== 'loaded' && panelSection === 'MAIN') {
    return <div className="panel-empty">Loading…</div>;
  }
  if (groupedSources.length === 0) return null;

  return (
    <>
      {importModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 900,
            background: 'rgba(0,0,0,.45)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget && !importing) setImportModal(null); }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '20px 24px', width: 360, maxWidth: '90vw',
            boxShadow: '0 8px 32px rgba(0,0,0,.3)',
          }}>
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
              <button className="btn btn-ghost" onClick={() => !importing && setImportModal(null)} disabled={importing}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={submitImport} disabled={!importFile || importing}>
                {importing ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
      {activeJob && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 901, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => { if (e.target === e.currentTarget) setActiveJob(null); }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '20px 24px', width: 480, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,.3)' }}
            onClick={e => e.stopPropagation()}>
            <ImportJobStatus jobData={activeJob.data} onClose={() => setActiveJob(null)} />
          </div>
        </div>
      )}
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
              const k = keyOf(d);
              const isExp = expandedDescriptors.has(k);
              const isLoading = !!loadingItems[k];
              const page = pages[k];
              const items = page?.items || [];
              const total = page?.totalElements ?? items.length;
              const NtIcon = d.icon ? NODE_ICONS[d.icon] : null;
              const moreToLoad = page && (page.totalPages ?? 0) > ((page.page ?? 0) + 1);
              const plugin = lookupPluginForDescriptor(d);

              return (
                <div key={k}>
                  <div className="type-group-hd" onClick={() => toggleDescriptor(d)}>
                    <span className="type-chevron">
                      {isExp
                        ? <ChevronDownIcon size={11} strokeWidth={2.5} color="var(--muted)" />
                        : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted)" />}
                    </span>
                    {NtIcon
                      ? <NtIcon size={11} color={d.color || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
                      : d.color
                        ? <span style={{ width: 7, height: 7, borderRadius: 1, background: d.color, flexShrink: 0 }} />
                        : null}
                    <span className="type-group-name" title={d.description || undefined}>{d.displayName}</span>
                    <span className="type-group-count">
                      {isLoading && items.length === 0 ? '…' : total}
                    </span>
                    {d.create && onCreateNode && (
                      <button
                        className="type-group-create-btn"
                        title={`Create ${d.displayName}`}
                        onClick={e => { e.stopPropagation(); onCreateNode(d); }}
                      >
                        <PlusIcon size={10} strokeWidth={2.5} />
                      </button>
                    )}
                    {d.importActions?.length > 0 && (
                      <button
                        className="type-group-create-btn"
                        title={d.importActions[0].name || `Import ${d.displayName}`}
                        onClick={e => { e.stopPropagation(); setImportFile(null); setImportParamValues({}); setImportModal({ descriptor: d, action: d.importActions[0] }); }}
                      >
                        <UploadIcon size={10} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                  {isExp && (
                    <>
                      {isLoading && items.length === 0 && (
                        <div className="panel-empty" style={{ fontSize: 10 }}>Loading…</div>
                      )}
                      {!isLoading && items.length === 0 && (
                        <div className="panel-empty" style={{ fontSize: 10 }}>Empty</div>
                      )}
                      {items.length > 0 && items.map(item => {
                        const id = item.id || item.ID;
                        // Check basket by item-ID (flat, key-format-agnostic).
                        // Key format may diverge between manual-pin and auto-add paths.
                        const isPinned = Object.values(basketItems).some(s => s.has(id));
                        if (basketView && !isPinned) return null;
                        const isLocked = d.serviceCode === 'psm' && lockedByMe.has(id);
                        const itemPath = `${k}/${id}`;
                        const isItemExp = expandedPaths.has(itemPath);
                        const cached = childCacheRef.current[id];
                        const isItemLoading = cached === 'loading';
                        const hasChildren = plugin.hasItemChildren
                          ? plugin.hasItemChildren(item)
                          : false;

                        return (
                          <React.Fragment key={id}>
                            <NavItem
                              descriptor={d}
                              item={item}
                              ctx={ctx}
                              isActive={id === activeNodeId}
                              isOpen={false}
                              isPinned={isPinned}
                              hasChildren={hasChildren}
                              isExpanded={isItemExp}
                              isLoading={isItemLoading}
                              onToggleExpand={(e) => toggleItemChildren(itemPath, item, d, e)}
                              onToggleChildren={(e) => toggleItemChildren(itemPath, item, d, e)}
                              onPin={() => addToBasket(storeUserId, d.serviceCode, d.itemKey || d.itemCode, id)}
                              onUnpin={isLocked ? null : () => removeFromBasket(storeUserId, d.serviceCode, d.itemKey || d.itemCode, id)}
                            />
                            {isItemExp && renderChildren(
                              plugin, d, item, itemPath, 1, new Set([id]),
                            )}
                          </React.Fragment>
                        );
                      })}
                      {moreToLoad && (
                        <div
                          className="panel-empty"
                          style={{ fontSize: 10, cursor: 'pointer', color: 'var(--muted2)' }}
                          onClick={() => loadMore(d)}
                        >
                          {isLoading ? 'Loading…' : `Load more (${total - items.length} remaining)`}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
