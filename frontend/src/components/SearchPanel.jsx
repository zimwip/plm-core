import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { CloseIcon } from './Icons';
import NavItem from './NavItem';

const SEARCH_DELAY_MS = 350;
const FACET_DIMS      = ['_type', '_projectSpaceId'];
const DIM_LABELS      = { _type: 'Type', _projectSpaceId: 'Project' };
// Future numeric/date dims go here; renders range inputs instead of checkboxes.
const RANGE_DIMS      = [];

function fmt(n) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

export default function SearchPanel({ query: initialQuery, onQueryChange, onClose, onNavigate }) {
  const [query,    setQuery]    = useState(initialQuery || '');
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  // filters: { [dim]: string[] } — multi-select AND per dimension
  const [filters,  setFilters]  = useState({});
  const [info,     setInfo]     = useState(null);
  const [width,    setWidth]    = useState(560);
  const debounceRef             = useRef(null);

  const basketItems      = usePlmStore(s => s.basketItems);
  const addToBasket      = usePlmStore(s => s.addToBasket);
  const removeFromBasket = usePlmStore(s => s.removeFromBasket);
  const storeUserId      = usePlmStore(s => s.userId);
  const storeItems       = usePlmStore(s => s.items);

  const navCtx = useMemo(() => ({ onNavigate }), [onNavigate]);

  // Load index info once on mount
  useEffect(() => {
    api.searchInfo().then(setInfo).catch(() => setInfo({ available: false }));
  }, []);

  const doSearch = useCallback(async (q, activeFilters) => {
    if (!q?.trim()) { setResult(null); return; }
    setLoading(true);
    try {
      const filterTerms = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v?.length > 0)
      );
      const res = await api.searchNodes(q.trim(), filterTerms, FACET_DIMS, 100);
      setResult(res);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { setQuery(initialQuery || ''); }, [initialQuery]);

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

  const hits      = result?.hits      || [];
  const facets    = result?.facets    || {};
  const totalHits = result?.totalHits ?? 0;
  const hasFilters = Object.values(filters).some(v => v?.length > 0);
  const hasFacets  = Object.keys(facets).length > 0;

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
              {Object.entries(facets).map(([dim, counts]) => {
                const label    = DIM_LABELS[dim] || dim;
                const selected = filters[dim] || [];
                const isRange  = RANGE_DIMS.includes(dim);
                return (
                  <div key={dim} className="search-facet-group">
                    <div className="search-facet-dim">
                      {label}
                      {selected.length > 0 && (
                        <span className="search-facet-dim-count">{selected.length}</span>
                      )}
                    </div>
                    {isRange ? (
                      <div className="search-facet-range">
                        <input
                          type="number"
                          className="search-facet-range-input"
                          placeholder="Min"
                          value={selected[0] ?? ''}
                          onChange={e => setFilters(prev => ({
                            ...prev,
                            [dim]: [e.target.value, (prev[dim] || [])[1] ?? '']
                          }))}
                        />
                        <span className="search-facet-range-sep">–</span>
                        <input
                          type="number"
                          className="search-facet-range-input"
                          placeholder="Max"
                          value={selected[1] ?? ''}
                          onChange={e => setFilters(prev => ({
                            ...prev,
                            [dim]: [(prev[dim] || [])[0] ?? '', e.target.value]
                          }))}
                        />
                      </div>
                    ) : (
                      Object.entries(counts).slice(0, 10).map(([val, count]) => {
                        const checked = selected.includes(val);
                        return (
                          <label
                            key={val}
                            className={`search-facet-item${checked ? ' active' : ''}`}
                            title={`${checked ? 'Remove: ' : 'Add: '}${val}`}
                          >
                            <input
                              type="checkbox"
                              className="search-facet-checkbox"
                              checked={checked}
                              onChange={() => toggleFilter(dim, val)}
                            />
                            <span className="search-facet-val">{val}</span>
                            <span className="search-facet-count">{count}</span>
                          </label>
                        );
                      })
                    )}
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
            let source = {};
            try { source = JSON.parse(hit.sourceJson || '{}'); } catch {}
            const label    = source.logicalId || hit.id;
            const svc      = hit.serviceCode || 'psm';
            const typeCode = hit.itemCode   || hit.type;
            const bKey     = `${svc}:${typeCode}`;
            const pinned   = !!(basketItems[bKey]?.has(hit.id));
            const desc     = storeItems.find(d => d.serviceCode === svc && d.itemCode === typeCode);
            const descriptor = desc || { serviceCode: svc, itemCode: typeCode, displayName: hit.type };
            const item = { id: hit.id, _title: label, ...source };

            return (
              <NavItem
                key={hit.id}
                descriptor={descriptor}
                item={item}
                ctx={navCtx}
                isPinned={pinned}
                onPin={() => addToBasket(storeUserId, svc, typeCode, hit.id)}
                onUnpin={() => removeFromBasket(storeUserId, svc, typeCode, hit.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
