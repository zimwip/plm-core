import { api } from './api';

// Map `${serviceCode}:${itemCode}:${itemKey??''}` → ItemTypeDescriptor
const cache = new Map();

function cacheKey({ serviceCode, itemCode, itemKey }) {
  return `${serviceCode}:${itemCode}:${itemKey ?? ''}`;
}

function typeUrl({ serviceCode, itemCode, itemKey }) {
  const key = itemKey ?? itemCode;
  return `/api/${serviceCode}/item-type/${encodeURIComponent(key)}`;
}

export async function getItemTypeDescriptor(itemType) {
  if (!itemType?.serviceCode) return null;
  const key = cacheKey(itemType);
  if (cache.has(key)) return cache.get(key);
  try {
    const descriptor = await api.gatewayJson('GET', typeUrl(itemType));
    cache.set(key, descriptor);
    return descriptor;
  } catch {
    return null;
  }
}

export function invalidateItemTypeCache(itemType) {
  if (itemType) cache.delete(cacheKey(itemType));
}

export function clearItemTypeCache() {
  cache.clear();
}
