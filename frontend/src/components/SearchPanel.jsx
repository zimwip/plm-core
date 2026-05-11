import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { lookupPluginForDescriptor } from '../services/sourcePlugins';
import { CloseIcon, PinIcon, PinOffIcon } from './Icons';

const SEARCH_DELAY_MS = 300;

function DefaultSearchRow({ descriptor, item, isPinned, onPin, onUnpin, onNavigate }) {
  const id      = item.id || item.ID;
  const label   = item.logical_id || item.LOGICAL_ID || item.name || item.originalName || id;
  const subtype = descriptor.displayName;

  return (
    <div
      className="search-result-row"
      onClick={() => onNavigate(id, label, descriptor)}
      title={`${subtype}: ${label}`}
    >
      <div className="search-result-label">
        <span className="search-result-type" style={{ color: descriptor.color || 'var(--muted)' }}>
          {subtype}
        </span>
        <span className="search-result-name">{label}</span>
      </div>
      <button
        className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
        title={isPinned ? 'Remove from basket' : 'Add to basket'}
        onClick={e => { e.stopPropagation(); isPinned ? onUnpin() : onPin(); }}
      >
        {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
      </button>
    </div>
  );
}

export default function SearchPanel({
  query: initialQuery,
  onQueryChange,
  onClose,
  userId,
  projectSpaceId,
  onNavigate,
}) {
  const [query, setQuery]     = useState(initialQuery || '');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const debounceRef           = useRef(null);
  const panelRef              = useRef(null);
  const [width, setWidth]     = useState(280);
  const resizeRef             = useRef(null);

  const storeItems      = usePlmStore(s => s.items);
  const basketItems     = usePlmStore(s => s.basketItems);
  const addToBasket     = usePlmStore(s => s.addToBasket);
  const removeFromBasket = usePlmStore(s => s.removeFromBasket);
  const storeUserId     = usePlmStore(s => s.userId);
  const storePsId       = usePlmStore(s => s.projectSpaceId);

  const listableDescriptors = useMemo(() => storeItems.filter(d => d.list), [storeItems]);

  const doSearch = useCallback(async (q) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) { setResults({}); return; }
    setLoading(true);
    try {
      const byDesc = {};
      await Promise.all(listableDescriptors.map(async (d) => {
        try {
          const page = await api.fetchListableItems(userId, d, 0, 100);
          const items = (page.items || []).filter(item => {
            const lid  = (item.logical_id   || item.LOGICAL_ID   || item.name || item.originalName || '').toLowerCase();
            const dnam = (item.display_name || item.DISPLAY_NAME || '').toLowerCase();
            return lid.includes(trimmed) || dnam.includes(trimmed);
          });
          if (items.length > 0) byDesc[`${d.serviceCode}:${d.itemCode}:${d.itemKey || ''}`] = { descriptor: d, items };
        } catch { /* skip failed sources */ }
      }));
      setResults(byDesc);
    } finally {
      setLoading(false);
    }
  }, [listableDescriptors, userId]);

  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), SEARCH_DELAY_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  function handleQueryChange(e) {
    setQuery(e.target.value);
    if (onQueryChange) onQueryChange(e.target.value);
  }

  function startResize(e) {
    const startX = e.clientX, startW = width;
    function onMove(ev) { setWidth(Math.max(220, Math.min(600, startW + (ev.clientX - startX)))); }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  const totalResults = Object.values(results).reduce((s, { items }) => s + items.length, 0);

  return (
    <div className="search-panel" ref={panelRef} style={{ width }}>
      <div className="resize-handle search-panel-resize" onMouseDown={startResize} ref={resizeRef} style={{ left: 'auto', right: 0 }} />

      <div className="search-panel-header">
        <span className="search-panel-title">Search</span>
        <button className="panel-icon-btn" onClick={onClose} title="Close search">
          <CloseIcon size={13} strokeWidth={2} />
        </button>
      </div>

      <div className="search-panel-input-wrap">
        <input
          autoFocus
          className="search-panel-input"
          type="text"
          placeholder="Search items…"
          value={query}
          onChange={handleQueryChange}
        />
      </div>

      <div className="search-panel-results">
        {loading && <div className="panel-empty" style={{ fontSize: 11 }}>Searching…</div>}

        {!loading && query.trim() && totalResults === 0 && (
          <div className="panel-empty" style={{ fontSize: 11 }}>No results for "{query}"</div>
        )}

        {!loading && Object.values(results).map(({ descriptor: d, items }) => {
          const plugin = lookupPluginForDescriptor(d);
          const SearchRow = plugin.SearchRow || DefaultSearchRow;
          return (
            <div key={`${d.serviceCode}:${d.itemCode}:${d.itemKey || ''}`} className="search-result-group">
              <div className="search-result-group-label" style={{ color: d.color || 'var(--muted)' }}>
                {d.sourceLabel || d.serviceCode} · {d.displayName}
              </div>
              {items.map(item => {
                const id = item.id || item.ID;
                const basketKey = `${d.serviceCode}:${d.itemKey || d.itemCode}`;
                const isPinned = !!(basketItems[basketKey] && basketItems[basketKey].has(id));
                return (
                  <SearchRow
                    key={id}
                    descriptor={d}
                    item={item}
                    isPinned={isPinned}
                    onPin={() => addToBasket(storeUserId || userId, d.serviceCode, d.itemKey || d.itemCode, id)}
                    onUnpin={() => removeFromBasket(storeUserId || userId, d.serviceCode, d.itemKey || d.itemCode, id)}
                    onNavigate={onNavigate}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
