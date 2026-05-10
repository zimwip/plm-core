import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api, txApi, setProjectSpaceId, setApiErrorHandler, authApi, setAuthExpiredHandler } from './services/api';
import { usePlmStore } from './store/usePlmStore';
import { useWebSocket } from './hooks/useWebSocket';
import Header          from './components/Header';
import SettingsPage    from './components/SettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import CommitModal     from './components/CommitModal';
import CreateResourceModal from './components/CreateResourceModal';
import ErrorDetailModal from './components/ErrorDetailModal';
import { psmNodeDescriptor } from './plugins/psmNodePlugin';
import { registerBuiltinPlugins } from './plugins';
import { ShellContext, createShellAPI } from './shell/ShellContext';
import { loadRemotePlugins } from './shell/PluginLoader';
import NavZone         from './zones/NavZone';
import EditorZone      from './zones/EditorZone';
import CollabZone      from './zones/CollabZone';
import ConsolePanelZone from './zones/ConsolePanelZone';
import StatusBarZone   from './zones/StatusBarZone';

registerBuiltinPlugins();

const DEFAULT_PROJECT_SPACE = 'ps-default';

let _tid = 0;
function useToasts() {
  const [toasts,      setToasts]    = useState([]);
  const [errorDetail, setErrDetail] = useState(null);

  const toast = useCallback((msgOrErr, type = 'info') => {
    const msg    = typeof msgOrErr === 'string' ? msgOrErr : (msgOrErr?.message || String(msgOrErr));
    const detail = (typeof msgOrErr !== 'string' && msgOrErr?.detail) ? msgOrErr.detail : null;
    if (type === 'error') {
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

export default function App() {
  const { toasts, toast, errorDetail, setErrDetail } = useToasts();

  const [userId,         setUserId]             = useState('user-alice');
  const [projectSpaceId, setProjectSpaceIdState] = useState(DEFAULT_PROJECT_SPACE);

  const storeSetUserId       = usePlmStore(s => s.setUserId);
  const nodes                = usePlmStore(s => s.nodes);
  const nodeTypes            = usePlmStore(s => s.nodeTypes);
  const resources            = usePlmStore(s => s.resources);
  const stateColorMap        = usePlmStore(s => s.stateColorMap);
  const stateColorMapLoaded  = usePlmStore(s => s.stateColorMapLoaded);
  const projectSpaces        = usePlmStore(s => s.projectSpaces);
  const users                = usePlmStore(s => s.users);
  const tx                   = usePlmStore(s => s.activeTx);
  const txNodes              = usePlmStore(s => s.txNodes);
  const refreshNodes         = usePlmStore(s => s.refreshNodes);
  const refreshTx            = usePlmStore(s => s.refreshTx);
  const refreshAll           = usePlmStore(s => s.refreshAll);
  const refreshItems         = usePlmStore(s => s.refreshItems);
  const refreshStateColorMap = usePlmStore(s => s.refreshStateColorMap);
  const refreshProjectSpaces = usePlmStore(s => s.refreshProjectSpaces);
  const refreshUsers         = usePlmStore(s => s.refreshUsers);
  const clearTx              = usePlmStore(s => s.clearTx);
  const refreshAllNodeDescs  = usePlmStore(s => s.refreshAllNodeDescs);
  const refreshNodeDesc      = usePlmStore(s => s.refreshNodeDesc);
  const evictNodeDesc        = usePlmStore(s => s.evictNodeDesc);

  const [browseRefreshKey, setBrowseRefreshKey] = useState(0);
  const bumpBrowse = useCallback(() => setBrowseRefreshKey(k => k + 1), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType,  setSearchType]  = useState('');

  const DASHBOARD_TAB = { id: 'dashboard', nodeId: null, label: 'Dashboard', pinned: true };
  const [tabs,        setTabs]        = useState([DASHBOARD_TAB]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [selectedDesc, setSelectedDesc] = useState(null);

  const [showCommit,          setShowCommit]          = useState(false);
  const [showCreateNode,      setShowCreateNode]      = useState(false);
  const [createNodeDescriptor, setCreateNodeDescriptor] = useState(null);
  const [showSettings,         setShowSettings]         = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState(null);
  const [settingsSections,      setSettingsSections]      = useState(null);
  const [panelWidth,            setPanelWidth]            = useState(268);

  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authRetry, setAuthRetry] = useState(0);

  // ── Tab management ────────────────────────────────────────────────
  const navigate = useCallback((nodeId, label, descriptor) => {
    if (!descriptor || !descriptor.serviceCode) {
      throw new Error('navigate(): descriptor is required');
    }
    const tabSource = {
      serviceCode: descriptor.serviceCode,
      itemCode:    descriptor.itemCode,
      itemKey:     descriptor.itemKey,
      get:         descriptor.get || null,
    };
    setTabs(ts => {
      const existing = ts.find(t => t.nodeId === nodeId);
      if (existing) {
        setActiveTabId(existing.id);
        return ts.map(t => t.id === existing.id ? { ...t, ...tabSource } : t);
      }
      const unpinned = ts.find(t => !t.pinned && t.id !== 'dashboard');
      if (unpinned) {
        setActiveTabId(unpinned.id);
        return ts.map(t =>
          t.id === unpinned.id
            ? { ...t, nodeId, label: label || nodeId.slice(0, 10), ...tabSource }
            : t
        );
      }
      const id = `tab-${Date.now()}`;
      setActiveTabId(id);
      return [...ts, { id, nodeId, label: label || nodeId.slice(0, 10), pinned: false, ...tabSource }];
    });
  }, []);

  const openTab  = useCallback((tab) => navigate(tab.nodeId, tab.label, tab), [navigate]);
  const closeTab = useCallback((tabId) => {
    setTabs(ts => {
      const closing = ts.find(t => t.id === tabId);
      if (closing?.nodeId) evictNodeDesc(closing.nodeId);
      const remaining = ts.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        setSelectedDesc(null);
      }
      return remaining;
    });
  }, [activeTabId, evictNodeDesc]);

  // ── Shell API — stable across renders ────────────────────────────
  const shellAPI = useMemo(() => createShellAPI({ navigate, openTab, closeTab }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket ─────────────────────────────────────────────────────
  useWebSocket(
    ['/topic/transactions', '/topic/global', '/topic/metamodel'],
    async (evt) => {
      if (evt.event === 'TX_COMMITTED') {
        await refreshTx();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} committed a transaction`, 'info');
      } else if (evt.event === 'TX_ROLLED_BACK') {
        await refreshTx();
        await Promise.all([refreshNodes(), refreshAllNodeDescs()]);
        bumpBrowse();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} rolled back a transaction`, 'warn');
      } else if (evt.event === 'NODES_RELEASED') {
        refreshTx(); bumpBrowse();
      } else if (evt.event === 'NODE_CREATED') {
        refreshNodes(); refreshTx(); bumpBrowse();
      } else if (evt.event === 'NODE_UPDATED') {
        if (evt.nodeId) refreshNodeDesc(evt.nodeId);
        refreshNodes(); bumpBrowse();
      } else if (evt.event === 'METAMODEL_CHANGED') {
        refreshItems(); bumpBrowse();
        if (stateColorMapLoaded) refreshStateColorMap();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} updated the metamodel`, 'info');
      } else if (evt.event === 'PNO_CHANGED') {
        refreshUsers(); refreshProjectSpaces();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} updated ${(evt.entity || 'PNO data').toLowerCase()}`, 'info');
      }
    },
    userId,
  );

  function handleToggleSettings() {
    setShowSettings(s => {
      if (!s && userId) {
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

  useEffect(() => {
    setProjectSpaceId(DEFAULT_PROJECT_SPACE);
    setApiErrorHandler(err => toast(err, 'error'));
  }, [toast]);

  // ── Auth + boot ───────────────────────────────────────────────────
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

      setAuthExpiredHandler(async () => {
        try { return (await authApi.login(userId, projectSpaceId)).token; }
        catch { return null; }
      });

      setAuthReady(true);
      storeSetUserId(userId);
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

      loadRemotePlugins(shellAPI).catch(e => console.warn('[Shell] Plugin load failed:', e));
    })();
    return () => { cancelled = true; };
  }, [userId, projectSpaceId, authRetry]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleUserChange(newUserId) {
    setUserId(newUserId);
    setTabs([DASHBOARD_TAB]);
    setActiveTabId('dashboard');
    setSelectedDesc(null);
    setSearchQuery('');
  }

  function handleProjectSpaceChange(psId) {
    setProjectSpaceIdState(psId);
    setProjectSpaceId(psId);
    setTabs([DASHBOARD_TAB]);
    setActiveTabId('dashboard');
    setSelectedDesc(null);
    refreshAll();
  }

  function startResizeLeft(e) {
    const startX = e.clientX, startW = panelWidth;
    function onMove(ev) { setPanelWidth(Math.max(160, Math.min(600, startW + ev.clientX - startX))); }
    function onUp() { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  async function autoOpenTx() {
    if (tx) return tx.ID || tx.id;
    try {
      const res = await txApi.open(userId, 'Work session');
      await refreshTx();
      return res.txId;
    } catch (e) { toast(e, 'error'); return null; }
  }

  async function handleRollback() {
    if (!tx) return;
    try {
      await txApi.rollback(userId, tx.ID || tx.id);
      toast('Transaction rolled back', 'warn');
      clearTx();
      await refreshNodes();
      refreshAllNodeDescs();
    } catch (e) { toast(e, 'error'); }
  }

  async function handleReleaseNode(nodeId) {
    if (!tx) return;
    try {
      await txApi.release(userId, tx.ID || tx.id, [nodeId]);
      toast('Object released from transaction', 'info');
      await refreshAll();
    } catch (e) { toast(e, 'error'); }
  }

  async function handleCommitted(continuationTxId, deferredCount) {
    await refreshAll();
    refreshAllNodeDescs();
    if (continuationTxId && deferredCount > 0) {
      const n = deferredCount;
      toast(`${n} object${n > 1 ? 's' : ''} deferred — new transaction opened`, 'info');
    }
  }

  const activeTab       = tabs.find(t => t.id === activeTabId);
  const activeNodeId    = activeTab?.nodeId;
  const isDashboardOpen = activeTabId === 'dashboard';

  const onDescriptionLoaded = useCallback((desc) => {
    if (desc?.nodeId === activeNodeId) setSelectedDesc(desc);
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
              <button className="auth-splash-retry" onClick={() => setAuthRetry(n => n + 1)}>retry</button>
            </>
          ) : (
            <>
              <div className="auth-splash-spinner" />
              <div className="auth-splash-label">Signing in as {userId}…</div>
            </>
          )}
        </div>
        <StatusBarZone />
      </div>
    );
  }

  return (
    <ShellContext.Provider value={shellAPI}>
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
            <NavZone
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
              onOpenDashboard={() => setActiveTabId('dashboard')}
              browseRefreshKey={browseRefreshKey}
              style={{ width: panelWidth }}
            />
          </ErrorBoundary>

          <div className="resize-handle" onMouseDown={startResizeLeft} />

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
                <EditorZone
                  tabs={tabs}
                  activeTabId={activeTabId}
                  userId={userId}
                  tx={tx}
                  toast={toast}
                  nodeTypes={nodeTypes}
                  stateColorMap={stateColorMap}
                  onTabActivate={id => setActiveTabId(id)}
                  onTabClose={closeTab}
                  onTabPin={tabId => setTabs(ts => ts.map(t => t.id === tabId ? { ...t, pinned: !t.pinned } : t))}
                  onSubTabChange={(tabId, subTab) => setTabs(ts => ts.map(t => t.id === tabId ? { ...t, activeSubTab: subTab } : t))}
                  onNavigate={navigate}
                  onAutoOpenTx={autoOpenTx}
                  onDescriptionLoaded={onDescriptionLoaded}
                />
              </ErrorBoundary>
            )}
            <ConsolePanelZone />
          </div>

          <CollabZone
            activeNodeId={activeNodeId}
            userId={userId}
            users={users}
          />
        </div>

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
        <StatusBarZone showSettings={showSettings} onToggleSettings={handleToggleSettings} />
      </div>
    </ShellContext.Provider>
  );
}
