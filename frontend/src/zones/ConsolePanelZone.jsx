import React, { useCallback, useState } from 'react';
import PlatformConsoleTab from '../platform/PlatformConsoleTab';
import { useShellStore } from '../shell/shellStore';

export default function ConsolePanelZone() {
  const visible        = useShellStore(s => s.consoleVisible);
  const height         = useShellStore(s => s.consoleHeight);
  const setHeight      = useShellStore(s => s.setConsoleHeight);
  const pluginTabs     = useShellStore(s => s.consoleTabs);

  const [activeTabId, setActiveTabId] = useState('console');

  const allTabs = [
    { id: 'console', label: 'Console', Component: PlatformConsoleTab },
    ...pluginTabs,
  ];

  const startResize = useCallback((e) => {
    e.preventDefault();
    const startY = e.clientY, startH = height;
    function onMove(ev) { setHeight(Math.max(80, Math.min(600, startH + startY - ev.clientY))); }
    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [height, setHeight]);

  if (!visible) return null;

  const ActiveComponent = allTabs.find(t => t.id === activeTabId)?.Component ?? PlatformConsoleTab;

  return (
    <div style={{ height, flexShrink: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
      <div
        style={{ height: 4, cursor: 'row-resize', background: 'var(--border)', flexShrink: 0 }}
        onMouseDown={startResize}
      />
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        {allTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: activeTabId === tab.id ? 600 : 400,
              color: activeTabId === tab.id ? 'var(--fg)' : 'var(--muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTabId === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <ActiveComponent />
      </div>
    </div>
  );
}
