import React, { useState, useEffect, useCallback } from 'react';
import { api, txApi, setProjectSpaceId, setApiErrorHandler, authApi, setAuthExpiredHandler } from './services/api';
import { usePlmStore } from './store/usePlmStore';
import { useWebSocket } from './hooks/useWebSocket';
import Header          from './components/Header';
import LeftPanel       from './components/LeftPanel';
import EditorArea      from './components/EditorArea';
import SettingsPage    from './components/SettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import CommitModal     from './components/CommitModal';
import CreateResourceModal from './components/CreateResourceModal';
import ErrorDetailModal from './components/ErrorDetailModal';
import StatusBar        from './components/StatusBar';
import { registerBuiltinPlugins } from './plugins';
import { psmNodeDescriptor } from './plugins/psmNodePlugin';

// Source plugins are registered once at module load — order doesn't matter,
// the registry sorts by match-specificity. Adding a new source is a new
// plugin file imported here, no other touch points.
registerBuiltinPlugins();

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

// ─── App ───────────────────────────────────────────────────────────
export default function App() {
  const { toasts, toast, errorDetail, setErrDetail } = useToasts();

  // User & project space
  const [userId,          setUserId]             = useState('user-alice');
  const [projectSpaceId,  setProjectSpaceIdState] = useState(DEFAULT_PROJECT_SPACE);

  // Store
  const storeSetUserId      = usePlmStore(s => s.setUserId);
  const nodes               = usePlmStore(s => s.nodes);
  const nodeTypes           = usePlmStore(s => s.nodeTypes);
  const resources           = usePlmStore(s => s.resources);
  const stateColorMap       = usePlmStore(s => s.stateColorMap);
  const stateColorMapLoaded = usePlmStore(s => s.stateColorMapLoaded);
  const projectSpaces       = usePlmStore(s => s.projectSpaces);
  const users               = usePlmStore(s => s.users);
  const tx                  = usePlmStore(s => s.activeTx);
  const txNodes             = usePlmStore(s => s.txNodes);
  const refreshNodes        = usePlmStore(s => s.refreshNodes);
  const refreshTx           = usePlmStore(s => s.refreshTx);
  const refreshAll          = usePlmStore(s => s.refreshAll);
  const refreshItems        = usePlmStore(s => s.refreshItems);
  const refreshStateColorMap = usePlmStore(s => s.refreshStateColorMap);
  const refreshProjectSpaces = usePlmStore(s => s.refreshProjectSpaces);
  const refreshUsers        = usePlmStore(s => s.refreshUsers);
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
        bumpBrowse();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} rolled back a transaction`, 'warn');
      } else if (evt.event === 'NODES_RELEASED') {
        refreshTx();
        bumpBrowse();
      } else if (evt.event === 'NODE_CREATED') {
        refreshNodes();
        refreshTx();
        bumpBrowse();
      } else if (evt.event === 'NODE_UPDATED') {
        // Broadcast from commit — refresh this node's description and the tree
        if (evt.nodeId) refreshNodeDesc(evt.nodeId);
        refreshNodes();
        bumpBrowse();
      } else if (evt.event === 'METAMODEL_CHANGED') {
        refreshItems();
        bumpBrowse();
        // Colour map only refreshed if Settings already loaded it; avoids
        // admin endpoints when the user never opened Settings.
        if (stateColorMapLoaded) refreshStateColorMap();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} updated the metamodel`, 'info');
      } else if (evt.event === 'PNO_CHANGED') {
        refreshUsers();
        refreshProjectSpaces();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} updated ${(evt.entity || 'PNO data').toLowerCase()}`, 'info');
      }
    },
    userId,
  );

  // BrowseNav refresh signal — bumped on websocket events that mutate
  // listable items (NODE_CREATED, NODE_UPDATED, TX_ROLLED_BACK, METAMODEL_CHANGED).
  // BrowseNav re-fetches /browse and every descriptor's items when this changes.
  const [browseRefreshKey, setBrowseRefreshKey] = useState(0);
  const bumpBrowse = useCallback(() => setBrowseRefreshKey(k => k + 1), []);

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
  const [showCommit,          setShowCommit]          = useState(false);
  const [showCreateNode,      setShowCreateNode]      = useState(false);
  const [createNodeDescriptor, setCreateNodeDescriptor] = useState(null);
  const [showSettings,         setShowSettings]         = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState(null);
  const [settingsSections,      setSettingsSections]      = useState(null);
  const [panelWidth,            setPanelWidth]            = useState(268);
  const [showCommentPanel,      setShowCommentPanel]      = useState(false);
  const [commentPanelWidth,     setCommentPanelWidth]     = useState(320);
  const [commentVersionFilter,  setCommentVersionFilter]  = useState(null);
  const [commentTriggerText,    setCommentTriggerText]    = useState(null);

  // ── Panel resize (left) ───────────────────────────────────────
  function startResize(e) {
    const startX = e.clientX, startW = panelWidth;
    function onMove(ev) { setPanelWidth(Math.max(160, Math.min(600, startW + ev.clientX - startX))); }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  // ── Panel resize (right / comments) ──────────────────────────
  function startResizeRight(e) {
    const startX = e.clientX, startW = commentPanelWidth;
    function onMove(ev) { setCommentPanelWidth(Math.max(240, Math.min(560, startW + startX - ev.clientX))); }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleToggleSettings() {
    setShowSettings(s => {
      if (!s && userId) {
        // Settings-only data fetched lazily on mount: section list + state
        // colour map (lifecycle states drive node-pill colours; admin endpoint).
        api.getSettingsSections(userId).then(groups => {
          setSettingsSections(groups);
          const first = groups?.[0]?.sections?.[0]?.key;
          if (first) setActiveSettingsSection(first);
        }).catch(() => setSettingsSections([]));
        refreshStateColorMap();
      }
      return !s;
    });
  }

  // ── Auth session state (set by login) ──────────────────────────
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authRetry, setAuthRetry] = useState(0);

  // ── Init: set project space + global API error handler ────────
  useEffect(() => {
    setProjectSpaceId(DEFAULT_PROJECT_SPACE);
    setApiErrorHandler(err => toast(err, 'error'));
  }, [toast]);

  // ── Data loading ───────────────────────────────────────────────
  // Runtime federated item catalog (`/api/platform/items`). Each descriptor
  // carries the actions the user is permitted to perform (create/list/get).
  // Two derived states feed the UI:
  // Login (auto, no password) on userId/projectSpace change, then load.
  useEffect(() => {
    let cancelled = false;
    setAuthReady(false);
    setAuthError(null);
    (async () => {
      try {
        await authApi.login(userId, projectSpaceId);
      } catch (err) {
        if (!cancelled) setAuthError(err.message || String(err));
        return;
      }
      if (cancelled) return;

      // 401 handler: silently re-login with current userId/ps and hand back the new token.
      setAuthExpiredHandler(async () => {
        try {
          const r = await authApi.login(userId, projectSpaceId);
          return r.token;
        } catch { return null; }
      });

      setAuthReady(true);
      storeSetUserId(userId);
      // Boot fetch: refreshAll covers items (+ node list) + tx in one pass.
      // PNO data + lifecycle state colours loaded in parallel (colours drive
      // nav dots, state pills and 3D outlines — needed before any node opens).
      refreshAll();
      refreshProjectSpaces();
      refreshUsers();
      refreshStateColorMap();
      if (showSettings) {
        api.getSettingsSections(userId).then(groups => {
          setSettingsSections(groups);
          const first = groups?.[0]?.sections?.[0]?.key;
          if (first) setActiveSettingsSection(first);
        }).catch(() => setSettingsSections([]));
      }
    })();
    return () => { cancelled = true; };
  }, [userId, projectSpaceId, authRetry]); // eslint-disable-line react-hooks/exhaustive-deps

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

  function navigate(nodeId, label, descriptor) {
    // Greenfield contract: every navigate call carries the source
    // descriptor it came from. The tab stores serviceCode + itemCode
    // + itemKey + get so EditorArea can route to the right plugin and
    // the generic detail editor knows where to fetch from.
    if (!descriptor || !descriptor.serviceCode) {
      throw new Error('navigate(): descriptor is required (greenfield — no legacy fallback)');
    }
    const tabSource = {
      serviceCode: descriptor.serviceCode,
      itemCode:    descriptor.itemCode,
      itemKey:     descriptor.itemKey,
      get:         descriptor.get || null,
    };

    const existing = tabs.find(t => t.nodeId === nodeId);
    if (existing) {
      setTabs(ts => ts.map(t => t.id === existing.id ? { ...t, ...tabSource } : t));
      setActiveTabId(existing.id);
      return;
    }
    const unpinned = tabs.find(t => !t.pinned && t.id !== 'dashboard');
    if (unpinned) {
      setTabs(ts => ts.map(t =>
        t.id === unpinned.id
          ? { ...t, nodeId, label: label || nodeId.slice(0, 10), ...tabSource }
          : t
      ));
      setActiveTabId(unpinned.id);
      return;
    }
    const id = `tab-${Date.now()}`;
    setTabs(ts => [...ts, { id, nodeId, label: label || nodeId.slice(0, 10), pinned: false, ...tabSource }]);
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
    // Enrich the matching tab with nodeTypeId and logical ID for display
    if (desc?.nodeId) {
      const tabLabel = desc.logicalId || desc.identity || undefined;
      setTabs(ts => ts.map(t => t.nodeId === desc.nodeId
        ? { ...t, ...(desc.nodeTypeId && { nodeTypeId: desc.nodeTypeId }), ...(tabLabel && { label: tabLabel }) }
        : t));
    }
  }, [activeNodeId]);

  if (!authReady) {
    return (
      <div className="shell">
        <div className="auth-splash">
          {authError ? (
            <>
              <div className="auth-splash-error">Login failed</div>
              <div className="auth-splash-detail">{authError}</div>
              <button
                className="auth-splash-retry"
                onClick={() => setAuthRetry(n => n + 1)}
              >retry</button>
            </>
          ) : (
            <>
              <div className="auth-splash-spinner" />
              <div className="auth-splash-label">Signing in as {userId}…</div>
            </>
          )}
        </div>
        <StatusBar />
      </div>
    );
  }

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
        <ErrorBoundary>
          <LeftPanel
            nodeTypes={nodeTypes}
            tx={tx}
            txNodes={txNodes}
            userId={userId}
            activeNodeId={activeNodeId}
            stateColorMap={stateColorMap}
            onNavigate={navigate}
            canCreateNode={resources.length > 0}
            onCreateNode={(descriptor) => { setCreateNodeDescriptor(descriptor || null); setShowCreateNode(true); }}
            onCommit={() => setShowCommit(true)}
            onRollback={handleRollback}
            onReleaseNode={handleReleaseNode}
            showSettings={showSettings}
            onToggleSettings={handleToggleSettings}
            activeSettingsSection={activeSettingsSection}
            onSettingsSectionChange={setActiveSettingsSection}
            settingsSections={settingsSections}
            isDashboardOpen={isDashboardOpen}
            onOpenDashboard={openDashboard}
            browseRefreshKey={browseRefreshKey}
            style={{ width: panelWidth }}
          />
        </ErrorBoundary>
        <div className="resize-handle" onMouseDown={startResize} />
        <div className="editor-column">
          {showSettings ? (
            <ErrorBoundary>
              <SettingsPage
                userId={userId}
                projectSpaceId={projectSpaceId}
                activeSection={activeSettingsSection}
                onSectionChange={setActiveSettingsSection}
                settingsSections={settingsSections}
                toast={toast}
              />
            </ErrorBoundary>
          ) : (
            <ErrorBoundary>
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
                showCommentPanel={showCommentPanel}
                commentPanelWidth={commentPanelWidth}
                onToggleCommentPanel={() => { setShowCommentPanel(s => !s); setCommentVersionFilter(null); }}
                onStartResizeRight={startResizeRight}
                commentVersionFilter={commentVersionFilter}
                onOpenCommentsForVersion={versionId => {
                  setCommentVersionFilter(versionId);
                  setShowCommentPanel(true);
                }}
                users={users}
                commentTriggerText={commentTriggerText}
                onClearCommentTrigger={() => setCommentTriggerText(null)}
                onCommentAttribute={attrId => {
                  setCommentTriggerText('#' + attrId + ' ');
                  setShowCommentPanel(true);
                }}
              />
            </ErrorBoundary>
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

      {/* Federated create modal — single window with cascading Source + Type selects.
          Source defaults to the first group; Type defaults to the first descriptor
          in that group. Each descriptor's create.parameters drive the form.
          Per-user filtering is delegated to source services by platform-api. */}
      {showCreateNode && resources.length > 0 && (
        <CreateResourceModal
          resources={resources}
          initialDescriptor={createNodeDescriptor}
          onCreated={async (result, descriptor) => {
            await refreshAll();
            if (descriptor?.serviceCode === 'psm' && result?.nodeId) navigate(result.nodeId, undefined, psmNodeDescriptor);
          }}
          onClose={() => { setShowCreateNode(false); setCreateNodeDescriptor(null); }}
          toast={toast}
        />
      )}

      {errorDetail && (
        <ErrorDetailModal detail={errorDetail} onClose={() => setErrDetail(null)} />
      )}

      <Toasts toasts={toasts} />
      <StatusBar showSettings={showSettings} onToggleSettings={handleToggleSettings} />
    </div>
  );
}
