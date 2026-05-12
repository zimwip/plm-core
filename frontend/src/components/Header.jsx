import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { HexIcon, UserIcon, EditIcon, CloseIcon, LogOutIcon, ShoppingBasketIcon } from './Icons';
import { NODE_ICONS } from './Icons';
import { psmNodeDescriptor } from '../plugins/psmDescriptor';
import { api } from '../services/api';
import { getTheme, setTheme as applyTheme, saveThemeToBackend } from '../theme';
import { usePlmStore } from '../store/usePlmStore';
import NavShell from './NavShell';

const THEME_OPTIONS = [
  { value: 'dark',   label: 'Dark',   icon: '●' },
  { value: 'light',  label: 'Light',  icon: '○' },
  { value: 'system', label: 'System', icon: '◐' },
];

function ThemeSelector({ userId }) {
  const [current, setCurrent] = useState(getTheme);
  function handleChange(value) {
    setCurrent(value);
    applyTheme(value);
    if (userId) saveThemeToBackend(userId, value);
  }
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>Theme</div>
      <div className="theme-selector">
        {THEME_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`theme-option${current === opt.value ? ' theme-option--active' : ''}`}
            onClick={() => handleChange(opt.value)}
          >
            <span className="theme-option-icon">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const USER_PALETTE = ['#5b9cf6', '#56d18e', '#e8c547', '#a78bfa', '#f87171', '#34d399', '#fb923c', '#60a5fa'];

function userColor(userId) {
  if (!userId) return '#64748b';
  let h = 0;
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) & 0xffffffff;
  return USER_PALETTE[Math.abs(h) % USER_PALETTE.length];
}

function getInitials(user) {
  const name = user?.displayName || user?.username || '?';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name[0].toUpperCase();
}

function UserAvatar({ user, userId }) {
  const color = userColor(user?.id || userId);
  return (
    <div
      className="user-avatar"
      style={{ '--avatar-color': color }}
      title={user?.displayName || user?.username}
    >
      {user?.avatarUrl
        ? <img className="user-avatar-img" src={user.avatarUrl} alt="" />
        : <span className="user-avatar-initials">{getInitials(user)}</span>
      }
      {user?.isAdmin && <span className="user-avatar-badge" title="Administrator">A</span>}
    </div>
  );
}

