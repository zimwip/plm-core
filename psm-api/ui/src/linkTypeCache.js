const _cache = new Map(); // linkTypeId → LinkTypeDescriptor

export async function getLinkTypeDescriptor(linkTypeId, fetchFn) {
  if (_cache.has(linkTypeId)) return _cache.get(linkTypeId);
  const desc = await fetchFn(linkTypeId);
  _cache.set(linkTypeId, desc);
  return desc;
}

export function clearLinkTypeCache() { _cache.clear(); }
