import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { api, txApi, authoringApi } from '../services/api';
import { getDraggedNode, clearDraggedNode } from '../services/dragState';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePlmStore } from '../store/usePlmStore';
import LifecycleDiagram from './LifecycleDiagram';
import { NODE_ICONS } from './Icons';

function stateLabel(s) {
  return { 'st-draft': 'Draft', 'st-inreview': 'In Review', 'st-released': 'Released', 'st-frozen': 'Frozen', 'st-obsolete': 'Obsolete' }[s] || s;
}
function StatePill({ stateId, stateName, stateColorMap }) {
  const c = stateColorMap?.[stateId] || '#6b7280';
  return (
    <span className="pill" style={{ color: c, background: `${c}18`, border: `1px solid ${c}30` }}>
      <span className="pill-dot" style={{ background: c }} />
      {stateName || stateLabel(stateId)}
    </span>
  );
}

export default function NodeEditor({
  nodeId,
  userId,
  tx,
  nodeTypes,
  stateColorMap,
  activeSubTab,
  onSubTabChange,
  toast,
  onAutoOpenTx,
  onDescriptionLoaded,
  onOpenCommentsForVersion,
  onCommentAttribute,
}) {
  // desc lives in the store — subscribed below; all other state is local UI state
  const [sigs,                setSigs]               = useState([]);
  const [history,             setHistory]            = useState([]);
  const [versionCommentCounts,setVersionCommentCounts] = useState({});
  const [edits,          setEdits]         = useState({});
  const [saveViolations, setSaveViolations]= useState([]);
  const [loading,        setLoading]       = useState(false);
  const [saveStatus,     setSaveStatus]    = useState(null); // null | 'saving' | 'saved'
  const [actionDialog,     setActionDialog]     = useState(null);  // action object | null
  const [actionParams,     setActionParams]     = useState({});    // param values for dialog
  const [diff,        setDiff]       = useState(null);   // { data, v1Num, v2Num } | null
  const [diffLoading, setDiffLoading]= useState(false);
  const [children,    setChildren]   = useState([]);
  const [parents,     setParents]    = useState([]);
  const [pbsLoaded,   setPbsLoaded]  = useState(false);
  const [linkPanel,       setLinkPanel]      = useState(false);
  const [linkTypes,       setLinkTypes]      = useState([]);
  const [allNodes,        setAllNodes]       = useState([]);
  const [selLinkType,     setSelLinkType]    = useState('');
  const [selTarget,       setSelTarget]      = useState('');
  const [linkLogicalId,   setLinkLogicalId]  = useState('');
  const [linkLoading,     setLinkLoading]    = useState(false);
  const [editingLinkId,    setEditingLinkId]    = useState(null);
  const [editLinkLogId,    setEditLinkLogId]    = useState('');
  const [editLinkTargetId, setEditLinkTargetId] = useState('');
  const [deletingLinkId,   setDeletingLinkId]   = useState(null);
  const [linkActLoading,   setLinkActLoading]   = useState(false);

  const [isDragOver,     setIsDragOver]     = useState(false);
  const [attrCtxMenu,    setAttrCtxMenu]    = useState(null); // { attrId, attrLabel, x, y }
  const [viewVersionNum, setViewVersionNum] = useState(null);
  const [historicalDesc, setHistoricalDesc] = useState(null);
  const [histLoading,    setHistLoading]    = useState(false);

  const saveTimer     = useRef(null);
  const savedTimer    = useRef(null);
  const dragCounter   = useRef(0);
  const linkPanelRef  = useRef(null);

  // Global store
  const desc               = usePlmStore(s => s.activeNodeDescs[nodeId] ?? null);
  const refreshNodeDesc    = usePlmStore(s => s.refreshNodeDesc);
  const patchNodeDescAttrs = usePlmStore(s => s.patchNodeDescAttrs);
  const evictNodeDesc      = usePlmStore(s => s.evictNodeDesc);
  const refreshAll         = usePlmStore(s => s.refreshAll);
  const refreshNodes       = usePlmStore(s => s.refreshNodes);
  const refreshTx          = usePlmStore(s => s.refreshTx);

  const txId = tx?.ID || tx?.id || null;

  // Notify parent whenever the store-backed desc changes
  useEffect(() => {
    if (desc && onDescriptionLoaded) onDescriptionLoaded(desc);
  }, [desc]); // eslint-disable-line react-hooks/exhaustive-deps

  // Evict from cache when the tab is closed (nodeId changes or component unmounts)
  useEffect(() => {
    return () => evictNodeDesc(nodeId);
  }, [nodeId]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Full reload: re-fetch desc (via store), sigs, and history.
   * Call refreshTx/refreshAll before load() when the tx context has just changed
   * so the store's activeTx is up-to-date before refreshNodeDesc reads it.
   */
  const load = useCallback(async () => {
    try {
      const [s, h, c] = await Promise.all([
        api.getSignatures(userId, nodeId).catch(() => []),
        api.getVersionHistory(userId, nodeId).catch(() => []),
        api.getComments(userId, nodeId).catch(() => []),
      ]);
      setSigs(Array.isArray(s) ? s : []);
      setHistory(Array.isArray(h) ? h : []);
      // Build per-version comment counts for history tab badges
      const counts = {};
      if (Array.isArray(c)) {
        c.forEach(comment => {
          const vid = comment.versionId;
          if (vid) counts[vid] = (counts[vid] || 0) + 1;
        });
      }
      setVersionCommentCounts(counts);
      setEdits({});
      setSaveViolations([]);
      await refreshNodeDesc(nodeId); // updates desc in store → triggers re-render
    } catch (e) { toast(e, 'error'); }
  }, [nodeId, userId, refreshNodeDesc, toast]);

  useEffect(() => { load(); }, [load]);

  // Lightweight refresh: only re-fetch comments and rebuild counts (used by WS handler)
  const refreshCommentCounts = useCallback(async () => {
    try {
      const c = await api.getComments(userId, nodeId).catch(() => []);
      const counts = {};
      if (Array.isArray(c)) {
        c.forEach(comment => {
          const vid = comment.versionId;
          if (vid) counts[vid] = (counts[vid] || 0) + 1;
        });
      }
      setVersionCommentCounts(counts);
    } catch {}
  }, [nodeId, userId]);

  // Reset PBS cache and historical view when node changes
  useEffect(() => {
    setPbsLoaded(false); setChildren([]); setParents([]);
    setViewVersionNum(null); setHistoricalDesc(null);
  }, [nodeId]);

  const loadPds = useCallback(async () => {
    if (pbsLoaded) return;
    try {
      const [c, p] = await Promise.all([
        api.getChildLinks(userId, nodeId).catch(() => []),
        api.getParentLinks(userId, nodeId).catch(() => []),
      ]);
      setChildren(Array.isArray(c) ? c : []);
      setParents(Array.isArray(p) ? p : []);
      setPbsLoaded(true);
    } catch (e) { toast(e, 'error'); }
  }, [nodeId, userId, pbsLoaded, toast]);

  useEffect(() => {
    if (activeSubTab === 'pbs') loadPds();
  }, [activeSubTab, loadPds]);

  // Cancel pending save on unmount
  useEffect(() => () => {
    clearTimeout(saveTimer.current);
    clearTimeout(savedTimer.current);
  }, []);

  // Scroll the link panel into view whenever it opens (important for DnD where the
  // user may be scrolled to the bottom of the PBS list when the drop occurs)
  useEffect(() => {
    if (linkPanel && linkPanelRef.current) {
      linkPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [linkPanel]);

  useWebSocket(
    nodeId ? `/topic/nodes/${nodeId}` : null,
    (evt) => {
      const NODE_EVENTS = ['STATE_CHANGED', 'LOCK_ACQUIRED', 'LOCK_RELEASED', 'NODE_UPDATED', 'SIGNED'];
      if (NODE_EVENTS.includes(evt.event)) {
        refreshNodeDesc(nodeId);  // update this editor's content in the store
        // Refresh node list for any event that changes the lock status so the
        // left-panel lock/edit badge updates immediately (not just on LOCK_RELEASED).
        if (['LOCK_RELEASED', 'LOCK_ACQUIRED', 'NODE_UPDATED'].includes(evt.event)) {
          refreshNodes();
        }
      }
      if (evt.event === 'COMMENT_ADDED') {
        refreshCommentCounts();
      }
    },
    userId,
  );

  async function openDiff(v2Num) {
    // Compare the selected version with the previous one in the history list
    const sorted = [...history].sort((a, b) =>
      (a.version_number || a.VERSION_NUMBER) - (b.version_number || b.VERSION_NUMBER));
    const idx = sorted.findIndex(v => (v.version_number || v.VERSION_NUMBER) === v2Num);
    if (idx <= 0) return; // no previous version to compare with
    const v1Num = sorted[idx - 1].version_number || sorted[idx - 1].VERSION_NUMBER;
    setDiffLoading(true);
    try {
      const data = await api.getVersionDiff(userId, nodeId, v1Num, v2Num);
      setDiff({ data, v1Num, v2Num });
    } catch (e) { toast(e, 'error'); }
    finally { setDiffLoading(false); }
  }

  async function openLinkPanel(preselect = null) {
    // preselect: { nodeId, nodeTypeId, logicalId, typeName } from drag-and-drop
    setSelLinkType('');
    setSelTarget(preselect?.nodeId || '');
    setLinkLogicalId('');
    try {
      const [lts, nodes] = await Promise.all([
        api.getNodeTypeLinkTypes(userId, desc.nodeTypeId).catch(() => []),
        api.listNodes(userId).catch(() => ({})),
      ]);

      let filteredLts = Array.isArray(lts) ? lts : [];

      // If we know the target node type, restrict link types to those compatible with it
      if (preselect?.nodeTypeId) {
        const tid = preselect.nodeTypeId;
        filteredLts = filteredLts.filter(lt => {
          const ltTarget = lt.target_node_type_id || lt.TARGET_NODE_TYPE_ID;
          return !ltTarget || ltTarget === tid;
        });
        // Single match → auto-select
        if (filteredLts.length === 1) {
          setSelLinkType(filteredLts[0].id || filteredLts[0].ID);
        }
      }

      setLinkTypes(filteredLts);
      const nodeItems = Array.isArray(nodes) ? nodes : (nodes?.items ?? []);
      setAllNodes(nodeItems.filter(n => (n.id || n.ID) !== nodeId));
      setLinkPanel(true);
    } catch (e) { toast(e, 'error'); }
  }

  async function handleCreateLink() {
    if (!selLinkType || !selTarget) return;
    setLinkLoading(true);
    try {
      // Ensure an open transaction exists — auto-open one if not.
      // The tx stays OPEN after creation: the user must commit explicitly,
      // consistent with all other write operations.
      const activeTxId = txId || await onAutoOpenTx();
      if (!activeTxId) return;

      const createLinkAction = desc.actions?.find(a => a.actionCode === 'CREATE_LINK');
      if (!createLinkAction) throw new Error('CREATE_LINK action not available for this node type');

      // V2V pinning is resolved server-side by CreateLinkActionHandler
      await authoringApi.executeAction(nodeId, createLinkAction.actionCode, userId, activeTxId, {
        linkTypeId:    selLinkType,
        targetNodeId:  selTarget,
        linkLogicalId: linkLogicalId || '',
      });
      toast('Link created', 'success');
      setLinkPanel(false);
      setLinkLogicalId('');
      setPbsLoaded(false);
      await refreshTx();        // updates activeTx in store before load() reads it
      await load();             // refresh view to show OPEN version + new link
    } catch (e) {
      toast(e, 'error');
    } finally { setLinkLoading(false); }
  }

  async function handleUpdateLink(linkId, newLogicalId, newTargetNodeId) {
    const updateLinkAction = desc.actions?.find(a => a.actionCode === 'UPDATE_LINK');
    if (!updateLinkAction) return;
    setLinkActLoading(true);
    try {
      const activeTxId = txId || await onAutoOpenTx();
      if (!activeTxId) return;
      await authoringApi.executeAction(nodeId, updateLinkAction.actionCode, userId, activeTxId,
        { linkId, logicalId: newLogicalId, targetNodeId: newTargetNodeId });
      setEditingLinkId(null);
      await refreshTx();
      setPbsLoaded(false);
      await Promise.all([
        api.getChildLinks(userId, nodeId).then(c => setChildren(Array.isArray(c) ? c : [])),
        api.getParentLinks(userId, nodeId).then(p => setParents(Array.isArray(p) ? p : [])),
      ]);
      setPbsLoaded(true);
    } catch (e) { toast(e, 'error'); }
    finally { setLinkActLoading(false); }
  }

  async function handleDeleteLink(linkId) {
    const deleteLinkAction = desc.actions?.find(a => a.actionCode === 'DELETE_LINK');
    if (!deleteLinkAction) return;
    setLinkActLoading(true);
    setDeletingLinkId(null);
    try {
      const activeTxId = txId || await onAutoOpenTx();
      if (!activeTxId) return;
      await authoringApi.executeAction(nodeId, deleteLinkAction.actionCode, userId, activeTxId, { linkId });
      await refreshTx();
      setPbsLoaded(false);
      await Promise.all([
        api.getChildLinks(userId, nodeId).then(c => setChildren(Array.isArray(c) ? c : [])),
        api.getParentLinks(userId, nodeId).then(p => setParents(Array.isArray(p) ? p : [])),
      ]);
      setPbsLoaded(true);
    } catch (e) { toast(e, 'error'); }
    finally { setLinkActLoading(false); }
  }

  /**
   * Generic action executor — tx handling is fully managed by the backend
   * (ActionDispatcher reads action.tx_mode and wraps handler accordingly).
   */
  async function executeAction(action, params = {}) {
    setActionDialog(null);
    setLoading(true);
    try {
      const result = await authoringApi.executeAction(
        nodeId, action.actionCode, userId, txId, params, action.transitionId);

      if (result?.message) toast(result.message, 'success');

      await refreshAll();
      await load();
    } catch (e) {
      toast(e, 'error');
    } finally { setLoading(false); }
  }

  /** Opens the generic parameter dialog or confirmation, or executes immediately. */
  function triggerAction(action) {
    const uiParams = (action.parameters || []).filter(p => p.widget);
    if (uiParams.length > 0) {
      const defaults = {};
      uiParams.forEach(p => { if (p.default) defaults[p.name] = p.default; });
      setActionParams(defaults);
      setActionDialog(action);
    } else if (action.displayCategory === 'DANGEROUS') {
      // Dangerous actions without params get a confirmation dialog
      setActionParams({});
      setActionDialog(action);
    } else {
      executeAction(action);
    }
  }

  async function autoSave(pendingEdits, currentTxId, updateActionCode) {
    setSaveStatus('saving');
    try {
      const result = await authoringApi.executeAction(
        nodeId, updateActionCode, userId, currentTxId,
        { ...pendingEdits, _description: 'Auto-save' }
      );
      patchNodeDescAttrs(nodeId, pendingEdits);
      setEdits({});
      setSaveViolations(result?.violations || []);
      setSaveStatus('saved');
      clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaveStatus(null), 2000);
      refreshTx();
    } catch (e) {
      setSaveStatus(null);
      toast(e, 'error');
    }
  }

  function scheduleAutoSave(pendingEdits, currentTxId, updateActionCode) {
    clearTimeout(saveTimer.current);
    setSaveStatus(null);
    saveTimer.current = setTimeout(() => autoSave(pendingEdits, currentTxId, updateActionCode), 800);
  }

  // Fetch historical version description when user clicks eye icon in history table
  useEffect(() => {
    if (!viewVersionNum || !nodeId || !userId) return;
    setHistLoading(true);
    api.getNodeDescription(userId, nodeId, null, viewVersionNum)
      .then(data => setHistoricalDesc(data))
      .catch(e => toast(e, 'error'))
      .finally(() => setHistLoading(false));
  }, [viewVersionNum, nodeId, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // When in historical view, use historicalDesc for rendering; otherwise use store desc
  const activeDesc = (viewVersionNum && historicalDesc) ? historicalDesc : desc;

  const bySection = useMemo(() => (activeDesc?.attributes || []).reduce((acc, a) => {
    const s = a.section || 'General';
    if (!acc[s]) acc[s] = [];
    acc[s].push(a);
    return acc;
  }, {}), [activeDesc?.attributes]);

  if (!desc) return (
    <div className="empty" style={{ padding: '60px 24px' }}>
      <div className="empty-icon">◎</div>
      <div className="empty-text">Loading…</div>
    </div>
  );

  const isOpenVersion = activeDesc?.txStatus === 'OPEN';
  const allActions = activeDesc?.actions || [];
  // fingerprintChanged is null for committed versions; false means OPEN but no content change
  const fingerprintChanged = activeDesc?.fingerprintChanged;
  // Internal actions used programmatically (not rendered as header buttons)
  const INTERNAL_ACTIONS = new Set(['UPDATE_NODE', 'CREATE_LINK', 'UPDATE_LINK', 'DELETE_LINK', 'READ', 'COMMENT', 'BASELINE', 'MANAGE_METAMODEL', 'MANAGE_ROLES', 'MANAGE_BASELINES']);
  const updateNodeAction = allActions.find(a => a.actionCode === 'UPDATE_NODE' && a.authorized !== false);
  // Visible header actions: authorized, non-internal, non-structural
  const headerActions = allActions.filter(a =>
    a.authorized !== false && !INTERNAL_ACTIONS.has(a.actionCode) && a.displayCategory !== 'STRUCTURAL'
  );
  // Guard violation helpers
  const guardBlocked = (action) => action?.guardViolations?.length > 0;
  const guardTooltip = (action) => {
    const v = action?.guardViolations;
    if (!v?.length) return '';
    return 'Blocked:\n\u2022 ' + v.map(x => typeof x === 'string' ? x : x.message || x.guardCode).join('\n\u2022 ');
  };
  // Guard violation map for LifecycleDiagram: includes unauthorized transitions too
  const allTransitions    = allActions.filter(a => a.actionCode === 'TRANSITION');
  const transitionGuardViolations = new Map(
    allTransitions
      .filter(a => a.guardViolations?.length > 0)
      .map(a => [a.name, a.guardViolations])
  );
  // Available (unblocked) transition names for lifecycle diagram
  const transitions = headerActions.filter(a => a.actionCode === 'TRANSITION');
  const canUpdateLink     = activeDesc?.actions?.some(a => a.actionCode === 'UPDATE_LINK');
  const canDeleteLink     = activeDesc?.actions?.some(a => a.actionCode === 'DELETE_LINK');
  const hasLinkActions    = canUpdateLink || canDeleteLink;

  // Lifecycle ID for diagram — resolved from node type
  const lifecycleId = activeDesc?.lifecycleId || null;

  // Node type appearance
  const nt          = activeDesc?.nodeTypeId ? (nodeTypes || []).find(t => (t.id || t.ID) === activeDesc.nodeTypeId) : null;
  const ntColor     = nt?.color || nt?.COLOR || null;
  const ntIconName  = nt?.icon  || nt?.ICON  || null;
  const NtIcon      = ntIconName ? NODE_ICONS[ntIconName] : null;
  const ntName      = nt?.name  || nt?.NAME  || null;

  // Current version number from store desc (for highlighting in history table)
  const currentVersionNum = history.find(
    v => (v.id || v.ID) === desc?.currentVersionId
  )?.version_number ?? null;


  return (
    <div onClick={() => attrCtxMenu && setAttrCtxMenu(null)}>
      {/* ── Attribute context menu ───────────────────── */}
      {attrCtxMenu && ReactDOM.createPortal(
        <div
          className="attr-ctx-menu"
          style={{ top: attrCtxMenu.y, left: attrCtxMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="attr-ctx-item"
            onClick={() => {
              onCommentAttribute?.(attrCtxMenu.attrId, attrCtxMenu.attrLabel);
              setAttrCtxMenu(null);
            }}
          >
            💬 Comment on <code>#{attrCtxMenu.attrId}</code>
          </button>
        </div>,
        document.body,
      )}
      {/* ── Node header ─────────────────────────────── */}
      <div className="node-header">
        <div className="node-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Node type badge */}
            {(NtIcon || ntColor || ntName) && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: ntColor ? `${ntColor}18` : 'rgba(100,116,139,.1)',
                border: `1px solid ${ntColor ? `${ntColor}30` : 'rgba(100,116,139,.2)'}`,
                borderRadius: 4, padding: '2px 7px', fontSize: 11, color: ntColor || 'var(--muted)',
                fontWeight: 600, letterSpacing: '.01em', flexShrink: 0,
              }}>
                {NtIcon
                  ? <NtIcon size={11} color={ntColor || 'var(--muted)'} strokeWidth={2} />
                  : ntColor
                    ? <span style={{ width: 7, height: 7, borderRadius: 1, background: ntColor, display: 'inline-block' }} />
                    : null
                }
                {ntName}
              </span>
            )}
            <span className="node-identity">{activeDesc.logicalId || activeDesc.identity}</span>
            {activeDesc.displayName && (
              <span className="node-display-name">{activeDesc.displayName}</span>
            )}
            <span style={{
              fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600,
              padding: '2px 7px', borderRadius: 4, letterSpacing: '.01em',
              color: viewVersionNum ? '#92400e' : 'var(--muted)',
              background: viewVersionNum ? 'rgba(251,191,36,.25)' : 'rgba(100,116,139,.1)',
              border: viewVersionNum ? '1px solid rgba(251,191,36,.5)' : 'none',
            }}>
              {viewVersionNum && '🕐 '}
              {activeDesc.iteration === 0 ? activeDesc.revision : `${activeDesc.revision}.${activeDesc.iteration}`}
            </span>
            <StatePill stateId={activeDesc.state} stateName={activeDesc.stateName} stateColorMap={stateColorMap} />
            {!viewVersionNum && desc.lock?.locked && (
              <span className="pill" style={{ color: 'var(--muted)', background: 'rgba(100,116,139,.1)', border: '1px solid rgba(100,116,139,.2)' }}>
                🔒 {desc.lock.lockedBy}
              </span>
            )}
          </div>
          <div className="node-meta">
            {isOpenVersion && activeDesc?.lock?.lockedBy === userId && (
              <span className="pill" style={{ color: 'var(--warn)', background: 'rgba(232,169,71,.1)', border: '1px solid rgba(232,169,71,.25)' }}>
                ✎ editing
              </span>
            )}
            {isOpenVersion && activeDesc?.lock?.lockedBy === userId && (
              <span style={{ fontSize: 11, color: 'var(--warn)', fontStyle: 'italic', opacity: 0.85 }}>
                ⚡ uncommitted changes
              </span>
            )}
            {isOpenVersion && activeDesc?.lock?.lockedBy && activeDesc?.lock?.lockedBy !== userId && (
              <span style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic', opacity: 0.9 }}>
                ✎ in progress — being edited by {activeDesc.lock.lockedBy}
              </span>
            )}
            {saveStatus === 'saving' && (
              <span style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>saving…</span>
            )}
            {saveStatus === 'saved' && saveViolations.length === 0 && (
              <span style={{ fontSize: 11, color: 'var(--success)' }}>✓ saved</span>
            )}
            {saveStatus === 'saved' && saveViolations.length > 0 && (
              <span style={{ fontSize: 11, color: 'var(--warn)' }}>⚠ saved with issues</span>
            )}
          </div>
        </div>

        <div className="node-actions">
          {headerActions.map(a => {
            const isBlocked = guardBlocked(a);
            const tooltip   = guardTooltip(a);
            const color     = a.displayColor; // handler-provided color override
            const catClass  = color ? ''
                            : a.displayCategory === 'DANGEROUS' ? 'btn-danger'
                            : a.displayCategory === 'PRIMARY'   ? 'btn-success'
                            : '';
            const colorStyle = !isBlocked && color
              ? { color, borderColor: `${color}60`, background: `${color}15` }
              : undefined;

            return (
              <button
                key={a.id}
                className={`btn btn-sm ${isBlocked ? '' : catClass}`}
                disabled={loading || isBlocked}
                title={tooltip}
                style={isBlocked ? { opacity: 0.45, cursor: 'not-allowed' } : colorStyle}
                onClick={() => !isBlocked && triggerAction(a)}
              >
                {isBlocked ? `✕ ${a.name}` : a.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Generic action parameter dialog */}
      {actionDialog && ReactDOM.createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setActionDialog(null)}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '28px 32px', maxWidth: 440, width: '90%',
            boxShadow: '0 8px 32px rgba(0,0,0,.4)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{actionDialog.name}</div>
            {(actionDialog.parameters || []).filter(p => p.widget).map(p => {
              const val = actionParams[p.name] || '';
              let enumValues = null;
              if (p.type === 'ENUM' || p.widget === 'DROPDOWN') {
                try { enumValues = JSON.parse(p.allowedValues || '[]'); } catch { enumValues = []; }
              }
              return (
                <div className="field" key={p.name} style={{ marginBottom: 14 }}>
                  <label className="field-label">
                    {p.label || p.name}
                    {p.required && <span className="field-req">*</span>}
                  </label>
                  {enumValues ? (
                    <select
                      className="field-input"
                      value={val}
                      onChange={e => setActionParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                    >
                      {!val && <option value="">—</option>}
                      {enumValues.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  ) : p.widget === 'TEXTAREA' ? (
                    <textarea
                      className="field-input"
                      rows={3}
                      placeholder={p.tooltip || ''}
                      value={val}
                      onChange={e => setActionParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                      style={{ resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      className="field-input"
                      placeholder={p.tooltip || ''}
                      value={val}
                      onChange={e => setActionParams(prev => ({ ...prev, [p.name]: e.target.value }))}
                      autoFocus={p.displayOrder === 1 || p.displayOrder == null}
                    />
                  )}
                </div>
              );
            })}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-sm" onClick={() => setActionDialog(null)}>Cancel</button>
              <button
                className="btn btn-sm btn-success"
                disabled={
                  (actionDialog.parameters || []).filter(p => p.widget && p.required).some(p => !actionParams[p.name]?.trim?.())
                }
                onClick={() => executeAction(actionDialog, actionParams)}
              >
                {actionDialog.name}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}


      {/* Validation violations from last save (dry-run) */}
      {saveViolations.length > 0 && (
        <div className="violations-banner">
          <span className="violations-banner-title">⚠ Will fail at commit:</span>
          <ul className="violations-banner-list">
            {saveViolations.map((v, i) => <li key={i}>{v}</li>)}
          </ul>
        </div>
      )}

      {/* ── Sub-tabs ─────────────────────────────────── */}
      <div className="subtabs">
        {[
          { key: 'attributes',  label: 'Properties' },
          { key: 'pbs',         label: 'PBS',        count: pbsLoaded ? children.length + parents.length : undefined },
          { key: 'signatures',  label: 'Signatures',  count: sigs.length },
          { key: 'history',     label: 'History',     count: history.length },
        ].map(({ key, label, count }) => (
          <div
            key={key}
            className={`subtab ${activeSubTab === key ? 'active' : ''}`}
            onClick={() => onSubTabChange(key)}
          >
            {label}
            {count > 0 && (
              <span className="subtab-badge" style={{
                background: key === 'signatures' ? 'rgba(86,209,142,.15)' : 'rgba(91,156,246,.15)',
                color: key === 'signatures' ? 'var(--success)' : 'var(--accent)',
              }}>
                {count}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* ── Historical view banner ────────────────────── */}
      {viewVersionNum && (
        <div style={{
          background: 'rgba(251,191,36,.1)', border: '1px solid rgba(251,191,36,.4)',
          borderRadius: 4, padding: '7px 12px', margin: '8px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12,
        }}>
          <span style={{ color: '#92400e' }}>
            🕐 Historical view — Version {viewVersionNum}
            {historicalDesc && ` (${historicalDesc.iteration === 0 ? historicalDesc.revision : `${historicalDesc.revision}.${historicalDesc.iteration}`})`}
            {histLoading && ' — loading…'}
            {' · read-only'}
          </span>
          <button className="btn btn-sm" onClick={() => { setViewVersionNum(null); setHistoricalDesc(null); }}>
            ← Back to latest
          </button>
        </div>
      )}

      {/* ── Attributes ───────────────────────────────── */}
      {activeSubTab === 'attributes' && (
        <div>
          {Object.entries(bySection).map(([section, attrs]) => (
            <div key={section}>
              <div className="section-label">{section}</div>
              <div className="attr-grid">
                {[...attrs].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).map(attr => {
                  const currentVal = edits[attr.id] !== undefined ? edits[attr.id] : (attr.value || '');
                  const isEditable = attr.editable && !!txId && isOpenVersion;
                  const enumValues = attr.type === 'ENUM' && attr.allowedValues
                    ? (() => { try { return JSON.parse(attr.allowedValues); } catch { return []; } })()
                    : null;

                  // Inline validation state
                  const regexViolation = attr.namingRegex && edits[attr.id] != null &&
                    edits[attr.id] !== '' && !new RegExp(attr.namingRegex).test(edits[attr.id]);
                  const requiredViolation = attr.required && edits[attr.id] === '';
                  const enumViolation = enumValues && edits[attr.id] != null &&
                    edits[attr.id] !== '' && !enumValues.includes(edits[attr.id]);

                  return (
                    <div
                      className="field"
                      key={attr.id}
                      onContextMenu={e => {
                        e.preventDefault();
                        setAttrCtxMenu({ attrId: attr.id, attrLabel: attr.label, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <label className="field-label">
                        {attr.label}
                        {attr.required && <span className="field-req">*</span>}
                      </label>
                      {enumValues && isEditable ? (
                        <select
                          className="field-input"
                          title={attr.tooltip || undefined}
                          value={currentVal}
                          onChange={e => {
                            const newEdits = { ...edits, [attr.id]: e.target.value };
                            setEdits(newEdits);
                            scheduleAutoSave(newEdits, txId, updateNodeAction?.actionCode);
                          }}
                        >
                          <option value="">—</option>
                          {enumValues.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      ) : (
                        <input
                          className={`field-input${requiredViolation || enumViolation ? ' error' : ''}`}
                          readOnly={!isEditable}
                          title={attr.tooltip || undefined}
                          value={currentVal}
                          onChange={e => {
                            if (!isEditable) return;
                            const newEdits = { ...edits, [attr.id]: e.target.value };
                            setEdits(newEdits);
                            scheduleAutoSave(newEdits, txId, updateNodeAction?.actionCode);
                          }}
                        />
                      )}
                      {regexViolation && (
                        <span className="field-hint warn">Format: {attr.namingRegex}</span>
                      )}
                      {requiredViolation && (
                        <span className="field-hint error">Required</span>
                      )}
                      {enumViolation && (
                        <span className="field-hint error">Value not in allowed list</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PBS ─────────────────────────────────────── */}
      {activeSubTab === 'pbs' && (
        <div
          className={isDragOver ? 'pbs-drop-zone drag-over' : 'pbs-drop-zone'}
          onDragEnter={e => {
            if (!getDraggedNode()) return;
            e.preventDefault();
            dragCounter.current++;
            setIsDragOver(true);
          }}
          onDragOver={e => {
            if (!getDraggedNode()) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = 'link';
          }}
          onDragLeave={e => {
            if (dragCounter.current > 0) dragCounter.current--;
            if (dragCounter.current === 0) setIsDragOver(false);
          }}
          onDrop={e => {
            e.preventDefault();
            dragCounter.current = 0;
            setIsDragOver(false);
            const data = getDraggedNode();
            clearDraggedNode();
            if (!data) return;
            if (!desc?.actions?.some(a => a.actionCode === 'CREATE_LINK')) {
              toast('You do not have write permission on this node', 'error');
              return;
            }
            if (data.nodeId && data.nodeId !== nodeId) {
              openLinkPanel(data);
            }
          }}
        >
          {/* Drag hint overlay */}
          {isDragOver && (
            <div className="pbs-drop-hint">Drop to create a link</div>
          )}

          {/* Add link button */}
          {activeDesc.actions?.some(a => a.actionCode === 'CREATE_LINK') && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
              <button className="btn btn-sm" onClick={() => linkPanel ? setLinkPanel(false) : openLinkPanel()}>
                {linkPanel ? '✕ Cancel' : '+ Add link'}
              </button>
            </div>
          )}

          {/* Link creation panel */}
          {linkPanel && (() => {
            const selectedLt     = linkTypes.find(lt => (lt.id || lt.ID) === selLinkType);
            const ltPolicy       = selectedLt?.link_policy || selectedLt?.LINK_POLICY || null;
            const ltIdLabel      = selectedLt?.link_logical_id_label  || selectedLt?.LINK_LOGICAL_ID_LABEL  || 'Link ID';
            const ltIdPattern    = selectedLt?.link_logical_id_pattern || selectedLt?.LINK_LOGICAL_ID_PATTERN || null;
            const patternOk      = !ltIdPattern || !linkLogicalId || new RegExp(`^(?:${ltIdPattern})$`).test(linkLogicalId);
            return (
              <div ref={linkPanelRef} className="link-panel" style={{ flexWrap: 'wrap', rowGap: 6 }}>
                {!txId && (
                  <div style={{ width: '100%', fontSize: 11, color: 'var(--warn)', marginBottom: 2 }}>
                    ⚡ No active transaction — one will be opened automatically on create
                  </div>
                )}

                {/* Row 1: link type + target + policy badge */}
                <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'flex-end' }}>
                  <div className="field" style={{ margin: 0, flex: '0 0 180px' }}>
                    <label className="field-label">Link type</label>
                    <select
                      className="field-input"
                      value={selLinkType}
                      onChange={e => { setSelLinkType(e.target.value); setLinkLogicalId(''); }}
                    >
                      <option value="">— select —</option>
                      {linkTypes.map(lt => (
                        <option key={lt.id || lt.ID} value={lt.id || lt.ID}>
                          {lt.name || lt.NAME}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field" style={{ margin: 0, flex: 1 }}>
                    <label className="field-label">Target node</label>
                    <select
                      className="field-input"
                      value={selTarget}
                      onChange={e => setSelTarget(e.target.value)}
                    >
                      <option value="">— select —</option>
                      {allNodes.map(n => {
                        const nid  = n.id  || n.ID;
                        const lid  = n.logical_id  || n.LOGICAL_ID  || '';
                        const type = n.node_type_name || n.NODE_TYPE_NAME || '';
                        const rev  = n.revision  || n.REVISION  || '';
                        const iter = n.iteration ?? n.ITERATION ?? '';
                        return (
                          <option key={nid} value={nid}>
                            {lid || nid.slice(0, 8)} — {type} {iter === 0 ? rev : `${rev}.${iter}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {ltPolicy && (
                    <div className="field" style={{ margin: 0, flexShrink: 0 }}>
                      <label className="field-label">Policy</label>
                      <span
                        className="hist-type-badge"
                        data-type={ltPolicy}
                        style={{ display: 'inline-block', padding: '4px 8px', fontSize: 11 }}
                        title={ltPolicy === 'VERSION_TO_VERSION' ? 'Pinned to current version' : 'Always latest version'}
                      >
                        {ltPolicy === 'VERSION_TO_VERSION' ? 'V2V' : 'V2M'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Row 2: link logical id + create button */}
                <div style={{ display: 'flex', gap: 8, width: '100%', alignItems: 'flex-end' }}>
                  <div className="field" style={{ margin: 0, flex: 1 }}>
                    <label className="field-label">
                      {ltIdLabel}
                      {ltIdPattern && (
                        <span style={{ marginLeft: 6, opacity: .55, fontWeight: 400, fontSize: 10 }}>
                          pattern: {ltIdPattern}
                        </span>
                      )}
                    </label>
                    <input
                      className="field-input"
                      style={{ borderColor: (!linkLogicalId || !patternOk) && selLinkType ? 'var(--danger, #e05252)' : undefined }}
                      type="text"
                      placeholder={ltIdLabel}
                      value={linkLogicalId}
                      onChange={e => setLinkLogicalId(e.target.value)}
                    />
                    {linkLogicalId && !patternOk && (
                      <div style={{ fontSize: 10, color: 'var(--danger, #e05252)', marginTop: 2 }}>
                        Does not match pattern: {ltIdPattern}
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ alignSelf: 'flex-end' }}
                    disabled={!selLinkType || !selTarget || !linkLogicalId || !patternOk || linkLoading}
                    onClick={handleCreateLink}
                  >
                    {linkLoading ? '…' : 'Create'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* BOM section */}
          <div className="section-label" style={{ marginTop: 16 }}>BOM — Children</div>
          {!pbsLoaded ? (
            <div className="empty" style={{ padding: '24px' }}>
              <div className="empty-icon">◎</div>
              <div className="empty-text">Loading…</div>
            </div>
          ) : children.length === 0 ? (
            <div className="empty" style={{ padding: '24px' }}>
              <div className="empty-icon">◌</div>
              <div className="empty-text">No child links</div>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Link type</th>
                  <th>Link ID</th>
                  <th>Node type</th>
                  <th>Identity</th>
                  <th>Rev</th>
                  <th>State</th>
                  <th>Policy</th>
                  {hasLinkActions && <th></th>}
                </tr>
              </thead>
              <tbody>
                {children.map(c => {
                  const isEditing  = editingLinkId  === c.linkId;
                  const isDeleting = deletingLinkId === c.linkId;
                  return (
                    <tr key={c.linkId}>
                      <td style={{ fontWeight: 600, fontSize: 12 }}>{c.linkTypeName}</td>
                      <td style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>
                        {isEditing ? (
                          <input
                            className="field-input"
                            style={{ padding: '2px 6px', fontSize: 12, width: 120 }}
                            value={editLinkLogId}
                            onChange={e => setEditLinkLogId(e.target.value)}
                            autoFocus
                          />
                        ) : c.linkLogicalId
                          ? <span title={c.linkLogicalIdLabel}>{c.linkLogicalId}</span>
                          : <span style={{ opacity: .35 }}>—</span>}
                      </td>
                      <td style={{ color: 'var(--muted)', fontSize: 12 }}>{c.targetNodeType}</td>
                      <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>
                        {isEditing ? (
                          <select
                            className="field-input"
                            style={{ padding: '2px 4px', fontSize: 12, minWidth: 120 }}
                            value={editLinkTargetId}
                            onChange={e => setEditLinkTargetId(e.target.value)}
                          >
                            {allNodes.map(n => {
                              const nid = n.id || n.ID;
                              const lid = n.logical_id || n.LOGICAL_ID || nid.slice(0, 8);
                              const typ = n.node_type_name || n.NODE_TYPE_NAME || '';
                              return <option key={nid} value={nid}>{lid} {typ && `(${typ})`}</option>;
                            })}
                          </select>
                        ) : (
                          c.targetLogicalId || <span style={{ opacity: .4 }}>{c.targetNodeId?.slice(0, 8)}…</span>
                        )}
                      </td>
                      <td style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 12 }}>
                        {c.linkPolicy === 'VERSION_TO_MASTER'
                          ? <span style={{ opacity: .35 }}>—</span>
                          : `${c.targetRevision}.${c.targetIteration}`}
                      </td>
                      <td><StatePill stateId={c.targetState} stateName={c.targetStateName} stateColorMap={stateColorMap} /></td>
                      <td>
                        <span className="hist-type-badge" data-type={c.linkPolicy} style={{ fontSize: 10 }}>
                          {c.linkPolicy === 'VERSION_TO_MASTER' ? 'V2M' : 'V2V'}
                        </span>
                      </td>
                      {hasLinkActions && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {isDeleting ? (
                            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--danger, #e05252)', marginRight: 2 }}>Delete?</span>
                              <button className="btn btn-sm btn-danger"
                                style={{ padding: '1px 6px', fontSize: 11 }}
                                disabled={linkActLoading}
                                onClick={() => handleDeleteLink(c.linkId)}>✓</button>
                              <button className="btn btn-sm"
                                style={{ padding: '1px 6px', fontSize: 11 }}
                                onClick={() => setDeletingLinkId(null)}>✕</button>
                            </span>
                          ) : isEditing ? (
                            <span style={{ display: 'flex', gap: 4 }}>
                              <button className="btn btn-sm btn-success"
                                style={{ padding: '1px 6px', fontSize: 11 }}
                                disabled={linkActLoading || !editLinkTargetId}
                                onClick={() => handleUpdateLink(c.linkId, editLinkLogId, editLinkTargetId)}>✓</button>
                              <button className="btn btn-sm"
                                style={{ padding: '1px 6px', fontSize: 11 }}
                                onClick={() => setEditingLinkId(null)}>✕</button>
                            </span>
                          ) : (
                            <span style={{ display: 'flex', gap: 4 }}>
                              {canUpdateLink && (
                                <button className="btn btn-sm"
                                  style={{ padding: '1px 6px', fontSize: 11 }}
                                  title="Edit link"
                                  onClick={async () => {
                                    setEditingLinkId(c.linkId);
                                    setEditLinkLogId(c.linkLogicalId || '');
                                    setEditLinkTargetId(c.targetNodeId || '');
                                    setDeletingLinkId(null);
                                    if (allNodes.length === 0) {
                                      const nodesResp = await api.listNodes(userId).catch(() => ({}));
                                      const nodeItems = Array.isArray(nodesResp) ? nodesResp : (nodesResp?.items ?? []);
                                      setAllNodes(nodeItems.filter(n => (n.id || n.ID) !== nodeId));
                                    }
                                  }}>
                                  ✎
                                </button>
                              )}
                              {canDeleteLink && (
                                <button className="btn btn-sm"
                                  style={{ padding: '1px 6px', fontSize: 11, color: 'var(--danger, #e05252)' }}
                                  title="Delete link"
                                  onClick={() => { setDeletingLinkId(c.linkId); setEditingLinkId(null); }}>
                                  ✕
                                </button>
                              )}
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Where Used section */}
          <div className="section-label" style={{ marginTop: 24 }}>Where Used — Parents</div>
          {!pbsLoaded ? (
            <div className="empty" style={{ padding: '24px' }}>
              <div className="empty-icon">◎</div>
              <div className="empty-text">Loading…</div>
            </div>
          ) : parents.length === 0 ? (
            <div className="empty" style={{ padding: '24px' }}>
              <div className="empty-icon">◌</div>
              <div className="empty-text">Not used anywhere</div>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Link type</th>
                  <th>Link ID</th>
                  <th>Node type</th>
                  <th>Identity</th>
                  <th>Rev</th>
                  <th>State</th>
                  <th>Policy</th>
                </tr>
              </thead>
              <tbody>
                {parents.map(p => (
                  <tr key={p.linkId}>
                    <td style={{ fontWeight: 600, fontSize: 12 }}>{p.linkTypeName}</td>
                    <td style={{ fontFamily: 'var(--sans)', fontSize: 12 }}>
                      {p.linkLogicalId
                        ? <span title={p.linkLogicalIdLabel}>{p.linkLogicalId}</span>
                        : <span style={{ opacity: .35 }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{p.sourceNodeType}</td>
                    <td style={{ fontFamily: 'var(--sans)', fontSize: 13 }}>
                      {p.sourceLogicalId || <span style={{ opacity: .4 }}>{p.sourceNodeId?.slice(0, 8)}…</span>}
                    </td>
                    <td style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 12 }}>
                      {p.linkPolicy === 'VERSION_TO_MASTER'
                        ? <span style={{ opacity: .35 }}>—</span>
                        : `${p.sourceRevision}.${p.sourceIteration}`}
                    </td>
                    <td><StatePill stateId={p.sourceState} stateName={p.sourceStateName} stateColorMap={stateColorMap} /></td>
                    <td>
                      <span className="hist-type-badge" data-type={p.linkPolicy} style={{ fontSize: 10 }}>
                        {p.linkPolicy === 'VERSION_TO_MASTER' ? 'V2M' : 'V2V'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Signatures ───────────────────────────────── */}
      {activeSubTab === 'signatures' && (
        <div>
          {sigs.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">✦</div>
              <div className="empty-text">No signatures on this revision</div>
            </div>
          ) : sigs.map((s, i) => (
            <div key={i} className="sig-item">
              <span className="sig-meaning">{s.meaning || s.MEANING}</span>
              <span className="sig-by">{s.signed_by || s.SIGNED_BY || s.signedBy}</span>
              <span className="sig-comment">{s.comment || s.COMMENT || ''}</span>
            </div>
          ))}

        </div>
      )}

      {/* ── History + Lifecycle ───────────────────────── */}
      {activeSubTab === 'history' && (
        <div>
          {/* Lifecycle diagram on top */}
          <div className="history-lc-section">
            <div className="history-lc-label">
              Lifecycle
            </div>
            <LifecycleDiagram
              lifecycleId={activeDesc.lifecycleId}
              currentStateId={activeDesc.state}
              userId={userId}
              availableTransitionNames={new Set(
                transitions.filter(a => !a.guardViolations?.length).map(a => a.name)
              )}
              transitionGuardViolations={transitionGuardViolations}
              onTransition={lcTransition => {
                const tName = lcTransition.name || lcTransition.NAME || '';
                const action = transitions.find(a => a.name === tName);
                if (action && !action.guardViolations?.length) triggerAction(action);
              }}
            />
          </div>

          {/* Divider */}
          <div className="history-lc-divider">
            <span>Version history</span>
          </div>

          {/* History table below */}
          {history.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◌</div>
              <div className="empty-text">No history yet</div>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Rev</th>
                  <th>State</th>
                  <th>Type</th>
                  <th>Commit message</th>
                  <th>By</th>
                  <th>Date</th>
                  <th>Fingerprint</th>
                  <th>TX</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((v, i, arr) => {
                  const fp       = v.fingerprint || v.FINGERPRINT || null;
                  const rowTxId  = v.tx_id || v.TX_ID || null;
                  const prevFp   = arr[i + 1] ? (arr[i + 1].fingerprint || arr[i + 1].FINGERPRINT) : null;
                  const prevTx   = arr[i + 1] ? (arr[i + 1].tx_id || arr[i + 1].TX_ID) : null;
                  const fpChanged = fp && prevFp && fp !== prevFp;
                  const fpNew     = fp && !prevFp;
                  const date   = v.committed_at || v.COMMITTED_AT;
                  const vNum   = v.version_number || v.VERSION_NUMBER;
                  const isPending = (v.tx_status || v.TX_STATUS) === 'OPEN';
                  const isFirst   = i === arr.length - 1; // oldest in reversed list
                  const isActiveHistorical = viewVersionNum === vNum;
                  return (
                    <tr key={vNum} className={[isPending ? 'pending-row' : '', isActiveHistorical ? 'historical-row' : ''].filter(Boolean).join(' ') || undefined}>
                      <td>
                        <span className="ver-num">{vNum}</span>
                        {isPending && <span className="pending-badge">pending</span>}
                      </td>
                      <td style={{ fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 12 }}>
                        {(v.iteration ?? v.ITERATION) === 0 ? (v.revision || v.REVISION) : `${v.revision || v.REVISION}.${v.iteration ?? v.ITERATION}`}
                      </td>
                      <td>
                        <span className="hist-state">
                          {v.state_name || v.STATE_NAME || '—'}
                        </span>
                      </td>
                      <td>
                        {isPending ? (
                          <span className="hist-type-badge" data-type={v.change_type || v.CHANGE_TYPE} style={{ opacity: .6 }}>
                            {v.change_type || v.CHANGE_TYPE}
                          </span>
                        ) : (
                          <span className="hist-type-badge" data-type={v.change_type || v.CHANGE_TYPE}>
                            {v.change_type || v.CHANGE_TYPE}
                          </span>
                        )}
                      </td>
                      <td className="hist-comment" title={v.tx_comment || v.TX_COMMENT || ''}>
                        {isPending
                          ? <span style={{ color: 'var(--warn)', fontStyle: 'italic', opacity: .7 }}>uncommitted</span>
                          : (v.tx_comment || v.TX_COMMENT || <span style={{ opacity: .4 }}>—</span>)
                        }
                      </td>
                      <td className="hist-by">
                        {v.created_by || v.CREATED_BY || v.tx_owner || '—'}
                      </td>
                      <td className="hist-date">
                        {isPending
                          ? <span style={{ color: 'var(--warn)', fontStyle: 'italic' }}>—</span>
                          : (date ? new Date(date).toLocaleDateString() : '—')
                        }
                      </td>
                      <td>
                        {fp ? (
                          <span
                            className="hist-fp"
                            title={fp}
                            style={{ color: isPending ? 'var(--warn)' : (fpNew || fpChanged ? 'var(--success)' : 'var(--muted2)'), opacity: isPending ? .6 : 1 }}
                          >
                            {fp.slice(0, 8)}…
                          </span>
                        ) : <span style={{ opacity: .3 }}>—</span>}
                      </td>
                      <td>
                        {rowTxId ? (
                          <span
                            className="hist-fp"
                            title={rowTxId}
                            style={{ color: isPending ? 'var(--warn)' : (rowTxId !== prevTx ? 'var(--accent)' : 'var(--muted2)'), fontFamily: 'var(--mono)', opacity: isPending ? .6 : 1 }}
                          >
                            {rowTxId.slice(0, 8)}…
                          </span>
                        ) : <span style={{ opacity: .3 }}>—</span>}
                      </td>
                      <td style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {/* Left group: diff + comment indicators */}
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {!isFirst && (isPending || (v.change_type || v.CHANGE_TYPE) === 'CONTENT') && (
                            <button
                              className="btn-diff"
                              title={`Diff v${arr[i + 1]?.version_number || arr[i + 1]?.VERSION_NUMBER} → v${vNum}${isPending ? ' (pending)' : ''}`}
                              disabled={diffLoading}
                              onClick={() => openDiff(vNum)}
                            >
                              ⊕ diff
                            </button>
                          )}
                          {(() => {
                            const vid = v.id || v.ID;
                            const cnt = vid ? (versionCommentCounts[vid] || 0) : 0;
                            return cnt > 0 && onOpenCommentsForVersion ? (
                              <button
                                className="btn-diff"
                                title={`${cnt} comment${cnt > 1 ? 's' : ''} on this version`}
                                onClick={() => onOpenCommentsForVersion(vid)}
                                style={{ color: 'var(--accent)' }}
                              >
                                💬 {cnt}
                              </button>
                            ) : null;
                          })()}
                        </div>
                        {/* View button: always far right */}
                        <div style={{ marginLeft: 'auto' }}>
                          {!isPending && vNum !== currentVersionNum && (
                            <button
                              className="btn-diff"
                              title={isActiveHistorical ? 'Exit historical view' : `View node at version ${vNum}`}
                              style={{ opacity: isActiveHistorical ? 1 : 0.6, background: isActiveHistorical ? 'rgba(251,191,36,.2)' : undefined }}
                              onClick={() => {
                                if (isActiveHistorical) {
                                  setViewVersionNum(null);
                                  setHistoricalDesc(null);
                                } else {
                                  setViewVersionNum(vNum);
                                  setHistoricalDesc(null);
                                }
                              }}
                            >
                              👁
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Diff modal ────────────────────────────────── */}
      {diff && (
        <DiffModal
          diff={diff.data}
          v1Num={diff.v1Num}
          v2Num={diff.v2Num}
          onClose={() => setDiff(null)}
          stateColorMap={stateColorMap}
        />
      )}
    </div>
  );
}

/* ── DiffModal ─────────────────────────────────────────────────── */

function DiffModal({ diff, v1Num, v2Num, onClose, stateColorMap }) {
  const { v1, v2, attributeDiff, stateChanged, linkDiff = [] } = diff;

  const changedAttrs   = attributeDiff.filter(a => a.changed);
  const unchangedAttrs = attributeDiff.filter(a => !a.changed);

  const addedLinks     = linkDiff.filter(l => l.status === 'ADDED');
  const removedLinks   = linkDiff.filter(l => l.status === 'REMOVED');
  const unchangedLinks = linkDiff.filter(l => l.status === 'UNCHANGED');
  const changedLinks   = [...addedLinks, ...removedLinks];

  return (
    <div className="diff-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="diff-modal">
        <div className="diff-header">
          <span className="diff-title">
            Diff — v{v1Num} → v{v2Num}
          </span>
          <button className="diff-close" onClick={onClose}>✕</button>
        </div>

        {/* Version meta row */}
        <div className="diff-meta-row">
          <div className="diff-meta-cell diff-meta-old">
            <div className="diff-meta-label">Version {v1Num}</div>
            <div className="diff-meta-rev">{v1.iteration === 0 ? v1.revision : `${v1.revision}.${v1.iteration}`}</div>
            <StatePill stateId={v1.lifecycleStateId} stateColorMap={stateColorMap} />
            <span className="hist-type-badge" data-type={v1.changeType} style={{ marginLeft: 6 }}>{v1.changeType}</span>
            <div className="diff-meta-sub">{v1.createdBy} · {v1.txComment || '—'}</div>
          </div>
          <div className="diff-arrow">→</div>
          <div className="diff-meta-cell diff-meta-new" style={!v2.committedAt ? { borderColor: 'rgba(232,169,71,.35)', background: 'rgba(232,169,71,.05)' } : undefined}>
            <div className="diff-meta-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              Version {v2Num}
              {!v2.committedAt && <span className="pending-badge">pending</span>}
            </div>
            <div className="diff-meta-rev">{v2.iteration === 0 ? v2.revision : `${v2.revision}.${v2.iteration}`}</div>
            <StatePill stateId={v2.lifecycleStateId} stateColorMap={stateColorMap} />
            <span className="hist-type-badge" data-type={v2.changeType} style={{ marginLeft: 6 }}>{v2.changeType}</span>
            <div className="diff-meta-sub">{v2.createdBy} · {v2.txComment || <em style={{ opacity: .5 }}>uncommitted</em>}</div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="diff-body">
          {/* State change banner */}
          {stateChanged && (
            <div className="diff-state-change">
              <span style={{ opacity: .7 }}>State changed:</span>{' '}
              <StatePill stateId={v1.lifecycleStateId} stateColorMap={stateColorMap} />
              {' '}→{' '}
              <StatePill stateId={v2.lifecycleStateId} stateColorMap={stateColorMap} />
            </div>
          )}

          {/* Changed attributes */}
          {changedAttrs.length === 0 && !stateChanged ? (
            <div className="diff-no-changes">No attribute changes between these versions.</div>
          ) : (
            <div className="diff-attr-section">
              <div className="diff-section-title">Changed attributes ({changedAttrs.length})</div>
              {changedAttrs.length === 0 ? (
                <div className="diff-empty-section">None</div>
              ) : (
                <table className="diff-table">
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      <th className="diff-old-col">Before (v{v1Num})</th>
                      <th className="diff-new-col">After (v{v2Num})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {changedAttrs.map(attr => (
                      <tr key={attr.name} className="diff-row-changed">
                        <td className="diff-attr-name">{attr.label || attr.name}</td>
                        <td className="diff-val diff-val-old">
                          {attr.v1Value !== '' ? attr.v1Value : <span className="diff-empty">—</span>}
                        </td>
                        <td className="diff-val diff-val-new">
                          {attr.v2Value !== '' ? attr.v2Value : <span className="diff-empty">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Unchanged attributes (collapsed by default) */}
          {unchangedAttrs.length > 0 && (
            <details className="diff-unchanged-details">
              <summary className="diff-section-title" style={{ cursor: 'pointer' }}>
                Unchanged attributes ({unchangedAttrs.length})
              </summary>
              <table className="diff-table" style={{ marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Attribute</th>
                    <th colSpan={2}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {unchangedAttrs.map(attr => (
                    <tr key={attr.name} className="diff-row-unchanged">
                      <td className="diff-attr-name">{attr.label || attr.name}</td>
                      <td className="diff-val" colSpan={2} style={{ color: 'var(--muted2)' }}>
                        {attr.v1Value !== '' ? attr.v1Value : <span className="diff-empty">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}

          {/* ── Link diff ──────────────────────────────────── */}
          {linkDiff.length > 0 && (
            <div className="diff-attr-section" style={{ marginTop: 16 }}>
              <div className="diff-section-title">
                Links{changedLinks.length > 0 ? ` — ${changedLinks.length} change${changedLinks.length > 1 ? 's' : ''}` : ' — no changes'}
              </div>

              {/* Changed links (added / removed) */}
              {changedLinks.map(link => (
                <details key={link.linkId} className="diff-link-entry" open>
                  <summary className="diff-link-summary">
                    {/* Status badge */}
                    <span
                      className="hist-type-badge"
                      data-type={link.status}
                      style={{
                        background: link.status === 'ADDED' ? 'var(--success)' : 'var(--danger)',
                        color: '#fff', marginRight: 6, fontSize: 10
                      }}
                    >
                      {link.status}
                    </span>
                    {/* Link type */}
                    <span style={{ fontWeight: 600, marginRight: 6 }}>{link.linkTypeName}</span>
                    {/* Policy badge */}
                    <span
                      className="hist-type-badge"
                      data-type={link.linkPolicy === 'VERSION_TO_VERSION' ? 'SIGNATURE' : 'LIFECYCLE'}
                      style={{ fontSize: 10, marginRight: 8 }}
                    >
                      {link.linkPolicy === 'VERSION_TO_VERSION' ? 'V2V' : 'V2M'}
                    </span>
                    {/* Target */}
                    <span style={{ color: 'var(--fg)' }}>
                      {link.targetLogicalId || link.targetNodeId}
                    </span>
                    <span style={{ color: 'var(--muted2)', fontSize: 11, marginLeft: 4 }}>
                      ({link.targetNodeType})
                    </span>
                  </summary>

                  {/* Level 1 — Target pointer */}
                  <div className="diff-link-detail">
                    <div className="diff-link-detail-row">
                      <span className="diff-attr-name">Target</span>
                      <span className="diff-val">
                        {link.targetLogicalId || link.targetNodeId}
                        <span style={{ color: 'var(--muted2)', marginLeft: 4 }}>· {link.targetNodeType}</span>
                      </span>
                    </div>
                    <div className="diff-link-detail-row">
                      <span className="diff-attr-name">Policy</span>
                      <span className="diff-val">
                        {link.linkPolicy === 'VERSION_TO_VERSION' ? 'V2V — pinned version' : 'V2M — always latest'}
                      </span>
                    </div>
                    {link.linkPolicy === 'VERSION_TO_VERSION' && (
                      <div className="diff-link-detail-row">
                        <span className="diff-attr-name">Pinned version</span>
                        <span className="diff-val">
                          {link.pinnedRevision != null
                            ? `${link.pinnedRevision}.${link.pinnedIteration}`
                            : <span className="diff-empty">—</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </details>
              ))}

              {/* Unchanged links (collapsed) */}
              {unchangedLinks.length > 0 && (
                <details className="diff-unchanged-details" style={{ marginTop: 8 }}>
                  <summary className="diff-section-title" style={{ cursor: 'pointer', fontWeight: 400 }}>
                    Unchanged links ({unchangedLinks.length})
                  </summary>
                  <div style={{ marginTop: 4 }}>
                    {unchangedLinks.map(link => (
                      <div key={link.linkId} className="diff-link-unch-row">
                        <span style={{ fontWeight: 600, marginRight: 6 }}>{link.linkTypeName}</span>
                        <span
                          className="hist-type-badge"
                          data-type={link.linkPolicy === 'VERSION_TO_VERSION' ? 'SIGNATURE' : 'LIFECYCLE'}
                          style={{ fontSize: 10, marginRight: 8 }}
                        >
                          {link.linkPolicy === 'VERSION_TO_VERSION' ? 'V2V' : 'V2M'}
                        </span>
                        <span>{link.targetLogicalId || link.targetNodeId}</span>
                        <span style={{ color: 'var(--muted2)', fontSize: 11, marginLeft: 4 }}>
                          ({link.targetNodeType})
                        </span>
                        {link.linkPolicy === 'VERSION_TO_VERSION' && link.pinnedRevision && (
                          <span style={{ color: 'var(--muted2)', fontSize: 11, marginLeft: 8 }}>
                            pinned {link.pinnedRevision}.{link.pinnedIteration}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Fingerprint comparison — sticky footer */}
        {(v1.fingerprint || v2.fingerprint) && (
          <div className="diff-fp-row">
            <span className="diff-fp-label">Fingerprint</span>
            <span className="diff-fp-val" title={v1.fingerprint} style={{ color: 'var(--muted2)' }}>
              {v1.fingerprint ? v1.fingerprint.slice(0, 12) + '…' : '—'}
            </span>
            <span style={{ margin: '0 6px', opacity: .5 }}>→</span>
            <span className="diff-fp-val" title={v2.fingerprint}
              style={{ color: v1.fingerprint !== v2.fingerprint ? 'var(--success)' : 'var(--muted2)' }}>
              {v2.fingerprint ? v2.fingerprint.slice(0, 12) + '…' : '—'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
