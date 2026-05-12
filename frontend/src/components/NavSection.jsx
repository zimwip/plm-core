import React, { useState, useMemo } from 'react';
import { NODE_ICONS, ChevronRightIcon, ChevronDownIcon, PlusIcon, UploadIcon } from './Icons';
import NavShell from './NavShell';

/**
 * One descriptor section in NavPanel. Shows all open + pinned items for
 * that descriptor. Empty sections still render so create/import actions
 * remain accessible.
 */
export default function NavSection({
  descriptor,
  openItemIds,
  pinnedItemIds,
  openItemDataMap,
  ctx,
  onCreateNode,
  onOpenImport,
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Dedup union: pinned items first, then open-only items.
  const allItems = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const id of pinnedItemIds) {
      if (!seen.has(id)) {
        seen.add(id);
        result.push({ id, isPinned: true, isOpen: openItemIds.includes(id) });
      }
    }
    for (const id of openItemIds) {
      if (!seen.has(id)) {
        seen.add(id);
        result.push({ id, isPinned: false, isOpen: true });
      }
    }
    return result;
  }, [openItemIds, pinnedItemIds]);

  const NtIcon = descriptor.icon ? NODE_ICONS[descriptor.icon] : null;
  const count  = allItems.length;

  return (
    <div>
      <div className="type-group-hd" onClick={() => setIsExpanded(v => !v)}>
        <span className="type-chevron">
          {isExpanded
            ? <ChevronDownIcon  size={11} strokeWidth={2.5} color="var(--muted)" />
            : <ChevronRightIcon size={11} strokeWidth={2.5} color="var(--muted)" />}
        </span>
        {NtIcon
          ? <NtIcon size={11} color={descriptor.color || 'var(--muted)'} strokeWidth={2} style={{ flexShrink: 0 }} />
          : descriptor.color
            ? <span style={{ width: 7, height: 7, borderRadius: 1, background: descriptor.color, flexShrink: 0 }} />
            : null}
        <span className="type-group-name" title={descriptor.description || undefined}>
          {descriptor.displayName}
        </span>
        <span className="type-group-count">{count || ''}</span>
        {descriptor.create && onCreateNode && (
          <button
            className="type-group-create-btn"
            title={`Create ${descriptor.displayName}`}
            onClick={e => { e.stopPropagation(); onCreateNode(descriptor); }}
          >
            <PlusIcon size={10} strokeWidth={2.5} />
          </button>
        )}
        {descriptor.importActions?.length > 0 && onOpenImport && (
          <button
            className="type-group-create-btn"
            title={descriptor.importActions[0].name || `Import ${descriptor.displayName}`}
            onClick={e => { e.stopPropagation(); onOpenImport(descriptor, descriptor.importActions[0]); }}
          >
            <UploadIcon size={10} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="node-list">
          {allItems.length === 0 && (
            <div className="panel-empty" style={{ fontSize: 10 }}>Empty</div>
          )}
          {allItems.map(({ id, isPinned, isOpen }) => (
            <NavShell
              key={id}
              descriptor={descriptor}
              itemRef={{ source: descriptor.serviceCode, type: descriptor.itemKey || descriptor.itemCode || '', key: id }}
              initialItem={openItemDataMap[id] || undefined}
              ctx={ctx}
              isOpen={isOpen}
              isPinned={isPinned}
            />
          ))}
        </div>
      )}
    </div>
  );
}