/* ── Profile Modal ──────────────────────────────────────────────────── */
function ProfileModal({ userId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ displayName: '', email: '' });
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    api.getUser(userId, userId).then(setProfile).catch(() => {});
  }, [userId]);

  function showToast(msg, type) {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }

  function startEdit() {
    setForm({ displayName: profile?.displayName || '', email: profile?.email || '' });
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateUser(userId, userId, form.displayName.trim(), form.email.trim());
      const updated = await api.getUser(userId, userId);
      setProfile(updated);
      setEditing(false);
      showToast('Profile updated', 'success');
    } catch {
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const color = userColor(userId);

  return (
    <div className="profile-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="profile-modal">
        <div className="profile-modal-header">
          <span className="profile-modal-title">My Profile</span>
          <button className="icon-btn" onClick={onClose} title="Close"><CloseIcon size={14} strokeWidth={2} /></button>
        </div>

        <div className="profile-modal-body">
          {toast && (
            <div style={{
              padding: '7px 12px', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 500,
              background: toast.type === 'success' ? 'rgba(56,212,113,.15)' : 'rgba(248,113,113,.15)',
              color: toast.type === 'success' ? '#34d399' : '#f87171',
              border: `1px solid ${toast.type === 'success' ? '#34d39940' : '#f8717140'}`,
            }}>
              {toast.msg}
            </div>
          )}

          {!profile ? (
            <div className="settings-loading">Loading…</div>
          ) : (
            <>
              {/* Avatar + username row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  border: `3px solid ${color}`,
                  background: `color-mix(in srgb, ${color} 12%, var(--surface))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color, flexShrink: 0,
                }}>
                  {profile.avatarUrl
                    ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : getInitials(profile)
                  }
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
                    {profile.displayName || profile.username}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>
                    {profile.username}
                  </div>
                  {profile.isAdmin && (
                    <span className="settings-badge settings-badge--accent" style={{ marginTop: 4, display: 'inline-block' }}>Admin</span>
                  )}
                </div>
              </div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Display Name</div>
                    <input
                      className="field-input"
                      autoFocus
                      value={form.displayName}
                      onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Email</div>
                    <input
                      className="field-input"
                      type="email"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button className="btn" onClick={() => setEditing(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Display Name</div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{profile.displayName || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 2 }}>Email</div>
                    <div style={{ fontSize: 12, color: 'var(--text)' }}>{profile.email || '—'}</div>
                  </div>
                  <div>
                    <button className="btn btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }} onClick={startEdit}>
                      <EditIcon size={11} strokeWidth={2} />
                      Edit
                    </button>
                  </div>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                <ThemeSelector userId={userId} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Profile Dropdown ───────────────────────────────────────────────── */
function ProfileMenu({ currentUser, userId, users, onUserChange, onOpenProfile, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [onClose]);

  return (
    <div className="profile-menu" ref={ref}>
      {/* Identity header */}
      <div className="profile-menu-header">
        <div className="profile-menu-name">{currentUser?.displayName || currentUser?.username || userId}</div>
        {currentUser?.username && currentUser.username !== currentUser.displayName && (
          <div className="profile-menu-username">{currentUser.username}</div>
        )}
      </div>

      {/* User switcher */}
      {(users || []).length > 1 && (
        <div className="profile-menu-section">
          <div className="profile-menu-label">Switch user</div>
          <div className="profile-menu-select-row">
            <div style={{ position: 'relative' }}>
              <select
                className="user-select"
                style={{ width: '100%', paddingRight: 28 }}
                value={userId}
                onChange={e => { onUserChange(e.target.value); onClose(); }}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.displayName || u.username}</option>
                ))}
              </select>
              <span className="user-select-chevron">▾</span>
            </div>
          </div>
        </div>
      )}

      <div className="profile-menu-divider" />

      <button
        className="profile-menu-item"
        onClick={() => { onOpenProfile(); onClose(); }}
      >
        <UserIcon size={13} strokeWidth={2} color="var(--muted)" />
        My Profile
      </button>

      <div className="profile-menu-divider" />

      <button className="profile-menu-item" disabled title="Not yet implemented">
        <LogOutIcon size={13} strokeWidth={2} color="var(--muted)" />
        Logout
      </button>
    </div>
  );
}

/* ── Basket Button ──────────────────────────────────────────────────── */
function BasketButton({ onNavigate }) {
  const basketItems   = usePlmStore(s => s.basketItems);
  const emptyBasket   = usePlmStore(s => s.emptyBasket);
  const storeUserId   = usePlmStore(s => s.userId);
  const storeItems    = usePlmStore(s => s.items);
  const stateColorMap = usePlmStore(s => s.stateColorMap);
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const count = Object.values(basketItems).reduce((acc, s) => acc + s.size, 0);

  React.useEffect(() => {
    if (!open) return;
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const ctx = React.useMemo(() => ({
    userId: storeUserId,
    activeNodeId: null,
    stateColorMap,
    onNavigate: (id, label, descriptor) => { onNavigate?.(id, label, descriptor); setOpen(false); },
  }), [storeUserId, stateColorMap, onNavigate]);

  // Resolve descriptor + build itemRef per basket entry.
  const entries = React.useMemo(() => {
    const rows = [];
    for (const [key, ids] of Object.entries(basketItems)) {
      const colonIdx = key.indexOf(':');
      const source   = colonIdx > -1 ? key.slice(0, colonIdx) : key;
      const typeCode = colonIdx > -1 ? key.slice(colonIdx + 1) : '';
      const descriptor = storeItems.find(d =>
        d.serviceCode === source && (d.itemKey === typeCode || d.itemCode === typeCode)
      );
      if (!descriptor) continue;
      for (const itemId of ids) {
        rows.push({ descriptor, itemRef: { source, type: typeCode, key: itemId } });
      }
    }
    return rows;
  }, [basketItems, storeItems]);

  return (
    <div className="basket-btn-wrap" ref={ref}>
      <button
        className="basket-btn"
        title="Basket"
        onClick={() => setOpen(v => !v)}
      >
        <ShoppingBasketIcon size={15} strokeWidth={1.8} />
        {count > 0 && <span className="basket-badge">{count > 99 ? '99+' : count}</span>}
      </button>
      {open && (
        <div className="basket-dropdown">
          <div className="basket-dropdown-header">
            <span className="basket-dropdown-title">Basket</span>
            <span className="basket-dropdown-count">{count} item{count !== 1 ? 's' : ''}</span>
          </div>
          <div className="basket-dropdown-divider" />

          {count === 0 ? (
            <div className="basket-dropdown-empty">No items pinned</div>
          ) : (
            <div className="basket-dropdown-list">
              {entries.map(({ descriptor, itemRef }) => (
                <NavShell
                  key={`${itemRef.source}:${itemRef.type}:${itemRef.key}`}
                  descriptor={descriptor}
                  itemRef={itemRef}
                  ctx={ctx}
                  isOpen={false}
                  isPinned={true}
                />
              ))}
            </div>
          )}

          <div className="basket-dropdown-divider" />
          <button
            className="basket-dropdown-action"
            disabled={count === 0}
            onClick={() => { storeUserId && emptyBasket(storeUserId); setOpen(false); }}
          >
            Empty basket
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────────── */
function Header({
  userId, onUserChange, users,
  nodeTypes, stateColorMap, nodes,
  searchQuery, searchType, onSearchChange, onSearchTypeChange, onSearchSubmit,
  projectSpaces, projectSpaceId, onProjectSpaceChange,
  onNavigate,
}) {
  const currentUser = useMemo(() => (users || []).find(u => u.id === userId), [users, userId]);

  const [suggestions,      setSuggestions]      = useState([]);
  const [showSug,          setShowSug]          = useState(false);
  const [hiIdx,            setHiIdx]            = useState(-1);
  const [showProfileMenu,  setShowProfileMenu]  = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const blurTimer     = useRef(null);
  const profileWrap   = useRef(null);

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
    if (onNavigate) onNavigate(id, undefined, psmNodeDescriptor);
  }, [onSearchChange, onNavigate]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (hiIdx >= 0 && suggestions.length > 0) {
        e.preventDefault();
        selectSuggestion(suggestions[hiIdx]);
      } else if (searchQuery && searchQuery.trim()) {
        e.preventDefault();
        setShowSug(false);
        if (onSearchSubmit) onSearchSubmit(searchQuery.trim());
      }
      return;
    }
    if (!showSug || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHiIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHiIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setShowSug(false);
    }
  }, [showSug, suggestions, hiIdx, selectSuggestion, searchQuery, onSearchSubmit]);

  const handleBlur  = useCallback(() => { blurTimer.current = setTimeout(() => setShowSug(false), 150); }, []);
  const handleFocus = useCallback(() => { clearTimeout(blurTimer.current); if (suggestions.length > 0) setShowSug(true); }, [suggestions.length]);

  return (
    <header className="header">
      {/* ── Left: brand ─────────────────────── */}
      <div className="header-left">
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="24" height="24" rx="5" fill="url(#psm-grad)" />
            <circle cx="12" cy="6" r="2.2" fill="white" fillOpacity="0.95" />
            <line x1="12" y1="8.2" x2="6.5" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            <line x1="12" y1="8.2" x2="17.5" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            <line x1="12" y1="8.2" x2="12" y2="14.8" stroke="white" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
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

      {/* ── Right: project space + profile ──── */}
      <div className="header-right">
        <BasketButton onNavigate={onNavigate} />

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

        <div className="profile-menu-wrap" ref={profileWrap}>
          <button
            className="profile-avatar-btn"
            onClick={() => setShowProfileMenu(v => !v)}
            title="Profile & settings"
          >
            <UserAvatar user={currentUser} userId={userId} />
          </button>

          {showProfileMenu && (
            <ProfileMenu
              currentUser={currentUser}
              userId={userId}
              users={users}
              onUserChange={onUserChange}
              onOpenProfile={() => setShowProfileModal(true)}
              onClose={() => setShowProfileMenu(false)}
            />
          )}
        </div>
      </div>

      {showProfileModal && (
        <ProfileModal
          userId={userId}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </header>
  );
}

export default React.memo(Header);
