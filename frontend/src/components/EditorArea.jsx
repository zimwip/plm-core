import React from 'react';
import { lookupPluginForTab } from '../services/sourcePlugins';
import DashboardView from './DashboardView';
import CommentPanel from './CommentPanel';
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
  showCommentPanel,
  commentPanelWidth,
  onToggleCommentPanel,
  onStartResizeRight,
  commentVersionFilter,
  onOpenCommentsForVersion,
  users,
  commentTriggerText,
  onClearCommentTrigger,
  onCommentAttribute,
}) {
  const DASHBOARD_ID = 'dashboard';
  const activeTab = tabs.find(t => t.id === activeTabId);
  const hasNode   = !!activeTab?.nodeId;

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
              className={`tab-comments-toggle${showCommentPanel ? ' active' : ''}`}
              onClick={onToggleCommentPanel}
              title={showCommentPanel ? 'Hide comments' : 'Show comments'}
            >
              💬
            </button>
          )}
        </div>

        {/* Editor content */}
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
          ) : (() => {
            // Greenfield contract: every tab has a source descriptor, so
            // every tab resolves to a plugin (psm → NodeEditor, dst →
            // GenericDetailEditor, default catch-all → GenericDetailEditor).
            const plugin = lookupPluginForTab(activeTab);
            const Editor = plugin.Editor;
            const ctx = {
              userId, tx, nodeTypes, stateColorMap, toast,
              onAutoOpenTx, onDescriptionLoaded,
              onOpenCommentsForVersion, onCommentAttribute,
              onSubTabChange, onNavigate,
            };
            return <Editor key={activeTab.id} tab={activeTab} ctx={ctx} />;
          })()}
        </div>
      </div>

      {/* ── Right: comment panel ────────────────────────────── */}
      {showCommentPanel && hasNode && (
        <>
          <div className="resize-handle comment-resize" onMouseDown={onStartResizeRight} />
          <CommentPanel
            nodeId={activeTab.nodeId}
            userId={userId}
            width={commentPanelWidth}
            onClose={onToggleCommentPanel}
            filterVersionId={commentVersionFilter}
            onClearFilter={() => onOpenCommentsForVersion(null)}
            users={users}
            triggerText={commentTriggerText}
            onClearTrigger={onClearCommentTrigger}
          />
        </>
      )}
    </div>
  );
}
