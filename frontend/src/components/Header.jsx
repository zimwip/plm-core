import React, { useState, useEffect, useRef } from 'react';
import { HexIcon } from './Icons';

const USERS = [
  { id: 'user-admin',   label: 'Admin',   role: 'ADMIN',    color: '#e8c547' },
  { id: 'user-alice',   label: 'Alice',   role: 'DESIGNER', color: '#5b9cf6' },
  { id: 'user-bob',     label: 'Bob',     role: 'REVIEWER', color: '#56d18e' },
  { id: 'user-charlie', label: 'Charlie', role: 'READER',   color: '#a78bfa' },
];

const STATE_COLORS = {
  'st-draft':    '#6aacff',
  'st-inreview': '#f0b429',
  'st-released': '#4dd4a0',
  'st-frozen':   '#a78bfa',
  'st-obsolete': '#6b7280',
};

export default function Header({
  userId, onUserChange,
  nodeTypes, nodes,
  searchQuery, searchType, onSearchChange, onSearchTypeChange,
  projectSpaces, projectSpaceId, onProjectSpaceChange,
  onNavigate,
}) {
  const currentUser = USERS.find(u => u.id === userId);

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
        const lid = (n.logical_id || n.LOGICAL_ID || '').toLowerCase();
        return lid && lid.includes(q);
      })
      .slice(0, 8);
    setSuggestions(matches);
    setShowSug(matches.length > 0);
    setHiIdx(-1);
  }, [searchQuery, nodes]);

  function selectSuggestion(node) {
    const id = node.id || node.ID;
    clearTimeout(blurTimer.current);
    onSearchChange('');
    setShowSug(false);
    setSuggestions([]);
    if (onNavigate) onNavigate(id);
  }

  function handleKeyDown(e) {
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
  }

  function handleBlur() {
    blurTimer.current = setTimeout(() => setShowSug(false), 150);
  }

  function handleFocus() {
    clearTimeout(blurTimer.current);
    if (suggestions.length > 0) setShowSug(true);
  }

  return (
    <header className="header">
      {/* ── Left: brand ─────────────────────── */}
      <div className="header-left">
        <div className="brand">
          <div className="brand-mark">P</div>
          PLM<span style={{ color: 'var(--accent)', marginLeft: 1 }}>core</span>
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
                const id      = n.id    || n.ID;
                const lid     = n.logical_id || n.LOGICAL_ID || '';
                const type    = n.node_type_name || n.NODE_TYPE_NAME || '';
                const rev     = n.revision  || n.REVISION  || 'A';
                const iter    = n.iteration || n.ITERATION || 1;
                const state   = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
                const color   = STATE_COLORS[state] || '#6b7280';
                return (
                  <div
                    key={id}
                    className={`search-sug-item${i === hiIdx ? ' hi' : ''}`}
                    onMouseDown={() => selectSuggestion(n)}
                    onMouseEnter={() => setHiIdx(i)}
                  >
                    <span className="sug-dot" style={{ background: color }} />
                    <span className="sug-lid">{lid}</span>
                    <span className="sug-meta">{type} · {rev}.{iter}</span>
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
          <span className="user-dot" style={{ background: currentUser?.color || '#64748b' }} />
          <div style={{ position: 'relative' }}>
            <select
              className="user-select"
              value={userId}
              onChange={e => onUserChange(e.target.value)}
            >
              {USERS.map(u => (
                <option key={u.id} value={u.id}>
                  {u.label} · {u.role}
                </option>
              ))}
            </select>
            <span className="user-select-chevron">▾</span>
          </div>
        </div>
      </div>
    </header>
  );
}
