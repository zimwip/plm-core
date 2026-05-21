import React from 'react';
import { NODE_ICONS, PinIcon, PinOffIcon } from './Icons';

export default function SearchItem({ hit, descriptor, isPinned, onPin, onUnpin, ctx }) {
  let source = {};
  try { source = JSON.parse(hit.sourceJson || '{}'); } catch {}

  const label    = source.logicalId || source.logical_id || source.originalName || hit.id;
  const typeName = descriptor?.displayName || hit.itemCode || hit.type || '';
  const { onNavigate } = ctx;
  const NtIcon   = descriptor?.icon ? NODE_ICONS[descriptor.icon] : null;

  return (
    <div
      className="node-item"
      onClick={() => onNavigate(hit.id, label, descriptor)}
      title={label}
    >
      {NtIcon
        ? <NtIcon size={11} color={descriptor.color || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
        : descriptor?.color
          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: descriptor.color, flexShrink: 0, display: 'inline-block' }} />
          : null}
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {typeName && (
        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0 }}>
          {typeName}
        </span>
      )}
      <button
        className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
        title={isPinned ? 'Remove from basket' : 'Add to basket'}
        onClick={e => { e.stopPropagation(); isPinned ? onUnpin?.() : onPin?.(); }}
      >
        {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
      </button>
    </div>
  );
}
