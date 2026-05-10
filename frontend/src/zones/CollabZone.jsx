import React, { useCallback } from 'react';
import CommentPanel from '../components/CommentPanel';
import { useShellStore } from '../shell/shellStore';

export default function CollabZone({ activeNodeId, userId, users }) {
  const showCollab         = useShellStore(s => s.showCollab);
  const collabWidth        = useShellStore(s => s.collabWidth);
  const setCollabWidth     = useShellStore(s => s.setCollabWidth);
  const closeCollab        = useShellStore(s => s.closeCollab);
  const versionFilter      = useShellStore(s => s.collabVersionFilter);
  const clearVersionFilter = useShellStore(s => s.setVersionFilter);
  const triggerText        = useShellStore(s => s.collabTriggerText);
  const clearTriggerText   = useShellStore(s => s.clearTriggerText);
  const collabTabs         = useShellStore(s => s.collabTabs);

  const startResize = useCallback((e) => {
    const startX = e.clientX, startW = collabWidth;
    function onMove(ev) { setCollabWidth(Math.max(240, Math.min(560, startW + startX - ev.clientX))); }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [collabWidth, setCollabWidth]);

  if (!showCollab || !activeNodeId) return null;

  return (
    <>
      <div className="resize-handle comment-resize" onMouseDown={startResize} />
      <CommentPanel
        nodeId={activeNodeId}
        userId={userId}
        width={collabWidth}
        onClose={closeCollab}
        filterVersionId={versionFilter}
        onClearFilter={() => clearVersionFilter(null)}
        users={users}
        triggerText={triggerText}
        onClearTrigger={clearTriggerText}
      />
      {collabTabs.map(tab => (
        <div key={tab.id} style={{ display: 'none' }} />
      ))}
    </>
  );
}
