import React from 'react';
import NodeEditor from './NodeEditor';
import DashboardView from './DashboardView';
import { PinIcon, PinOffIcon, CloseIcon, PlusIcon, NODE_ICONS } from './Icons';

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
}) {
  const DASHBOARD_ID = 'dashboard';
  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="editor-area">
      {/* ── Tab bar ─────────────────────────────────── */}
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
              {/* Dashboard tab gets a fixed icon */}
              {isDash && (
                <span style={{ display: 'inline-flex', alignItems: 'center', marginRight: 4, flexShrink: 0, opacity: .6 }}>
                  ⬡
                </span>
              )}
              {/* Node type indicator */}
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
      </div>

      {/* ── Editor content ───────────────────────────── */}
      <div className="editor-content">
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
        ) : (
          <NodeEditor
            key={activeTab.nodeId}
            nodeId={activeTab.nodeId}
            userId={userId}
            tx={tx}
            nodeTypes={nodeTypes}
            stateColorMap={stateColorMap}
            activeSubTab={activeTab.activeSubTab || 'attributes'}
            onSubTabChange={key => onSubTabChange(activeTab.id, key)}
            toast={toast}
            onAutoOpenTx={onAutoOpenTx}
            onDescriptionLoaded={onDescriptionLoaded}
          />
        )}
      </div>
    </div>
  );
}
