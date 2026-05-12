import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchItemDetail } from '../services/api';
import { usePlmStore } from '../store/usePlmStore';
import { lookupPluginForDescriptor } from '../services/sourcePlugins';
import { detailToItem } from '../shell/navTypes';
import NavItem from './NavItem';

const MAX_LINK_DEPTH = 8;

/**
 * Stateful wrapper around NavItem. Per-item responsibilities:
 * - Lazy fetch item data when not provided via initialItem
 * - First-level expand + children load via plugin.fetchChildren
 * - Recursive child rendering via plugin.ChildRow (same contract as BrowseNav)
 */
export default function NavShell({ descriptor, itemRef, initialItem, ctx, isOpen, isPinned }) {
  const [item, setItem] = useState(initialItem ?? null);
  const [itemLoading, setItemLoading] = useState(!initialItem && !!descriptor?.get);
  const [fetchError,  setFetchError]  = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const childCacheRef = useRef({});
  const [expandedPaths, setExpandedPaths] = useState(new Set());
  const [, setCacheTick] = useState(0);

  const addToBasket     = usePlmStore(s => s.addToBasket);
  const removeFromBasket = usePlmStore(s => s.removeFromBasket);
  const lockedByMe      = usePlmStore(s => s.lockedByMe);
  const storeUserId     = usePlmStore(s => s.userId);

  // Sync when caller provides updated data (e.g. tabData loaded after mount).
  useEffect(() => {
    if (initialItem) {
      setItem(initialItem);
      setItemLoading(false);
      setFetchError(false);
    }
  }, [initialItem]);

  // Lazy-fetch item data if not provided.
  useEffect(() => {
    if (initialItem || !descriptor?.get) {
      if (!initialItem) setItemLoading(false);
      return;
    }
    let cancelled = false;
    setItemLoading(true);
    setFetchError(false);
    fetchItemDetail(descriptor.serviceCode, descriptor.get, itemRef.key)
      .then(detail => {
        if (!cancelled) {
          const resolved = detailToItem(detail);
          if (resolved) {
            setItem(resolved);
            setFetchError(false);
          } else {
            setFetchError(true);
          }
          setItemLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFetchError(true);
          setItemLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [itemRef.key, descriptor?.serviceCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const plugin = lookupPluginForDescriptor(descriptor);
  const resolvedItem = item || { id: itemRef.key, _title: itemRef.key };
  const itemId = resolvedItem.id || resolvedItem.ID || itemRef.key;
  const isActive = ctx.activeNodeId === itemId;
  const isLocked = descriptor?.serviceCode === 'psm' && lockedByMe.has(itemId);
  const hasChildren = !itemLoading && item && plugin.hasItemChildren
    ? plugin.hasItemChildren(resolvedItem)
    : false;

  const onPin = useCallback(() => {
    addToBasket(storeUserId, descriptor.serviceCode, descriptor.itemKey || descriptor.itemCode, itemId);
  }, [addToBasket, storeUserId, descriptor, itemId]);

  const onUnpinFn = useCallback(() => {
    removeFromBasket(storeUserId, descriptor.serviceCode, descriptor.itemKey || descriptor.itemCode, itemId);
  }, [removeFromBasket, storeUserId, descriptor, itemId]);

  const onUnpin = isLocked ? null : onUnpinFn;

  // Toggle first-level expansion; fetch children if not yet cached.
  const toggleExpand = useCallback(async (e) => {
    e?.stopPropagation();
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    if (!willExpand) return;
    if (childCacheRef.current[itemId] !== undefined) return;
    if (!plugin.fetchChildren) { childCacheRef.current[itemId] = []; return; }

    childCacheRef.current[itemId] = 'loading';
    setChildrenLoading(true);
    setCacheTick(t => t + 1);
    try {
      const result = await plugin.fetchChildren(resolvedItem, ctx);
      childCacheRef.current[itemId] = Array.isArray(result) ? result : [];
    } catch {
      childCacheRef.current[itemId] = [];
    } finally {
      setChildrenLoading(false);
      setCacheTick(t => t + 1);
    }
  }, [isExpanded, itemId, plugin, resolvedItem, ctx]);

  // Callback passed to ChildRow so it can load its own sub-children.
  const toggleNodeChildren = useCallback(async (pathKey, nid, e) => {
    if (e) e.stopPropagation();
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey); else next.add(pathKey);
      return next;
    });
    if (childCacheRef.current[nid] !== undefined) return;
    if (!plugin.fetchChildren) { childCacheRef.current[nid] = []; return; }

    childCacheRef.current[nid] = 'loading';
    setCacheTick(t => t + 1);
    try {
      const result = await plugin.fetchChildren({ id: nid }, ctx);
      childCacheRef.current[nid] = Array.isArray(result) ? result : [];
    } catch {
      childCacheRef.current[nid] = [];
    }
    setCacheTick(t => t + 1);
  }, [plugin, ctx]);

  function renderChildTree(parentItem, parentPath, depth, ancestorIds) {
    if (depth > MAX_LINK_DEPTH) return null;
    const parentId = parentItem.id || parentItem.ID || parentPath;
    const cached = childCacheRef.current[parentId];
    if (!Array.isArray(cached) || cached.length === 0 || !plugin.ChildRow) return null;

    return cached.map(child => {
      const childId = child.targetNodeId || child.id || child.ID;
      const childPath = `${parentPath}/${child.linkId || childId}`;
      const isCycle = ancestorIds.has(childId);
      const isChildExp = !isCycle && expandedPaths.has(childPath);

      return (
        <React.Fragment key={childPath}>
          <plugin.ChildRow
            link={child}
            child={child}
            depth={depth}
            parentPath={childPath}
            ancestorIds={ancestorIds}
            ctx={ctx}
            childCacheRef={childCacheRef}
            expandedPaths={expandedPaths}
            toggleNodeChildren={(pk, nid, ev) => toggleNodeChildren(pk, nid, ev)}
          />
          {isChildExp && renderChildTree(
            { id: childId },
            childPath,
            depth + 1,
            new Set([...ancestorIds, childId]),
          )}
        </React.Fragment>
      );
    });
  }

  const itemPath = `${descriptor?.serviceCode || ''}:${descriptor?.itemCode || ''}:${itemId}`;
  const isChildrenLoading = childCacheRef.current[itemId] === 'loading' || childrenLoading;

  if (itemLoading) {
    return (
      <div className="node-item" style={{ color: 'var(--muted)', fontSize: 10, paddingLeft: 24 }}>…</div>
    );
  }

  if (fetchError) {
    return (
      <div
        className="node-item"
        title={`Could not resolve item: ${itemRef.key}`}
        style={{ color: 'var(--danger, #e55)', fontSize: 10, gap: 6, cursor: 'default' }}
      >
        <span style={{ opacity: .7 }}>⚠</span>
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
          {itemRef.key}
        </span>
      </div>
    );
  }

  return (
    <>
      <NavItem
        descriptor={descriptor}
        item={resolvedItem}
        ctx={ctx}
        isActive={isActive}
        isOpen={isOpen}
        isPinned={isPinned}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        isLoading={isChildrenLoading}
        onToggleExpand={toggleExpand}
        onToggleChildren={toggleExpand}
        onPin={onPin}
        onUnpin={onUnpin}
      />
      {isExpanded && renderChildTree(resolvedItem, itemPath, 1, new Set([itemId]))}
    </>
  );
}
