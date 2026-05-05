import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { lookupPluginForDescriptor } from '../services/sourcePlugins';
import {
  ChevronDownIcon, ChevronRightIcon, LayersIcon,
} from './Icons';
import { NODE_ICONS } from './Icons';

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

export default function BrowseNav({
  userId,
  activeNodeId,
  stateColorMap,
  onNavigate,
  refreshKey,
  // Render only descriptors whose `panelSection` matches. Defaults to MAIN
  // so legacy callers behave unchanged. Pass "INFO" for the bottom band.
  panelSection = 'MAIN',
}) {
  const storeItems   = usePlmStore(s => s.items);
  const itemsStatus  = usePlmStore(s => s.itemsStatus);
  const descriptors  = useMemo(() => storeItems.filter(d => d.list), [storeItems]);
  const [pages, setPages] = useState({});
  const [loadingItems, setLoadingItems] = useState({});
  const [expandedDescriptors, setExpandedDescriptors] = useState(new Set());
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const childCacheRef = useRef({});
  const [, setCacheTick] = useState(0);

  const ctx = useMemo(() => ({
    userId, activeNodeId, stateColorMap, onNavigate,
  }), [userId, activeNodeId, stateColorMap, onNavigate]);

  const keyOf = useCallback(
    (d) => `${d.serviceCode}:${d.itemCode}:${d.itemKey || ''}`,
    [],
  );

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

  if (itemsStatus !== 'loaded' && panelSection === 'MAIN') {
    return <div className="panel-empty">Loading…</div>;
  }
  if (groupedSources.length === 0) return null;

  return (
    <>
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
              const NavRow = plugin.NavRow;

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
                        const itemPath = `${k}/${id}`;
                        const isItemExp = expandedPaths.has(itemPath);
                        const cached = childCacheRef.current[id];
                        const isItemLoading = cached === 'loading';
                        const hasChildren = plugin.hasItemChildren
                          ? plugin.hasItemChildren(item)
                          : false;

                        return (
                          <React.Fragment key={id}>
                            {NavRow && (
                              <NavRow
                                descriptor={d}
                                item={item}
                                ctx={ctx}
                                isActive={id === activeNodeId}
                                hasChildren={hasChildren}
                                isExpanded={isItemExp}
                                isLoading={isItemLoading}
                                onToggleChildren={(e) => toggleItemChildren(itemPath, item, d, e)}
                              />
                            )}
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
