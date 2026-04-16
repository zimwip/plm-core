import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HexIcon } from './Icons';
import { NODE_ICONS } from './Icons';

const USER_PALETTE = ['#5b9cf6', '#56d18e', '#e8c547', '#a78bfa', '#f87171', '#34d399', '#fb923c', '#60a5fa'];

function userColor(userId) {
  // Stable color per user derived from id hash
  if (!userId) return '#64748b';
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffffffff;
  return USER_PALETTE[Math.abs(h) % USER_PALETTE.length];
}


function Header({
  userId, onUserChange, users,
  nodeTypes, stateColorMap, nodes,
  searchQuery, searchType, onSearchChange, onSearchTypeChange,
  projectSpaces, projectSpaceId, onProjectSpaceChange,
  onNavigate,
}) {
  const currentUser = useMemo(() => (users || []).find(u => u.id === userId), [users, userId]);

  const [suggestions, setSuggestions] = useState([]);
  const [showSug,     setShowSug]     = useState(false);
  const [hiIdx,       setHiIdx]       = useState(-1);
  const blurTimer = useRef(null);

  // Recompute suggestions whenever query or nodes change
  useEffect(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (q.length < 2) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const matches = (nodes || [])
      .filter(n => {
        const lid  = (n.logical_id   || n.LOGICAL_ID   || '').toLowerCase();
        const dnam = (n.display_name || n.DISPLAY_NAME || '').toLowerCase();
        return (lid && lid.includes(q)) || (dnam && dnam.includes(q));
      })
      .slice(0, 8);
    setSuggestions(matches);
    setShowSug(matches.length > 0);
    setHiIdx(-1);
  }, [searchQuery, nodes]);

  const selectSuggestion = useCallback((node) => {
    const id = node.id || node.ID;
    clearTimeout(blurTimer.current);
    onSearchChange('');
    setShowSug(false);
    setSuggestions([]);
    if (onNavigate) onNavigate(id);
  }, [onSearchChange, onNavigate]);

  const handleKeyDown = useCallback((e) => {
    if (!showSug || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHiIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHiIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && hiIdx >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[hiIdx]);
    } else if (e.key === 'Escape') {
      setShowSug(false);
    }
  }, [showSug, suggestions, hiIdx, selectSuggestion]);

  const handleBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setShowSug(false), 150);
  }, []);

  const handleFocus = useCallback(() => {
    clearTimeout(blurTimer.current);
    if (suggestions.length > 0) setShowSug(true);
  }, [suggestions.length]);

  return (
    <header className="header">
      {/* ── Left: brand ─────────────────────── */}
      <div className="header-left">
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="24" height="24" rx="5" fill="url(#psm-grad)" />
            {/* Root node */}
            <circle cx="12" cy="6" r="2.2" fill="white" fillOpacity="0.95" />
            {/* Branch lines */}
            <line x1="12" y1="8.2" x2="6.5" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            <line x1="12" y1="8.2" x2="17.5" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            <line x1="12" y1="8.2" x2="12" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            {/* Leaf nodes */}
            <circle cx="6.5" cy="17" r="1.8" fill="white" fillOpacity="0.85" />
            <circle cx="12" cy="17" r="1.8" fill="white" fillOpacity="0.85" />
            <circle cx="17.5" cy="17" r="1.8" fill="white" fillOpacity="0.85" />
            <defs>
              <linearGradient id="psm-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="var(--accent)" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
          <span>PSM</span>
        </div>
        <div className="brand-sep" />
      </div>

      {/* ── Center: search ──────────────────── */}
      <div className="header-center">
        <div className="search-wrap">
          <div className="search-group">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search by logical ID…"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              autoComplete="off"
            />
            <div className="search-divider" />
            <select
              className="search-type"
              value={searchType}
              onChange={e => onSearchTypeChange(e.target.value)}
              title="Filter by type"
            >
              <option value="">All types</option>
              {(nodeTypes || []).map(nt => (
                <option key={nt.id || nt.ID} value={nt.id || nt.ID}>
                  {nt.name || nt.NAME}
                </option>
              ))}
            </select>
          </div>

          {/* Autocomplete dropdown */}
          {showSug && suggestions.length > 0 && (
            <div className="search-suggestions">
              {suggestions.map((n, i) => {
                const id        = n.id    || n.ID;
                const lid       = n.logical_id || n.LOGICAL_ID || '';
                const type      = n.node_type_name || n.NODE_TYPE_NAME || '';
                const typeId    = n.node_type_id   || n.NODE_TYPE_ID   || '';
                const rev       = n.revision  || n.REVISION  || 'A';
                const iter      = n.iteration ?? n.ITERATION ?? 1;
                const state     = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
                const stateClr  = stateColorMap?.[state] || '#6b7280';
                const nt        = (nodeTypes || []).find(t => (t.id || t.ID) === typeId);
                const typeColor = nt?.color || nt?.COLOR || null;
                const typeIcon  = nt?.icon  || nt?.ICON  || null;
                const NtIcon    = typeIcon ? NODE_ICONS[typeIcon] : null;
                return (
                  <div
                    key={id}
                    className={`search-sug-item${i === hiIdx ? ' hi' : ''}`}
                    onMouseDown={() => selectSuggestion(n)}
                    onMouseEnter={() => setHiIdx(i)}
                  >
                    {/* Node type badge */}
                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4, flexShrink: 0 }}>
                      {NtIcon
                        ? <NtIcon size={11} color={typeColor || 'var(--muted)'} strokeWidth={2} />
                        : typeColor
                          ? <span style={{ width: 7, height: 7, borderRadius: 1, background: typeColor, display: 'inline-block' }} />
                          : null
                      }
                    </span>
                    <span className="sug-dot" style={{ background: stateClr }} />
                    <span className="sug-lid">{lid}</span>
                    {(n.display_name || n.DISPLAY_NAME) && (
                      <span className="sug-dname">{n.display_name || n.DISPLAY_NAME}</span>
                    )}
                    <span className="sug-meta">{type} · {iter === 0 ? rev : `${rev}.${iter}`}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: project space + user ──────── */}
      <div className="header-right">
        {(projectSpaces || []).length > 0 && (
          <div className="ps-select-wrap" title="Active project space">
            <HexIcon size={13} color="var(--accent)" strokeWidth={1.5} />
            <div style={{ position: 'relative' }}>
              <select
                className="ps-select"
                value={projectSpaceId}
                onChange={e => onProjectSpaceChange(e.target.value)}
              >
                {projectSpaces.map(ps => (
                  <option key={ps.id || ps.ID} value={ps.id || ps.ID}>
                    {ps.name || ps.NAME}
                  </option>
                ))}
              </select>
              <span className="user-select-chevron">▾</span>
            </div>
          </div>
        )}

        <div className="user-select-wrap">
          <span className="user-dot" style={{ background: userColor(userId) }} />
          <div style={{ position: 'relative' }}>
            <select
              className="user-select"
              value={userId}
              onChange={e => onUserChange(e.target.value)}
            >
              {(users || []).map(u => (
                <option key={u.id} value={u.id}>
                  {u.displayName || u.username}
                </option>
              ))}
            </select>
            <span className="user-select-chevron">▾</span>
          </div>
          {currentUser?.isAdmin && (
            <span
              title="Administrator"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 16, height: 16, borderRadius: 3,
                background: '#f59e0b', color: '#fff',
                fontSize: 9, fontWeight: 700, letterSpacing: 0,
                marginLeft: 4, flexShrink: 0,
              }}
            >A</span>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Header);
