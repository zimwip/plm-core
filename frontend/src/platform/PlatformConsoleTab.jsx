import React, { useEffect, useRef } from 'react';
import { useShellStore } from '../shell/shellStore';

const LEVEL_COLOR = {
  error: 'var(--danger, #fc8181)',
  warn:  'var(--warning, #f0b429)',
  info:  'var(--muted)',
  debug: 'var(--muted2)',
};

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function PlatformConsoleTab() {
  const log     = useShellStore(s => s.consoleLog);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log.length]);

  if (log.length === 0) {
    return (
      <div style={{ padding: '16px', color: 'var(--muted)', fontSize: 12, fontStyle: 'italic' }}>
        No platform events yet.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: 11, overflow: 'auto', height: '100%', padding: '4px 8px' }}>
      {log.map((entry, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, lineHeight: '18px' }}>
          <span style={{ color: 'var(--muted2)', flexShrink: 0 }}>{fmtTime(entry.ts)}</span>
          <span style={{ color: LEVEL_COLOR[entry.level] ?? 'inherit', flexShrink: 0, width: 40 }}>
            {entry.level?.toUpperCase()}
          </span>
          <span style={{ wordBreak: 'break-all' }}>{entry.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
