import React, { useEffect, useRef, useState } from 'react';
import { lookupPluginForTab } from '../services/sourcePlugins';
import { findEditorPlugin } from '../shell/pluginRegistry';
import DashboardView from './DashboardView';
import { useShellStore } from '../shell/shellStore';
import { PinIcon, PinOffIcon, CloseIcon, PlusIcon, MaximizeIcon, MinimizeIcon, NODE_ICONS } from './Icons';

export default function EditorArea({
  tabs,
  activeTabId,
  userId,
  tx,
  toast,
  nodeTypes,
  stateColorMap,
  onTabActivate,
  onTabClose,
  onTabPin,
  onSubTabChange,
  onNavigate,
  onAutoOpenTx,
  onDescriptionLoaded,
  onRefreshItemData,
  onOpenCommentsForVersion,
  onCommentAttribute,
  tabItemData,
}) {
  const showCollab    = useShellStore(s => s.showCollab);
  const toggleCollab  = useShellStore(s => s.toggleCollab);
  const DASHBOARD_ID = 'dashboard';
  const activeTab = tabs.find(t => t.id === activeTabId);
  const hasNode   = !!activeTab?.nodeId;

  // ── Central preview pane state ────────────────────────────────
  // { [tabId]: { data, closed, maximized, splitPos } }
  const [previewByTab, setPreviewByTab] = useState({});
  const previewSplitRef = useRef(null);
  const cancelByTabRef  = useRef({}); // tabId → cancel callback registered by the active plugin

  // Clean up stale entries when tabs are closed
  useEffect(() => {
    const ids = new Set(tabs.map(t => t.id));
    setPreviewByTab(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => ids.has(k))));
    for (const id of Object.keys(cancelByTabRef.current)) {
      if (!ids.has(id)) {
        cancelByTabRef.current[id]?.();
        delete cancelByTabRef.current[id];
      }
    }
  }, [tabs]);

  // Fire cancel callback when the active tab changes (selection change)
  useEffect(() => {
    return () => {
      if (activeTabId) {
        cancelByTabRef.current[activeTabId]?.();
        delete cancelByTabRef.current[activeTabId];
      }
    };
  }, [activeTabId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activePreview = activeTabId
    ? (previewByTab[activeTabId] ?? { data: null, closed: false, maximized: false, splitPos: 50 })
    : null;

  function setActivePreviewField(fields) {
    if (!activeTabId) return;
    setPreviewByTab(prev => ({
      ...prev,
      [activeTabId]: { closed: false, maximized: false, splitPos: 50, ...prev[activeTabId], ...fields },
    }));
  }

  function onRegisterPreview(data) {
    if (!activeTabId) return;
    setPreviewByTab(prev => ({
      ...prev,
      [activeTabId]: { closed: false, maximized: false, splitPos: 50, ...prev[activeTabId], data },
    }));
  }

  // Plugin calls this to register a cancel callback. Shell fires it on selection change
  // (tab switch or same-tab node navigation). Calling again replaces and fires the old one.
  function onRegisterCancel(cb) {
    if (!activeTabId) return;
    cancelByTabRef.current[activeTabId]?.();
    cancelByTabRef.current[activeTabId] = cb;
  }

  function startPreviewSplitDrag(e) {
    e.preventDefault();
    const container = previewSplitRef.current;
    if (!container) return;
    function onMove(ev) {
      const rect = container.getBoundingClientRect();
      setActivePreviewField({ splitPos: Math.max(20, Math.min(80, ((ev.clientX - rect.left) / rect.width) * 100)) });
    }
    function onUp() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Editor: remote plugin (findEditorPlugin) takes priority — psm-editor now has
  // the real NodeEditor component. Preview always comes from sourcePlugins shell
  // registration (Preview + previewLabel are not part of the remote plugin contract).
  const sourcePlugin = activeTab && activeTab.id !== DASHBOARD_ID
    ? lookupPluginForTab(activeTab)
    : null;
  const editorPlugin = activeTab && activeTab.id !== DASHBOARD_ID
    ? (findEditorPlugin(activeTab) ?? sourcePlugin)
    : null;
  const plugin = editorPlugin;
  const PreviewComponent = sourcePlugin?.Preview ?? null;
  const previewLabel = sourcePlugin?.previewLabel ?? 'Preview';
  const showPreviewPane = !!PreviewComponent;

  const previewClosed    = activePreview?.closed    ?? false;
  const previewMaximized = activePreview?.maximized ?? false;
  const splitPos         = activePreview?.splitPos  ?? 50;

  return (
    <div className="editor-area">

      {/* ── Left: tab-bar + editor content ─────────────────── */}
      <div className="editor-main">

        {/* Tab bar */}
        <div className="tab-bar">
          {tabs.length === 0 ? (
            <div className="tab-bar-empty">Open an object from the navigation panel</div>
          ) : (
            tabs.map(tab => {
              const isDash    = tab.id === DASHBOARD_ID;
              const nt        = tab.nodeTypeId ? (nodeTypes || []).find(t => (t.id || t.ID) === tab.nodeTypeId) : null;
              const typeColor = nt?.color || nt?.COLOR || null;
              const typeIcon  = nt?.icon  || nt?.ICON  || null;
              const NtIcon    = typeIcon ? NODE_ICONS[typeIcon] : null;
              return (
                <div
                  key={tab.id}
                  className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
                  onClick={() => onTabActivate(tab.id)}
                >
                  {isDash && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4, flexShrink: 0, opacity: .6 }}>
                      ⬡
                    </span>
                  )}
                  {!isDash && (NtIcon || typeColor) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4, flexShrink: 0 }}>
                      {NtIcon
                        ? <NtIcon size={10} color={typeColor || 'var(--muted2)'} strokeWidth={2} />
                        : <span style={{ width: 6, height: 6, borderRadius: 1, background: typeColor, display: 'inline-block' }} />
                      }
                    </span>
                  )}
                  <span className="tab-node-id">{tab.label || tab.nodeId?.slice(0, 10) + '…'}</span>
                  <button
                    className={`tab-pin ${tab.pinned ? 'active' : ''}`}
                    title={tab.pinned ? 'Unpin tab' : 'Pin tab'}
                    onClick={e => { e.stopPropagation(); onTabPin(tab.id); }}
                  >
                    {tab.pinned
                      ? <PinIcon size={11} color="var(--accent)" strokeWidth={2} />
                      : <PinOffIcon size={11} color="var(--muted)" strokeWidth={2} />
                    }
                  </button>
                  <button
                    className="tab-close"
                    title="Close tab"
                    onClick={e => { e.stopPropagation(); onTabClose(tab.id); }}
                  >
                    <CloseIcon size={11} color="var(--muted)" strokeWidth={2.5} />
                  </button>
                </div>
              );
            })
          )}
          {tabs.length > 0 && (
            <div className="tab-add" title="Pin a tab or navigate to open a new one">
              <PlusIcon size={13} color="var(--muted)" strokeWidth={2} />
            </div>
          )}

          {/* Comments toggle — only shown when a node tab is active */}
          {hasNode && (
            <button
              className={`tab-comments-toggle${showCollab ? ' active' : ''}`}
              onClick={toggleCollab}
              title={showCollab ? 'Hide comments' : 'Show comments'}
            >
              💬
            </button>
          )}
        </div>

        {/* Editor content + preview pane row */}
        <div ref={previewSplitRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* Editor content */}
          <div
            className="editor-content"
            style={showPreviewPane ? {
              width: previewClosed ? 'calc(100% - 28px)' : previewMaximized ? 0 : `${splitPos}%`,
              flex: 'none',
              overflow: previewMaximized ? 'hidden' : undefined,
              transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
            } : undefined}
          >
            {!activeTab ? (
              <div className="editor-empty">
                <div className="editor-empty-icon">⬡</div>
                <div className="editor-empty-text">No object open</div>
                <div className="editor-empty-hint">Select an object in the navigation panel to open it here</div>
              </div>
            ) : activeTab.id === DASHBOARD_ID ? (
              <DashboardView
                userId={userId}
                stateColorMap={stateColorMap}
                nodeTypes={nodeTypes}
                onNavigate={onNavigate}
              />
            ) : (() => {
              const Editor = editorPlugin?.Editor ?? editorPlugin?.Component;
              const ctx = {
                userId, tx, nodeTypes, stateColorMap, toast,
                onAutoOpenTx, onDescriptionLoaded, onRefreshItemData,
                onOpenCommentsForVersion, onCommentAttribute,
                onSubTabChange, onNavigate, onRegisterPreview, onRegisterCancel,
                itemData: tabItemData,
              };
              if (!Editor) return <div className="editor-empty"><div className="editor-empty-text">Loading editor…</div></div>;
              return <Editor tab={activeTab} ctx={ctx} />;
            })()}
          </div>

          {/* ── Preview pane (central, plugin-driven) ────────── */}
          {showPreviewPane && (
            previewClosed ? (
              <div
                style={{
                  width: 28, flexShrink: 0, cursor: 'pointer',
                  borderLeft: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--surface)',
                  transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                }}
                onClick={() => setActivePreviewField({ closed: false })}
                title={`Open ${previewLabel}`}
              >
                <span style={{
                  writingMode: 'vertical-rl', fontSize: 11, fontWeight: 600,
                  color: 'var(--muted)', userSelect: 'none', letterSpacing: 1,
                }}>
                  {previewLabel} ▶
                </span>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: previewMaximized ? 0 : 5,
                    cursor: 'col-resize', background: 'var(--border)', flexShrink: 0,
                    userSelect: 'none', overflow: 'hidden',
                    transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1)',
                  }}
                  onMouseDown={!previewMaximized ? startPreviewSplitDrag : undefined}
                />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '4px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0,
                    background: 'var(--surface)', fontSize: 11, fontWeight: 600,
                    color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1,
                  }}>
                    <span>{previewLabel}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <button
                        className="panel-icon-btn"
                        title={previewMaximized ? 'Restore' : `Maximize ${previewLabel}`}
                        onClick={() => setActivePreviewField({ maximized: !previewMaximized })}
                      >
                        {previewMaximized ? <MinimizeIcon size={13} /> : <MaximizeIcon size={13} />}
                      </button>
                      <button
                        className="panel-icon-btn"
                        title={`Collapse ${previewLabel}`}
                        onClick={() => setActivePreviewField({ closed: true })}
                      >
                        <CloseIcon size={13} />
                      </button>
                    </div>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <PreviewComponent
                      data={activePreview?.data ?? null}
                      tab={activeTab}
                      ctx={{
                        userId, tx, nodeTypes, stateColorMap, toast,
                        onAutoOpenTx, onDescriptionLoaded, onRefreshItemData,
                        onOpenCommentsForVersion, onCommentAttribute,
                        onSubTabChange, onNavigate, onRegisterPreview,
                        itemData: tabItemData,
                      }}
                    />
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>

    </div>
  );
}
