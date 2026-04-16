import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api, txApi, setProjectSpaceId, setApiErrorHandler } from './services/api';
import { usePlmStore } from './store/usePlmStore';
import { useWebSocket } from './hooks/useWebSocket';
import Header       from './components/Header';
import LeftPanel    from './components/LeftPanel';
import EditorArea   from './components/EditorArea';
import SettingsPage from './components/SettingsPage';
import { NODE_ICONS } from './components/Icons';

const DEFAULT_PROJECT_SPACE = 'ps-default';

// ─── Toast hook ────────────────────────────────────────────────────
let _tid = 0;
function useToasts() {
  const [toasts,      setToasts]    = useState([]);
  const [errorDetail, setErrDetail] = useState(null);

  const toast = useCallback((msgOrErr, type = 'info') => {
    const msg    = typeof msgOrErr === 'string' ? msgOrErr : (msgOrErr?.message || String(msgOrErr));
    const detail = (typeof msgOrErr !== 'string' && msgOrErr?.detail) ? msgOrErr.detail : null;
    if (type === 'error') {
      // Errors go to the modal only, never as a toast
      setErrDetail(detail ?? { error: msg });
      return;
    }
    const id = ++_tid;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  return { toasts, toast, errorDetail, setErrDetail };
}

function Toasts({ toasts }) {
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span aria-hidden="true">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : t.type === 'warn' ? '⚠' : 'ℹ'}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

function ErrorDetailModal({ detail, onClose }) {
  const isTech = detail.category === 'TECHNICAL';
  const stack  = isTech && Array.isArray(detail.stackTrace) ? detail.stackTrace.join('\n') : null;
  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Error detail">
      <div className={`card ${isTech ? 'err-card-tech' : 'err-card-func'}`}
           onClick={e => e.stopPropagation()}>
        <div className="card-hd">
          <span className="card-title" style={{ color: isTech ? 'var(--danger)' : 'var(--warn)' }}>
            {isTech ? '✗ Unexpected error' : '⚠ Error'}
          </span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={`card-body ${isTech ? 'err-body' : ''}`}>
          <div className="err-message">{detail.error}</div>
          {detail.violations?.length > 0 && (
            <ul className="violations-list">
              {detail.violations.map((v, i) => <li key={i} className="violation-item">{v}</li>)}
            </ul>
          )}
          {isTech && detail.type && <div className="err-meta">{detail.type}</div>}
          {detail.path && <div className="err-meta">{detail.path}</div>}
          {stack && <pre className="stack-trace">{stack}</pre>}
        </div>
      </div>
    </div>
  );
}

const COMMIT_CHANGE_BADGE = {
  CONTENT:   { label: 'edit',  bg: 'rgba(106,172,255,.15)', color: 'var(--accent)'  },
  LIFECYCLE: { label: 'state', bg: 'rgba(77,212,160,.15)',  color: 'var(--success)' },
  SIGNATURE: { label: 'sign',  bg: 'rgba(240,180,41,.15)',  color: 'var(--warn)'    },
};

function CommitModal({ userId, txId, txNodes, stateColorMap, onCommitted, onClose, toast }) {
  const [comment,  setComment]  = useState('');
  const [loading,  setLoading]  = useState(false);
  const allIds = (txNodes || []).map(n => n.node_id || n.NODE_ID);
  const [selectedIds, setSelectedIds] = useState(() => new Set(allIds));

  function toggleNode(nid) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(nid) ? next.delete(nid) : next.add(nid);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds(selectedIds.size === allIds.length ? new Set() : new Set(allIds));
  }

  async function submit() {
    if (!comment.trim()) { toast('Commit comment is required', 'warn'); return; }
    if (selectedIds.size === 0) { toast('Select at least one object to commit', 'warn'); return; }
    setLoading(true);
    try {
      const nodeIds = selectedIds.size === allIds.length ? null : [...selectedIds];
      const res = await txApi.commit(userId, txId, comment, nodeIds);
      const contId       = res?.continuationTxId || null;
      const deferredCount = allIds.length - selectedIds.size;
      toast('Transaction committed', 'success');
      onCommitted(contId, deferredCount);
      onClose();
    } catch (e) { toast(e, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="commit-title">
      <div className="card commit-modal">
        <div className="card-hd">
          <span className="card-title" id="commit-title">Commit transaction</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="card-body">
          <div className="field">
            <label className="field-label" htmlFor="commit-comment">
              Commit comment <span className="field-req" aria-label="required">*</span>
            </label>
            <input
              id="commit-comment"
              className="field-input"
              placeholder="Describe what you changed…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              autoFocus
            />
          </div>

          {txNodes?.length > 0 && (
            <div className="commit-node-list">
              <div className="commit-node-list-hd">
                <label className="commit-node-all">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === allIds.length}
                    onChange={toggleAll}
                  />
                  <span>Objects to commit</span>
                  <span className="commit-node-count">{selectedIds.size}/{allIds.length}</span>
                </label>
              </div>
              <div className="commit-node-list-scroll">
                {txNodes.map(n => {
                  const nid   = n.node_id || n.NODE_ID;
                  const lid   = n.logical_id || n.LOGICAL_ID || nid;
                  const type  = n.node_type_name || n.NODE_TYPE_NAME || '';
                  const rev   = n.revision  || n.REVISION  || 'A';
                  const iter  = n.iteration ?? n.ITERATION ?? 1;
                  const ct    = (n.change_type || n.CHANGE_TYPE || 'CONTENT').toUpperCase();
                  const state = n.lifecycle_state_id || n.LIFECYCLE_STATE_ID || '';
                  const badge = COMMIT_CHANGE_BADGE[ct] || COMMIT_CHANGE_BADGE.CONTENT;
                  return (
                    <label key={nid} className="commit-node-item">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(nid)}
                        onChange={() => toggleNode(nid)}
                      />
                      <span className="commit-node-dot"
                        style={{ background: stateColorMap?.[state] || '#6b7280' }} />
                      <span className="commit-node-lid">{lid}</span>
                      <span className="commit-node-rev">{iter === 0 ? rev : `${rev}.${iter}`}</span>
                      <span className="commit-node-type">{type}</span>
                      <span className="commit-node-badge"
                        style={{ background: badge.bg, color: badge.color }}>
                        {badge.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>
            Committed objects become visible to everyone. Uncommitted objects stay in a new transaction.
          </p>
          <div className="row flex-end" style={{ gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-success" onClick={submit}
              disabled={loading || !comment.trim() || selectedIds.size === 0}>
              {loading ? 'Committing…' : '✓ Commit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateNodeModal({ userId, nodeTypes, onCreated, onClose, toast }) {
  const firstType = nodeTypes[0];
  const [nodeTypeId,     setNodeTypeId]    = useState(firstType?.id || firstType?.ID || '');
  const [logicalId,      setLogicalId]     = useState('');
  const [externalId,     setExternalId]    = useState('');
  const [logicalLabel,   setLogicalLabel]  = useState(
    firstType?.logical_id_label || firstType?.LOGICAL_ID_LABEL || 'Identifier'
  );
  const [logicalPattern, setLogicalPattern]= useState(
    firstType?.logical_id_pattern || firstType?.LOGICAL_ID_PATTERN || ''
  );
  const [attrDefs,       setAttrDefs]      = useState([]);
  // Global attrs cache — values persist across node type switches
  const [attrs,          setAttrs]         = useState({});
  const [errors,         setErrors]        = useState({});
  const [loading,        setLoading]       = useState(false);

  useEffect(() => {
    if (!nodeTypeId) return;
    api.getNodeTypeAttributes(userId, nodeTypeId)
      .then(defs => { setAttrDefs(Array.isArray(defs) ? defs : []); setErrors({}); })
      .catch(() => setAttrDefs([]));
    // Pull identity metadata directly from the nodeTypes prop — no extra request needed
    const nt = nodeTypes.find(t => (t.id || t.ID) === nodeTypeId);
    setLogicalLabel(nt?.logical_id_label || nt?.LOGICAL_ID_LABEL || 'Identifier');
    setLogicalPattern(nt?.logical_id_pattern || nt?.LOGICAL_ID_PATTERN || '');
    // Do NOT clear logicalId / externalId / attrs — values persist across type switches
  }, [nodeTypeId, userId, nodeTypes]);

  // Live logical_id pattern check — derived, no state needed
  const logicalIdTrimmed  = logicalId.trim();
  const patternRegex      = logicalPattern ? (() => { try { return new RegExp(logicalPattern); } catch { return null; } })() : null;
  const patternMatches    = !patternRegex || !logicalIdTrimmed ? null : patternRegex.test(logicalIdTrimmed);

  function validate() {
    const e = {};
    // logical_id
    if (!logicalIdTrimmed) {
      e._logicalId = 'Required';
    } else if (patternRegex && !patternMatches) {
      e._logicalId = `Does not match pattern: ${logicalPattern}`;
    }
    // attributes
    attrDefs.forEach(d => {
      const id  = d.id  || d.ID;
      const req = d.required || d.REQUIRED;
      const val = attrs[id] || '';
      if (req && !val.trim()) e[id] = 'Required';
      const regex = d.naming_regex || d.NAMING_REGEX;
      if (regex && val.trim() && !new RegExp(regex).test(val)) e[id] = 'Format: ' + regex;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Only send attributes defined for the current node type
      const currentAttrIds = new Set(attrDefs.map(d => d.id || d.ID));
      const filteredAttrs  = Object.fromEntries(
        Object.entries(attrs).filter(([k]) => currentAttrIds.has(k))
      );
      const data = await api.createNode(userId, nodeTypeId, filteredAttrs, logicalId.trim(), externalId.trim() || null);
      toast('Object created', 'success');
      onCreated(data.nodeId);
      onClose();
    } catch (e) { toast(e, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="create-title">
      <div className="card create-node-modal">
        <div className="card-hd">
          <span className="card-title" id="create-title">Create object</span>
          <button className="btn btn-sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-scroll">
          <div className="field">
            <label className="field-label" htmlFor="node-type-select">Object type</label>
            <select
              id="node-type-select"
              className="field-input"
              value={nodeTypeId}
              onChange={e => setNodeTypeId(e.target.value)}
            >
              {nodeTypes.map(nt => {
                const ntId   = nt.id   || nt.ID;
                const ntName = nt.name || nt.NAME;
                return <option key={ntId} value={ntId}>{ntName}</option>;
              })}
            </select>
          </div>

          {/* ── Core identity fields ── */}
          <div className="modal-identity-sep">
            <span>Identity</span>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="logical-id-input">
              {logicalLabel} <span className="field-req" aria-label="required">*</span>
            </label>
            <div className="logical-id-wrap">
              <input
                id="logical-id-input"
                className={`field-input${
                  errors._logicalId                          ? ' error'
                  : patternMatches === true                  ? ' ok'
                  : ''
                }`}
                placeholder={logicalPattern ? `pattern: ${logicalPattern}` : 'e.g. DOC-0042'}
                value={logicalId}
                aria-invalid={!!errors._logicalId}
                aria-describedby="logical-id-hint"
                onChange={e => { setLogicalId(e.target.value); setErrors(er => ({ ...er, _logicalId: null })); }}
              />
              {/* Live match badge — shown once the user starts typing */}
              {logicalIdTrimmed && patternRegex && (
                <span className={`logical-id-badge ${patternMatches ? 'ok' : 'err'}`}>
                  {patternMatches ? '✓' : '✗'}
                </span>
              )}
            </div>
            {/* Pattern hint — always visible when a pattern is defined */}
            {logicalPattern && (
              <div id="logical-id-hint" className="logical-id-hint">
                <span className="logical-id-hint-label">Pattern</span>
                <code className="logical-id-hint-code">{logicalPattern}</code>
                {!logicalIdTrimmed && (
                  <span className="logical-id-hint-idle">start typing to validate</span>
                )}
                {logicalIdTrimmed && patternMatches === false && (
                  <span className="logical-id-hint-err">no match</span>
                )}
                {logicalIdTrimmed && patternMatches === true && (
                  <span className="logical-id-hint-ok">matches</span>
                )}
              </div>
            )}
            {errors._logicalId && (
              <span className="field-hint error" role="alert">{errors._logicalId}</span>
            )}
          </div>
          <div className="field">
            <label className="field-label" htmlFor="external-id-input">External ID <span style={{ color: 'var(--muted2)' }}>(optional)</span></label>
            <input
              id="external-id-input"
              className="field-input"
              placeholder="Supplier / ERP reference"
              value={externalId}
              onChange={e => setExternalId(e.target.value)}
            />
          </div>

          {/* ── Additional attributes ── */}
          {attrDefs.length > 0 && (
            <div className="modal-identity-sep"><span>Attributes</span></div>
          )}
          {[...attrDefs]
            .sort((a, b) => (a.display_order || a.DISPLAY_ORDER || 0) - (b.display_order || b.DISPLAY_ORDER || 0))
            .map(d => {
              const id       = d.id         || d.ID;
              const label    = d.label      || d.LABEL    || d.name || d.NAME;
              const required = d.required   || d.REQUIRED;
              const widget   = (d.widget_type || d.WIDGET_TYPE || 'TEXT').toUpperCase();
              const rawVals  = d.allowed_values || d.ALLOWED_VALUES;
              const options  = rawVals ? JSON.parse(rawVals) : [];
              const tooltip  = d.tooltip || d.TOOLTIP;
              const err      = errors[id];
              return (
                <div className="field" key={id}>
                  <label className="field-label" htmlFor={`attr-${id}`}>
                    {label}
                    {required && <span className="field-req" aria-label="required">*</span>}
                  </label>
                  {widget === 'DROPDOWN' || widget === 'SELECT'
                    ? (
                      <select id={`attr-${id}`} className={`field-input${err ? ' error' : ''}`}
                        value={attrs[id] || ''}
                        onChange={e => { setAttrs(a => ({ ...a, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: null })); }}>
                        <option value="">— select —</option>
                        {options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input id={`attr-${id}`} className={`field-input${err ? ' error' : ''}`}
                        placeholder={tooltip || ''}
                        value={attrs[id] || ''}
                        aria-invalid={!!err}
                        aria-describedby={err ? `err-${id}` : undefined}
                        onChange={e => { setAttrs(a => ({ ...a, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: null })); }} />
                    )}
                  {err && <span id={`err-${id}`} className="field-hint error" role="alert">{err}</span>}
                </div>
              );
            })}
        </div>
        <div className="card-hd" style={{ borderTop: '1px solid var(--border)', borderBottom: 'none' }}>
          <div className="row flex-end" style={{ width: '100%', gap: 8 }}>
            <button className="btn" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={loading}>
              {loading ? 'Creating…' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────
export default function App() {
  const { toasts, toast, errorDetail, setErrDetail } = useToasts();

  // User & project space
  const [userId,          setUserId]             = useState('user-alice');
  const [projectSpaceId,  setProjectSpaceIdState] = useState(DEFAULT_PROJECT_SPACE);
  const [projectSpaces,   setProjectSpaces]       = useState([]);
  const [users,           setUsers]               = useState([]);

  // Data — nodes, tx, txNodes live in the global store
  const [nodeTypes,          setNodeTypes]          = useState([]);
  const [creatableNodeTypes, setCreatableNodeTypes] = useState([]);
  const [stateColorMap,      setStateColorMap]      = useState({});

  // Store
  const storeSetUserId     = usePlmStore(s => s.setUserId);
  const nodes              = usePlmStore(s => s.nodes);
  const tx                 = usePlmStore(s => s.activeTx);
  const txNodes            = usePlmStore(s => s.txNodes);
  const refreshNodes        = usePlmStore(s => s.refreshNodes);
  const refreshTx           = usePlmStore(s => s.refreshTx);
  const refreshAll          = usePlmStore(s => s.refreshAll);
  const clearTx             = usePlmStore(s => s.clearTx);
  const refreshAllNodeDescs = usePlmStore(s => s.refreshAllNodeDescs);
  const refreshNodeDesc     = usePlmStore(s => s.refreshNodeDesc);

  // ── Global WebSocket — transaction, node-creation & metamodel events ─────
  useWebSocket(
    ['/topic/transactions', '/topic/global', '/topic/metamodel'],
    async (evt) => {
      if (evt.event === 'TX_COMMITTED') {
        // NODE_UPDATED events (one per committed node) handle descriptions + node list.
        // Only tx state needs refreshing here.
        await refreshTx();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} committed a transaction`, 'info');
      } else if (evt.event === 'TX_ROLLED_BACK') {
        // Rolled-back nodes are physically deleted — no per-node events emitted.
        // refreshTx must complete before refreshAllNodeDescs so descriptions
        // are fetched without the now-deleted tx context.
        await refreshTx();
        await Promise.all([refreshNodes(), refreshAllNodeDescs()]);
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} rolled back a transaction`, 'warn');
      } else if (evt.event === 'NODES_RELEASED') {
        refreshTx();
      } else if (evt.event === 'NODE_CREATED') {
        refreshNodes();
        refreshTx();
      } else if (evt.event === 'NODE_UPDATED') {
        // Broadcast from commit — refresh this node's description and the tree
        if (evt.nodeId) refreshNodeDesc(evt.nodeId);
        refreshNodes();
      } else if (evt.event === 'METAMODEL_CHANGED') {
        refreshNodeTypes();
        refreshStateColorMap();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} updated the metamodel`, 'info');
      }
    },
    userId,
  );

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType,  setSearchType]  = useState('');

  // Editor tabs — dashboard tab is always present at index 0
  const DASHBOARD_TAB = { id: 'dashboard', nodeId: null, label: 'Dashboard', pinned: true };
  const [tabs,        setTabs]        = useState([DASHBOARD_TAB]);
  const [activeTabId, setActiveTabId] = useState('dashboard');

  // Currently displayed node description (for properties)
  const [selectedDesc, setSelectedDesc] = useState(null);

  // Modals / views
  const [showCommit,     setShowCommit]     = useState(false);
  const [showCreateNode, setShowCreateNode] = useState(false);
  const [showSettings,         setShowSettings]         = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState(null);
  const [panelWidth,            setPanelWidth]            = useState(268);

  // ── Panel resize ──────────────────────────────────────────────
  function startResize(e) {
    const startX = e.clientX, startW = panelWidth;
    function onMove(ev) { setPanelWidth(Math.max(160, Math.min(600, startW + ev.clientX - startX))); }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleToggleSettings() { setShowSettings(s => !s); }

  // ── Init: set project space + global API error handler ────────
  useEffect(() => {
    setProjectSpaceId(DEFAULT_PROJECT_SPACE);
    setApiErrorHandler(err => toast(err, 'error'));
  }, [toast]);

  // ── Data loading ───────────────────────────────────────────────
  const refreshNodeTypes = useCallback(async () => {
    try {
      const [all, creatable] = await Promise.all([
        api.getNodeTypes(userId),
        api.getCreatableNodeTypes(userId),
      ]);
      setNodeTypes(Array.isArray(all) ? all : []);
      setCreatableNodeTypes(Array.isArray(creatable) ? creatable : []);
    } catch {}
  }, [userId]);

  const refreshStateColorMap = useCallback(async () => {
    try {
      const lcs = await api.getLifecycles(userId);
      if (!Array.isArray(lcs)) return;
      const stateLists = await Promise.all(
        lcs.map(lc => api.getLifecycleStates(userId, lc.id || lc.ID).catch(() => []))
      );
      const map = {};
      stateLists.forEach(states => {
        states.forEach(s => {
          const id    = s.id    || s.ID;
          const color = s.color || s.COLOR;
          if (id && color) map[id] = color;
        });
      });
      setStateColorMap(map);
    } catch {}
  }, [userId]);

  const refreshProjectSpaces = useCallback(async () => {
    try { const d = await api.listProjectSpaces(userId); setProjectSpaces(Array.isArray(d) ? d : []); }
    catch {}
  }, [userId]);

  const refreshUsers = useCallback(async () => {
    try { const d = await api.listUsers(userId); setUsers(Array.isArray(d) ? d.filter(u => u.active !== false) : []); }
    catch {}
  }, [userId]);

  // Sync userId into store and trigger initial load
  useEffect(() => {
    storeSetUserId(userId);
    refreshAll();
    refreshNodeTypes();
    refreshStateColorMap();
    refreshProjectSpaces();
    refreshUsers();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── User switch ────────────────────────────────────────────────
  function handleUserChange(newUserId) {
    setUserId(newUserId);   // triggers the useEffect above which syncs store + refreshes
    setTabs([DASHBOARD_TAB]);
    setActiveTabId('dashboard');
    setSelectedDesc(null);
    setSearchQuery('');
  }

  // ── Project space switch ───────────────────────────────────────
  function handleProjectSpaceChange(psId) {
    setProjectSpaceIdState(psId);
    setProjectSpaceId(psId);      // update api module immediately
    setTabs([DASHBOARD_TAB]);
    setActiveTabId('dashboard');
    setSelectedDesc(null);
    // refreshAll picks up new project space since api module is updated synchronously
    refreshAll();
  }

  // ── Tab management ─────────────────────────────────────────────

  function openDashboard() {
    setActiveTabId('dashboard');
  }

  function navigate(nodeId, label) {
    const existing = tabs.find(t => t.nodeId === nodeId);
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    // Replace first unpinned non-dashboard tab
    const unpinned = tabs.find(t => !t.pinned && t.id !== 'dashboard');
    if (unpinned) {
      setTabs(ts => ts.map(t =>
        t.id === unpinned.id
          ? { ...t, nodeId, label: label || nodeId.slice(0, 10) }
          : t
      ));
      setActiveTabId(unpinned.id);
      return;
    }
    const id = `tab-${Date.now()}`;
    setTabs(ts => [...ts, { id, nodeId, label: label || nodeId.slice(0, 10), pinned: false }]);
    setActiveTabId(id);
  }

  function handleTabClose(tabId) {
    setTabs(ts => {
      const remaining = ts.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        setSelectedDesc(null);
      }
      return remaining;
    });
  }

  function handleSubTabChange(tabId, subTab) {
    setTabs(ts => ts.map(t => t.id === tabId ? { ...t, activeSubTab: subTab } : t));
  }

  // ── Transaction: fully automatic ──────────────────────────────
  async function autoOpenTx() {
    if (tx) return tx.ID || tx.id;
    try {
      const res = await txApi.open(userId, 'Work session');
      await refreshTx();
      return res.txId;
    } catch (e) {
      toast(e, 'error');
      return null;
    }
  }

  async function handleRollback() {
    if (!tx) return;
    const txId = tx.ID || tx.id;
    try {
      await txApi.rollback(userId, txId);
      toast('Transaction rolled back', 'warn');
      clearTx();                 // immediate clear for snappy UI
      await refreshNodes();      // tree may have reverted
      refreshAllNodeDescs();     // open editors revert to last committed state
    } catch (e) { toast(e, 'error'); }
  }

  async function handleReleaseNode(nodeId) {
    if (!tx) return;
    const txId = tx.ID || tx.id;
    try {
      await txApi.release(userId, txId, [nodeId]);
      toast('Object released from transaction', 'info');
      await refreshAll();
    } catch (e) { toast(e, 'error'); }
  }

  async function handleCommitted(continuationTxId, deferredCount) {
    await refreshAll();
    refreshAllNodeDescs(); // open editors: committed nodes are now visible to everyone
    if (continuationTxId && deferredCount > 0) {
      const n = deferredCount;
      toast(`${n} object${n > 1 ? 's' : ''} deferred — new transaction opened`, 'info');
    }
  }

  const activeTab        = tabs.find(t => t.id === activeTabId);
  const activeNodeId     = activeTab?.nodeId;
  const isDashboardOpen  = activeTabId === 'dashboard';

  const onDescriptionLoaded = useCallback((desc) => {
    if (desc?.nodeId === activeNodeId) setSelectedDesc(desc);
    // Enrich the matching tab with nodeTypeId for color/icon display
    if (desc?.nodeId && desc.nodeTypeId) {
      setTabs(ts => ts.map(t => t.nodeId === desc.nodeId ? { ...t, nodeTypeId: desc.nodeTypeId } : t));
    }
  }, [activeNodeId]);

  return (
    <div className="shell">
      <Header
        userId={userId}
        onUserChange={handleUserChange}
        users={users}
        nodeTypes={nodeTypes}
        stateColorMap={stateColorMap}
        searchQuery={searchQuery}
        searchType={searchType}
        onSearchChange={setSearchQuery}
        onSearchTypeChange={setSearchType}
        projectSpaces={projectSpaces}
        projectSpaceId={projectSpaceId}
        onProjectSpaceChange={handleProjectSpaceChange}
        nodes={nodes}
        onNavigate={navigate}
      />

      <div className="body">
        <LeftPanel
          nodes={nodes}
          nodeTypes={nodeTypes}
          tx={tx}
          txNodes={txNodes}
          userId={userId}
          activeNodeId={activeNodeId}
          stateColorMap={stateColorMap}
          onNavigate={navigate}
          canCreateNode={creatableNodeTypes.length > 0}
          onCreateNode={() => setShowCreateNode(true)}
          onCommit={() => setShowCommit(true)}
          onRollback={handleRollback}
          onReleaseNode={handleReleaseNode}
          showSettings={showSettings}
          onToggleSettings={handleToggleSettings}
          activeSettingsSection={activeSettingsSection}
          onSettingsSectionChange={setActiveSettingsSection}
          isDashboardOpen={isDashboardOpen}
          onOpenDashboard={openDashboard}
          style={{ width: panelWidth }}
        />
        <div className="resize-handle" onMouseDown={startResize} />
        <div className="editor-column">
          {showSettings ? (
            <SettingsPage
              userId={userId}
              projectSpaceId={projectSpaceId}
              activeSection={activeSettingsSection}
              onSectionChange={setActiveSettingsSection}
              toast={toast}
            />
          ) : (
            <EditorArea
              tabs={tabs}
              activeTabId={activeTabId}
              userId={userId}
              tx={tx}
              toast={toast}
              nodeTypes={nodeTypes}
              stateColorMap={stateColorMap}
              onTabActivate={id => setActiveTabId(id)}
              onTabClose={handleTabClose}
              onTabPin={tabId => setTabs(ts => ts.map(t => t.id === tabId ? { ...t, pinned: !t.pinned } : t))}
              onSubTabChange={handleSubTabChange}
              onNavigate={navigate}
              onAutoOpenTx={autoOpenTx}
              onDescriptionLoaded={onDescriptionLoaded}
            />
          )}
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {showCommit && tx && (
        <CommitModal
          userId={userId}
          txId={tx.ID || tx.id}
          txNodes={txNodes}
          stateColorMap={stateColorMap}
          onCommitted={handleCommitted}
          onClose={() => setShowCommit(false)}
          toast={toast}
        />
      )}

      {showCreateNode && creatableNodeTypes.length > 0 && (
        <CreateNodeModal
          userId={userId}
          nodeTypes={creatableNodeTypes}
          onCreated={async (nodeId) => { await refreshAll(); navigate(nodeId); }}
          onClose={() => setShowCreateNode(false)}
          toast={toast}
        />
      )}

      {errorDetail && (
        <ErrorDetailModal detail={errorDetail} onClose={() => setErrDetail(null)} />
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}
