// Neutral item identity for the navigation system.
// source = serviceCode (tag for project segregation is future scope).

/**
 * @typedef {{ source: string, type: string, key: string }} NavItemRef
 */

/** @param {Object} tab */
export function tabToNavItemRef(tab) {
  if (!tab || tab.id === 'dashboard' || !tab.nodeId) return null;
  return {
    source: tab.serviceCode || '',
    type:   tab.itemKey || tab.itemCode || '',  // itemKey for specificity (e.g. 'nt-part'), fallback to itemCode
    key:    tab.nodeId,
  };
}

/** Unique string key for a NavItemRef (used as React key + dedup). */
export function makeNavItemKey(ref) {
  return `${ref.source}:${ref.type}:${ref.key}`;
}

/** Key identifying the descriptor a ref belongs to. */
export function makeDescriptorKey(source, type) {
  return `${source}:${type}`;
}

/**
 * Unique key for a descriptor — uses itemKey when present (for services
 * like PSM where multiple descriptors share the same itemCode).
 */
export function descriptorKey(descriptor) {
  return `${descriptor.serviceCode}:${descriptor.itemKey || descriptor.itemCode || ''}`;
}

/** True when a descriptor matches a NavItemRef. */
export function descriptorMatchesRef(descriptor, ref) {
  return descriptor.serviceCode === ref.source &&
    (descriptor.itemCode === ref.type || descriptor.itemKey === ref.type);
}

/**
 * Build a flat item object from a DetailDescriptor's `fields` array.
 * PSM NavRow reads item.logical_id, item.revision, etc. — this maps
 * field.name → value so those reads work on detail data.
 * Type identity (_serviceCode, _itemCode, _itemKey) is extracted from
 * the standard ItemTypeRef envelope so callers can route without context.
 */
export function detailToItem(detail) {
  if (!detail) return null;
  const item = { id: detail.id, _title: detail.title };
  if (detail.itemType) {
    item._serviceCode = detail.itemType.serviceCode;
    item._itemCode    = detail.itemType.itemCode;
    item._itemKey     = detail.itemType.itemKey ?? null;
  }
  for (const f of detail.fields || []) {
    item[f.name] = f.value;
  }
  return item;
}
