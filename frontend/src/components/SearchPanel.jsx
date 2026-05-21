import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { CloseIcon, NODE_ICONS } from './Icons';
import { lookupSearchItemPlugin } from '../shell/searchItemRegistry';

const SEARCH_DELAY_MS = 350;
const FACET_DIMS      = ['_type', '*'];
const DIM_LABELS      = { _type: 'Type' };
function dimLabel(dim) {
  return DIM_LABELS[dim] ?? dim.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmt(n) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

export default function SearchPanel({ query: initialQuery, onQueryChange, onClose, onNavigate }) {
  const [query,         setQuery]         = useState(initialQuery || '');
  const [result,        setResult]        = useState(null);
  const [loading,       setLoading]       = useState(false);
  // filters: { [dim]: string[] } — multi-select AND per dimension
  const [filters,       setFilters]       = useState({});
  const [info,          setInfo]          = useState(null);
  const [width,         setWidth]         = useState(560);
  const [expanded,      setExpanded]      = useState({});   // id → boolean
  const [childMap,      setChildMap]      = useState({});   // id → Hit[]
  const [expandLoading, setExpandLoading] = useState({});   // id → boolean
  const debounceRef                       = useRef(null);

  const basketItems      = usePlmStore(s => s.basketItems);
  const addToBasket      = usePlmStore(s => s.addToBasket);
  const removeFromBasket = usePlmStore(s => s.removeFromBasket);
  const storeUserId      = usePlmStore(s => s.userId);
  const storeItems       = usePlmStore(s => s.items);
  const itemsStatus      = usePlmStore(s => s.itemsStatus);
  const refreshItems     = usePlmStore(s => s.refreshItems);
  const stateColorMap    = usePlmStore(s => s.stateColorMap);

  const searchCtx = useMemo(
    () => ({ onNavigate, userId: storeUserId, stateColorMap, icons: NODE_ICONS }),
    [onNavigate, storeUserId, stateColorMap],
  );

  // itemCode → displayName from registered descriptors (last-write-wins on collision)
  const typeLabels = useMemo(() => {
    const map = {};
    for (const d of storeItems) {
      if (d.itemCode && d.displayName) map[d.itemCode] = d.displayName;
    }
    return map;
  }, [storeItems]);

  // Load index info once on mount
  useEffect(() => {
    api.searchInfo().then(setInfo).catch(() => setInfo({ available: false }));
  }, []);

  // Fetch metadata when search returns hits whose descriptor is not yet loaded
  const hits = result?.hits || [];
  useEffect(() => {
    if (!hits.length || itemsStatus === 'loading' || itemsStatus === 'loaded') return;
    const hasMissing = hits.some(hit => {
      const svc = hit.serviceCode || 'psm';
      const tc  = hit.itemCode || hit.type;
      return !storeItems.find(d => d.serviceCode === svc && d.itemCode === tc);
    });
    if (hasMissing) refreshItems();
  }, [hits, itemsStatus, storeItems, refreshItems]);

  const rangeDimsRef = useRef([]);

  const doSearch = useCallback(async (q, activeFilters) => {
    if (!q?.trim()) { setResult(null); setExpanded({}); setChildMap({}); return; }
    setLoading(true);
    setExpanded({});
    setChildMap({});
    const rd = rangeDimsRef.current;
    try {
      const filterTerms = Object.fromEntries(
        Object.entries(activeFilters)
          .filter(([dim, v]) => v?.length > 0 && !rd.includes(dim))
      );
      const rangeFilters = Object.fromEntries(
        Object.entries(activeFilters)
          .filter(([dim, v]) => rd.includes(dim) && v?.[0] != null && v?.[1] != null)
          .map(([dim, v]) => [dim, [parseFloat(v[0]), parseFloat(v[1])]])
          .filter(([, r]) => !isNaN(r[0]) && !isNaN(r[1]))
      );
      const res = await api.searchNodes(q.trim(), filterTerms, rangeFilters, FACET_DIMS, 100);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleExpand = useCallback(async (id) => {
    if (expanded[id]) { setExpanded(prev => ({ ...prev, [id]: false })); return; }
    if (childMap[id]) { setExpanded(prev => ({ ...prev, [id]: true  })); return; }
    setExpandLoading(prev => ({ ...prev, [id]: true }));
    try {
      const children = await api.searchChildren(id);
      setChildMap(prev => ({ ...prev, [id]: children }));
      setExpanded(prev => ({ ...prev, [id]: children.length > 0 }));
    } catch {
      setExpanded(prev => ({ ...prev, [id]: false }));
    } finally {
      setExpandLoading(prev => ({ ...prev, [id]: false }));
    }
  }, [expanded, childMap]);

  useEffect(() => { setQuery(initialQuery || ''); }, [initialQuery]);

  const rangeDims = useMemo(() => Object.keys(result?.rangeFacets || {}), [result]);

  // Keep ref in sync — readable in doSearch without making it a dep
  useEffect(() => { rangeDimsRef.current = rangeDims; }, [rangeDims]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query, filters), SEARCH_DELAY_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query, filters, doSearch]);

  function handleQueryChange(e) {
    setQuery(e.target.value);
    onQueryChange?.(e.target.value);
  }

  function toggleFilter(dim, val) {
    setFilters(prev => {
      const current = prev[dim] || [];
      const next = current.includes(val)
        ? current.filter(v => v !== val)
        : [...current, val];
      if (next.length === 0) {
        const { [dim]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dim]: next };
    });
  }

  function clearFilters() { setFilters({}); }

  function startResize(e) {
    e.preventDefault();
    const startX = e.clientX, startW = width;
    const onMove = ev => setWidth(Math.max(420, Math.min(900, startW + ev.clientX - startX)));
    const onUp   = ()  => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  }

  const facets      = result?.facets      || {};
  const rangeFacets = result?.rangeFacets || {};
  const totalHits   = result?.totalHits ?? 0;
  const hasFilters  = Object.values(filters).some(v => v?.length > 0);
  const hasFacets  = Object.keys(facets).length > 0 || Object.keys(rangeFacets).length > 0;

  return (
    <div className="search-panel" style={{ width }}>
      <div className="resize-handle search-panel-resize" onMouseDown={startResize} />

      {/* Header */}
      <div className="search-panel-header">
        <span className="search-panel-title">Search</span>
        <div className="search-panel-header-right">
          {info && (
            <span className={`search-index-badge${info.available ? '' : ' unavail'}`}
                  title={info.available ? `${info.nodeCount} nodes · ${info.edgeCount} edges indexed` : 'Search index unavailable'}>
              {info.available ? `${fmt(info.nodeCount)} nodes · ${fmt(info.edgeCount)} edges` : 'index unavailable'}
            </span>
          )}
          <button className="panel-icon-btn" onClick={onClose} title="Close search">
            <CloseIcon size={13} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Query input */}
      <div className="search-panel-input-wrap">
        <input
          autoFocus
          className="search-panel-input"
          type="text"
          placeholder="Search nodes…"
          value={query}
          onChange={handleQueryChange}
        />
      </div>

      {/* Body: facets left + results right */}
      <div className="search-panel-body">

        {/* Left facets toolbar */}
        <div className="search-facets">
          {hasFacets ? (
            <>
              {/* Term (enum) facets */}
              {Object.entries(facets).map(([dim, counts]) => {
                const label    = dimLabel(dim);
                const selected = filters[dim] || [];
                return (
                  <div key={dim} className="search-facet-group">
                    <div className="search-facet-dim">
                      {label}
                      {selected.length > 0 && (
                        <span className="search-facet-dim-count">{selected.length}</span>
                      )}
                    </div>
                    {Object.entries(counts).slice(0, 10).map(([val, count]) => {
                      const checked    = selected.includes(val);
                      const facetLabel = dim === '_type' ? (typeLabels[val] || val) : val;
                      return (
                        <label
                          key={val}
                          className={`search-facet-item${checked ? ' active' : ''}`}
                          title={`${checked ? 'Remove: ' : 'Add: '}${facetLabel}`}
                        >
                          <input
                            type="checkbox"
                            className="search-facet-checkbox"
                            checked={checked}
                            onChange={() => toggleFilter(dim, val)}
                          />
                          <span className="search-facet-val">{facetLabel}</span>
                          <span className="search-facet-count">{count}</span>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
              {/* Range (numeric) facets */}
              {Object.entries(rangeFacets).map(([dim, [rMin, rMax]]) => {
                const selected = filters[dim] || [];
                const curMin   = selected[0] ?? '';
                const curMax   = selected[1] ?? '';
                const active   = curMin !== '' || curMax !== '';
                return (
                  <div key={dim} className="search-facet-group">
                    <div className="search-facet-dim">
                      {dimLabel(dim)}
                      {active && <span className="search-facet-dim-count">1</span>}
                    </div>
                    <div className="search-facet-range">
                      <input
                        type="number"
                        className="search-facet-range-input"
                        placeholder={rMin != null ? String(Math.floor(rMin)) : 'Min'}
                        value={curMin}
                        onChange={e => setFilters(prev => ({ ...prev, [dim]: [e.target.value, (prev[dim] || [])[1] ?? ''] }))}
                      />
                      <span className="search-facet-range-sep">–</span>
                      <input
                        type="number"
                        className="search-facet-range-input"
                        placeholder={rMax != null ? String(Math.ceil(rMax)) : 'Max'}
                        value={curMax}
                        onChange={e => setFilters(prev => ({ ...prev, [dim]: [(prev[dim] || [])[0] ?? '', e.target.value] }))}
                      />
                    </div>
                  </div>
                );
              })}
              {hasFilters && (
                <button className="search-facet-clear" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </>
          ) : (
            <div className="search-facets-empty">
              {query.trim() && !loading ? 'No facets' : 'Facets appear after search'}
            </div>
          )}
        </div>

        {/* Right results */}
        <div className="search-panel-results">
          {loading && <div className="panel-empty">Searching…</div>}

          {!loading && query.trim() && result !== null && totalHits === 0 && (
            <div className="panel-empty">No results for "{query}"</div>
          )}

          {!loading && totalHits > 0 && (
            <div className="search-results-count">
              {totalHits} result{totalHits !== 1 ? 's' : ''}{hasFilters ? ' (filtered)' : ''}
            </div>
          )}

          {!loading && hits.map(hit => {
            const svc      = hit.serviceCode || 'psm';
            const typeCode = hit.itemCode || hit.type;
            const bKey     = `${svc}:${typeCode}`;
            const pinned   = !!(basketItems[bKey]?.has(hit.id));
            const desc     = storeItems.find(d => d.serviceCode === svc && d.itemCode === typeCode);
            const descriptor = desc ?? { serviceCode: svc, itemCode: typeCode };
            const Component  = lookupSearchItemPlugin(svc, typeCode);
            const isExpanded     = !!expanded[hit.id];
            const isExpandLoading = !!expandLoading[hit.id];
            const children       = childMap[hit.id] || [];

            return (
              <div key={hit.id} className="search-result-group">
                <div className="search-result-row-wrap">
                  <button
                    className={`search-expand-btn${isExpanded ? ' open' : ''}${children.length === 0 && !isExpanded && childMap[hit.id] !== undefined ? ' empty' : ''}`}
                    title={isExpanded ? 'Collapse' : 'Expand children'}
                    onClick={() => toggleExpand(hit.id)}
                    disabled={isExpandLoading}
                  >
                    {isExpandLoading ? '…' : '▶'}
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Component
                      hit={hit}
                      descriptor={descriptor}
                      isPinned={pinned}
                      onPin={() => addToBasket(storeUserId, svc, typeCode, hit.id)}
                      onUnpin={() => removeFromBasket(storeUserId, svc, typeCode, hit.id)}
                      ctx={searchCtx}
                    />
                  </div>
                </div>
                {isExpanded && children.length > 0 && (
                  <div className="search-children">
                    {children.map(child => {
                      const cSvc  = child.serviceCode || 'psm';
                      const cTc   = child.itemCode || child.type;
                      const cBKey = `${cSvc}:${cTc}`;
                      const cDesc = storeItems.find(d => d.serviceCode === cSvc && d.itemCode === cTc)
                                 ?? { serviceCode: cSvc, itemCode: cTc };
                      const ChildComp = lookupSearchItemPlugin(cSvc, cTc);
                      return (
                        <ChildComp
                          key={child.id}
                          hit={child}
                          descriptor={cDesc}
                          isPinned={!!(basketItems[cBKey]?.has(child.id))}
                          onPin={() => addToBasket(storeUserId, cSvc, cTc, child.id)}
                          onUnpin={() => removeFromBasket(storeUserId, cSvc, cTc, child.id)}
                          ctx={searchCtx}
                        />
                      );
                    })}
                  </div>
                )}
                {isExpanded && children.length === 0 && childMap[hit.id] !== undefined && (
                  <div className="search-children-empty">No children</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
