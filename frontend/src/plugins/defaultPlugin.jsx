import React from 'react';
import GenericDetailEditor from '../components/GenericDetailEditor';
import { PinIcon, PinOffIcon } from '../components/Icons';

/**
 * Catch-all plugin used when no source-specific plugin matches a
 * descriptor. NavRow renders a minimal id/label row driven by
 * {@code list.itemShape}; the editor delegates to
 * {@link GenericDetailEditor}, which relies on the descriptor's
 * {@code get} action — so any source that ships the standard
 * three-action contract works without a bespoke plugin.
 */

export function DefaultNavRow({ descriptor, item, ctx, isActive, isPinned, onPin, onUnpin }) {
  const idField = descriptor.list?.itemShape?.idField || 'id';
  const labelField = descriptor.list?.itemShape?.labelField || 'id';
  const id = item[idField] || item.id;
  const label = item[labelField] || id;
  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => ctx.onNavigate(id, label, descriptor)}
      title={label}
    >
      <span className="ni-expand" style={{ visibility: 'hidden' }} />
      <span className="ni-logical" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {(onPin || onUnpin) && (
        <button
          className={`search-pin-btn${isPinned ? ' pinned' : ''}`}
          title={isPinned ? 'Remove from basket' : 'Add to basket'}
          onClick={e => { e.stopPropagation(); isPinned ? onUnpin?.() : onPin?.(); }}
        >
          {isPinned ? <PinOffIcon size={11} strokeWidth={2} /> : <PinIcon size={11} strokeWidth={2} />}
        </button>
      )}
    </div>
  );
}

export const defaultPlugin = {
  match: { serviceCode: '*' },
  name: 'default',
  NavRow: DefaultNavRow,
  Editor: GenericDetailEditor,
  hasItemChildren: () => false,
};
