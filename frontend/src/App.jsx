import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { api, txApi, fetchItemDetail, setProjectSpaceId, setApiErrorHandler, authApi, setAuthExpiredHandler } from './services/api';
import { usePlmStore } from './store/usePlmStore';
import { loadThemeFromBackend } from './theme';
import { useWebSocket } from './hooks/useWebSocket';
import Header          from './components/Header';
import SettingsPage    from './components/SettingsPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import CommitModal     from './components/CommitModal';
import CreateResourceModal from './components/CreateResourceModal';
import ErrorDetailModal from './components/ErrorDetailModal';
import { psmNodeDescriptor } from './plugins/psmDescriptor';
import { tabToNavItemRef, detailToItem } from './shell/navTypes';
import { registerBuiltinPlugins } from './plugins';
import { ShellContext, createShellAPI } from './shell/ShellContext';
import { loadRemotePlugins } from './shell/PluginLoader';
import NavZone         from './zones/NavZone';
import EditorZone      from './zones/EditorZone';
import CollabZone      from './zones/CollabZone';
import ConsolePanelZone from './zones/ConsolePanelZone';
import StatusBarZone   from './zones/StatusBarZone';
import SearchPanel     from './components/SearchPanel';

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

  const storeSetUserId         = usePlmStore(s => s.setUserId);
  const storeSetProjectSpaceId = usePlmStore(s => s.setProjectSpaceId);
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
  const loadBasket           = usePlmStore(s => s.loadBasket);
  const addToBasket          = usePlmStore(s => s.addToBasket);
  const basketItems          = usePlmStore(s => s.basketItems);
  const syncBasketAdd        = usePlmStore(s => s.syncBasketAdd);
  const syncBasketRemove     = usePlmStore(s => s.syncBasketRemove);
  const syncBasketClear      = usePlmStore(s => s.syncBasketClear);
  const removeBasketItemIds  = usePlmStore(s => s.removeBasketItemIds);
  const lockItem             = usePlmStore(s => s.lockItem);
  const unlockItem           = usePlmStore(s => s.unlockItem);
  const unlockAll            = usePlmStore(s => s.unlockAll);

  const [browseRefreshKey, setBrowseRefreshKey] = useState(0);
  const [searchPanelVisible, setSearchPanelVisible] = useState(false);
  const [searchPanelQuery,   setSearchPanelQuery]   = useState('');
  const bumpBrowse = useCallback(() => setBrowseRefreshKey(k => k + 1), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType,  setSearchType]  = useState('');

  const DASHBOARD_TAB = { id: 'dashboard', nodeId: null, label: 'Dashboard', pinned: true };
  const [tabs,        setTabs]        = useState([DASHBOARD_TAB]);
  const [activeTabId, setActiveTabId] = useState('dashboard');
  const [selectedDesc, setSelectedDesc] = useState(null);

  // Shell-level item data: { [nodeId]: { status: 'loading'|'ok'|'error', data, error } }
  // Populated (and refreshed) by the registered GetAction.
  // txId is forwarded so the backend returns the OPEN draft when a node is checked out.
  const [tabData,       setTabData]      = useState({});
  const fetchedNodeIds = useRef(new Set());

  const refreshTabData = useCallback((nodeId) => {
    const tab = tabs.find(t => t.nodeId === nodeId);
    if (!tab?.get?.path) return;
    const currentTxId = tx?.ID || tx?.id || null;
    setTabData(prev => ({ ...prev, [nodeId]: { ...(prev[nodeId] ?? {}), status: 'loading' } }));
    fetchItemDetail(tab.serviceCode, tab.get, nodeId, currentTxId ? { txId: currentTxId } : {})
      .then(data => setTabData(prev => ({ ...prev, [nodeId]: { status: 'ok', data } })))
      .catch(err  => {
        if (err?.status === 404) {
          fetchedNodeIds.current.delete(nodeId);
          setTabData(prev => { const next = { ...prev }; delete next[nodeId]; return next; });
          setTabs(ts => {
            const remaining = ts.filter(t => t.nodeId !== nodeId);
            setActiveTabId(aid => aid === tab.id ? (remaining.at(-1)?.id ?? null) : aid);
            return remaining;
          });
        } else {
          setTabData(prev => ({ ...prev, [nodeId]: { status: 'error', error: err.message } }));
        }
      });
  }, [tabs, tx]); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshAllTabData = useCallback(() => {
    tabs.filter(t => t.nodeId && t.get?.path).forEach(t => refreshTabData(t.nodeId));
  }, [tabs, refreshTabData]);

  // Fetch on tab activation (first open). Uses txId so checkout drafts are visible immediately.
  useEffect(() => {
    if (!activeTabId || activeTabId === 'dashboard') return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (!tab?.get?.path || !tab.nodeId || fetchedNodeIds.current.has(tab.nodeId)) return;
    fetchedNodeIds.current.add(tab.nodeId);
    refreshTabData(tab.nodeId);
  }, [activeTabId, tabs]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch active tab when txId changes (checkout → show OPEN draft; commit → show committed).
  const prevTxIdRef = useRef(null);
  useEffect(() => {
    const currentTxId = tx?.ID || tx?.id || null;
    if (currentTxId === prevTxIdRef.current) return;
    prevTxIdRef.current = currentTxId;
    if (!activeTabId || activeTabId === 'dashboard') return;
    const tab = tabs.find(t => t.id === activeTabId);
    if (tab?.nodeId) refreshTabData(tab.nodeId);
  }, [tx, activeTabId, tabs, refreshTabData]);

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
  const [pluginsLoaded, setPluginsLoaded] = useState(false);

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
      if (closing?.nodeId) {
        fetchedNodeIds.current.delete(closing.nodeId);
        setTabData(prev => { const next = { ...prev }; delete next[closing.nodeId]; return next; });
      }
      const remaining = ts.filter(t => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
        setSelectedDesc(null);
      }
      return remaining;
    });
  }, [activeTabId]);

  // ── Shell API — stable across renders ────────────────────────────
  const shellAPI = useMemo(() => createShellAPI({ navigate, openTab, closeTab }), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── WebSocket ─────────────────────────────────────────────────────
  useWebSocket(
    ['/topic/transactions', '/topic/global', '/topic/metamodel'],
    async (evt) => {
      if (evt.event === 'LOCK_ACQUIRED') {
        if (evt.lockedBy === userId) lockItem(evt.nodeId);
      } else if (evt.event === 'LOCK_RELEASED') {
        if (evt.releasedBy === userId) unlockItem(evt.nodeId);
      } else if (evt.event === 'TX_COMMITTED') {
        if (evt.byUser === userId) unlockAll();
        await refreshTx();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} committed a transaction`, 'info');
      } else if (evt.event === 'ITEM_DELETED') {
        if (evt.nodeId) {
          removeBasketItemIds([evt.nodeId]);
          // Close tab for this item if open (item is gone — refreshTabData would 404).
          setTabs(ts => {
            const tab = ts.find(t => t.nodeId === evt.nodeId);
            if (!tab) return ts;
            fetchedNodeIds.current.delete(evt.nodeId);
            setTabData(prev => { const n = { ...prev }; delete n[evt.nodeId]; return n; });
            const remaining = ts.filter(t => t.nodeId !== evt.nodeId);
            setActiveTabId(aid => aid === tab.id ? (remaining.at(-1)?.id ?? null) : aid);
            return remaining;
          });
        }
        refreshNodes(); bumpBrowse();
      } else if (evt.event === 'TX_ROLLED_BACK') {
        if (evt.byUser === userId) unlockAll();
        await refreshTx();
        await refreshNodes(); refreshAllTabData();
        bumpBrowse();
        if (evt.byUser && evt.byUser !== userId)
          toast(`${evt.byUser} rolled back a transaction`, 'warn');
      } else if (evt.event === 'ITEMS_RELEASED') {
        if (evt.byUser === userId) (evt.nodeIds || []).forEach(unlockItem);
        refreshTx(); bumpBrowse();
      } else if (evt.event === 'ITEM_CREATED') {
        refreshNodes(); refreshTx(); bumpBrowse();
      } else if (evt.event === 'ITEM_CAPTURED') {
        refreshTx();
      } else if (evt.event === 'BASKET_ITEM_ADDED') {
        syncBasketAdd(evt.key, evt.value);
      } else if (evt.event === 'BASKET_ITEM_REMOVED') {
        syncBasketRemove(evt.key, evt.value);
      } else if (evt.event === 'BASKET_CLEARED') {
        syncBasketClear();
      } else if (evt.event === 'ITEM_VERSION_CREATED' || evt.event === 'ITEM_UPDATED') {
        if (evt.nodeId) refreshTabData(evt.nodeId);
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
      storeSetProjectSpaceId(projectSpaceId);
      refreshAll();
      refreshProjectSpaces();
      refreshUsers();
      refreshStateColorMap();
      loadBasket(userId);
      loadThemeFromBackend(userId);
      if (showSettings) {
        api.getSettingsSections(userId).then(groups => {
          setSettingsSections(groups);
          const first = groups?.[0]?.sections?.[0]?.key;
          if (first) setActiveSettingsSection(first);
        }).catch(() => setSettingsSections([]));
      }

      try {
        const pluginErrors = await loadRemotePlugins(shellAPI);
        if (pluginErrors.length > 0) {
          toast(`Some plugins failed to load: ${pluginErrors.join('; ')}`, 'error');
        }
      } catch (e) {
        toast(`Plugin manifest unavailable: ${e.message || e}`, 'error');
      } finally {
        setPluginsLoaded(true);
        setBrowseRefreshKey(k => k + 1);
      }
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
    storeSetProjectSpaceId(psId);
    loadBasket(userId);
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
      refreshAllTabData();
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
    refreshAllTabData();
    if (continuationTxId && deferredCount > 0) {
      const n = deferredCount;
      toast(`${n} object${n > 1 ? 's' : ''} deferred — new transaction opened`, 'info');
    }
  }

  const activeTab       = tabs.find(t => t.id === activeTabId);
  const activeNodeId    = activeTab?.nodeId;
  const isDashboardOpen = activeTabId === 'dashboard';

  // NavItemRefs for all non-dashboard open tabs.
  const openItems = useMemo(() =>
    tabs.filter(t => t.id !== 'dashboard' && t.nodeId).map(tabToNavItemRef).filter(Boolean),
    [tabs],
  );

  // Flat item data derived from already-loaded tab details.
  const openItemDataMap = useMemo(() => {
    const map = {};
    for (const tab of tabs) {
      if (!tab.nodeId || tab.id === 'dashboard') continue;
      const entry = tabData[tab.nodeId];
      if (entry?.status === 'ok' && entry.data) map[tab.nodeId] = detailToItem(entry.data);
    }
    return map;
  }, [tabs, tabData]);

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
          onSearchSubmit={(q) => { setSearchPanelQuery(q); setSearchPanelVisible(true); }}
          projectSpaces={projectSpaces}
          projectSpaceId={projectSpaceId}
          onProjectSpaceChange={handleProjectSpaceChange}
          nodes={nodes}
          onNavigate={navigate}
        />

        <div className="body">
          <div
            className={`search-strip${searchPanelVisible ? ' search-strip--open' : ''}`}
            onClick={() => setSearchPanelVisible(v => !v)}
            title={searchPanelVisible ? 'Close search' : 'Search items'}
          >
            <span className="search-strip-label">
              {searchPanelVisible ? '◀' : '▶'} Search
            </span>
          </div>
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
              openItems={openItems}
              openItemDataMap={openItemDataMap}
              style={{ width: panelWidth }}
              toast={toast}
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
                  pluginsLoaded={pluginsLoaded}
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
                  onRefreshItemData={refreshTabData}
                  tabItemData={activeTab?.nodeId ? (tabData[activeTab.nodeId] ?? null) : null}
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

        {searchPanelVisible && (
          <SearchPanel
            query={searchPanelQuery}
            onQueryChange={setSearchPanelQuery}
            onClose={() => setSearchPanelVisible(false)}
            userId={userId}
            projectSpaceId={projectSpaceId}
            onNavigate={navigate}
          />
        )}

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
