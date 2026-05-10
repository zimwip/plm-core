import React from 'react';
import StatusBar from '../components/StatusBar';
import { useShellStore } from '../shell/shellStore';

export default function StatusBarZone(props) {
  const statusSlots    = useShellStore(s => s.statusSlots);
  const consoleVisible = useShellStore(s => s.consoleVisible);
  const toggleConsole  = useShellStore(s => s.toggleConsole);
  const leftSlots      = statusSlots.filter(s => s.position !== 'right');
  const rightSlots     = statusSlots.filter(s => s.position === 'right');

  return (
    <StatusBar
      {...props}
      leftSlots={leftSlots}
      rightSlots={rightSlots}
      consoleVisible={consoleVisible}
      onToggleConsole={toggleConsole}
    />
  );
}
