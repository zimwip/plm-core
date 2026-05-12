import React from 'react';
import { lookupPluginForDescriptor } from '../services/sourcePlugins';
import { NODE_ICONS, ChevronRightIcon, ChevronDownIcon, PinIcon, PinOffIcon } from './Icons';

/**
 * Unified item display leaf. Shell owns all chrome; plugin supplies label content only.
 *
 * Plugin contract (NavLabel):
 *   plugin.NavLabel({ item, descriptor, ctx }) → JSX content area (no wrapper, no chrome)
 *   plugin.getRowProps?(item, descriptor, ctx) → extra props spread on outer div (e.g. drag)
 *
 * Falls back to generic label (descriptor.list.itemShape.labelField) when no NavLabel.
 */
export default function NavItem({
  descriptor,
  item,
  ctx,
  isActive,
  isOpen,
  isPinned,
  hasChildren,
  isExpanded,
  isLoading,
  onToggleExpand,
  onToggleChildren,
  onPin,
  onUnpin,
}) {
  const toggle = onToggleExpand || onToggleChildren;
  const plugin = lookupPluginForDescriptor(descriptor);
  const LabelComponent = plugin?.NavLabel;
  const extraRowProps = plugin?.getRowProps?.(item, descriptor, ctx) ?? {};

  const idField    = descriptor.list?.itemShape?.idField    || 'id';
  const labelField = descriptor.list?.itemShape?.labelField || '_title';
  const id    = item?.[idField]    || item?.id    || item?.ID;
  const label = item?.[labelField] || item?._title || id;
  const NtIcon = descriptor.icon ? NODE_ICONS[descriptor.icon] : null;

  return (
    <div
      className={`node-item${isActive ? ' active' : ''}`}
      onClick={() => ctx.onNavigate(id, label, descriptor)}
      title={extraRowProps.title ?? label}
      {...extraRowProps}
    >
      <span
        className="ni-expand"
        style={{ visibility: (isLoading || hasChildren) ? 'visible' : 'hidden' }}
        onClick={e => { e.stopPropagation(); toggle?.(e); }}
      >
        {isLoading
          ? <span style={{ fontSize: 9, color: 'var(--muted)', lineHeight: 1 }}>…</span>
          : isExpanded
            ? <ChevronDownIcon size={9} strokeWidth={2.5} color="var(--muted)" />
            : <ChevronRightIcon size={9} strokeWidth={2.5} color="var(--muted)" />}
      </span>
      {NtIcon
        ? <NtIcon size={11} color={descriptor.color || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
        : descriptor.color
          ? <span style={{ width: 6, height: 6, borderRadius: 1, background: descriptor.color, flexShrink: 0, display: 'inline-block' }} />
          : null}
      {isOpen && !isPinned && (
        <span
          title="Open"
          style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }}
        />
      )}
      {LabelComponent
        ? <LabelComponent item={item} descriptor={descriptor} ctx={ctx} />
        : (
          <span
            className="ni-logical"
            style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {label || id}
          </span>
        )}
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
