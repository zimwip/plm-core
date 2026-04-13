import React from 'react';
import NodeEditor from './NodeEditor';
import { PinIcon, PinOffIcon, CloseIcon, PlusIcon } from './Icons';

export default function EditorArea({
  tabs,
  activeTabId,
  userId,
  tx,
  toast,
  onTabActivate,
  onTabClose,
  onTabPin,
  onSubTabChange,
  onNavigate,
  onAutoOpenTx,
  onDescriptionLoaded,
}) {
  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="editor-area">
      {/* ── Tab bar ─────────────────────────────────── */}
      <div className="tab-bar">
        {tabs.length === 0 ? (
          <div className="tab-bar-empty">Open an object from the navigation panel</div>
        ) : (
          tabs.map(tab => (
            <div
              key={tab.id}
              className={`editor-tab ${tab.id === activeTabId ? 'active' : ''}`}
              onClick={() => onTabActivate(tab.id)}
            >
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
          ))
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
        ) : (
          <NodeEditor
            key={activeTab.nodeId}
            nodeId={activeTab.nodeId}
            userId={userId}
            tx={tx}
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
