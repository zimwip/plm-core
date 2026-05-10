import React from 'react';
import EditorArea from '../components/EditorArea';
import { useShellStore } from '../shell/shellStore';

export default function EditorZone(props) {
  const openCollab      = useShellStore(s => s.openCollab);
  const setVersionFilter = useShellStore(s => s.setVersionFilter);
  const setTriggerText  = useShellStore(s => s.setTriggerText);

  return (
    <EditorArea
      {...props}
      onOpenCommentsForVersion={(versionId) => {
        setVersionFilter(versionId);
        openCollab();
      }}
      onCommentAttribute={(attrId) => {
        setTriggerText('#' + attrId + ' ');
        openCollab();
      }}
    />
  );
}
