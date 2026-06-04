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
    type:   tab.itemCode || '',  // itemCode is now the type discriminator (e.g. 'nt-part')
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

/** Unique key for a descriptor — serviceCode:itemCode. */
export function descriptorKey(descriptor) {
  return `${descriptor.serviceCode}:${descriptor.itemCode || ''}`;
}

/** True when a descriptor matches a NavItemRef. */
export function descriptorMatchesRef(descriptor, ref) {
  return descriptor.serviceCode === ref.source && descriptor.itemCode === ref.type;
}

/**
 * Build a flat item object from a DetailDescriptor's values (or fields for backward compat).
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
  for (const f of (detail.values ?? detail.fields ?? [])) {
    item[f.name] = f.value;
  }
  // PSM system/identity fields live in metadata (not duplicated into values).
  // Map the camelCase metadata envelope to the snake_case nav props NavRow reads.
  const m = detail.metadata;
  if (m) {
    const sys = {
      logical_id:         m.logicalId,
      revision:           m.revision,
      iteration:          m.iteration,
      lifecycle_state_id: m.state,
      tx_status:          m.txStatus,
      locked_by:          m.lock?.lockedBy || null,
      node_type_id:       m.nodeTypeId,
      display_name:       m.displayName,
    };
    for (const [k, v] of Object.entries(sys)) {
      if (v !== undefined && item[k] === undefined) item[k] = v;
    }
  }
  return item;
}
