import { create } from 'zustand';
import { api, basketApi, kvApi, txApi } from '../services/api';

/**
 * Global PLM store — single source of truth for navigation tree,
 * active transaction, open node descriptions, and shared metadata.
 *
 * Flux contract:
 *   WS event arrives → dispatch store action
 *   → Zustand updates state → subscribed components re-render
 *
 * Metadata slices (items, nodeTypes, resources, stateColorMap,
 * projectSpaces, users) are loaded once at boot and refreshed on
 * matching WS events. Components must NOT fetch these independently.
 */
export const usePlmStore = create((set, get) => ({

  // Identity
  userId: null,
  setUserId: (id) => set({ userId: id }),
  projectSpaceId: null,
  setProjectSpaceId: (id) => set({ projectSpaceId: id }),

  // ── Metadata: platform/items ──────────────────────────────────────
  // Raw item descriptors from platform-api. Derived slices:
  //   nodeTypes: PSM listable items (tree grouping + search styling)
  //   resources: items with create action (create modal)
  // Single fetch populates all three; refreshNodes reuses the cached
  // items array so no second getItems call is ever needed.
  items: [],
  nodeTypes: [],
  resources: [],
  itemsStatus: 'idle', // 'idle' | 'loading' | 'loaded'

  refreshItems: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ itemsStatus: 'loading' });
    try {
      const rawItems = await api.getItems(userId);
      const arr = Array.isArray(rawItems) ? rawItems : [];
      const nodeTypes = arr
        .filter(d => d.serviceCode === 'psm' && d.itemCode === 'node' && d.itemKey && d.list)
        .map(d => ({
          id:          d.itemKey,
          name:        d.displayName,
          description: d.description,
          color:       d.color,
          icon:        d.icon,
        }));
      const resources = arr.filter(d => d.create);
      // Refresh the node list using the just-fetched descriptors — no second getItems call.
      const psmDescs = arr.filter(d => d.serviceCode === 'psm' && d.itemCode === 'node' && d.list);
      const pages = await Promise.all(
        psmDescs.map(d => api.fetchListableItems(userId, d, 0, 50)
          .then(r => r.items || [])
          .catch(() => []))
      );
      set({ items: arr, nodeTypes, resources, itemsStatus: 'loaded', nodes: pages.flat() });
    } catch {
      set({ items: [], nodeTypes: [], resources: [], itemsStatus: 'idle' });
    }
  },

  // ── Metadata: lifecycle state colours ────────────────────────────
  // Loaded lazily (only when Settings opens or a stateColorMap consumer
  // is mounted for the first time). Refreshed on METAMODEL_CHANGED if
  // already loaded (stateColorMapLoaded === true).
  stateColorMap: {},
  stateColorMapLoaded: false,

  refreshStateColorMap: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const lcs = await api.getLifecycles(userId);
      if (!Array.isArray(lcs)) return;
      const stateLists = await Promise.all(
        lcs.map(lc => api.getLifecycleStates(userId, lc.id || lc.ID).catch(() => []))
      );
      const map = {};
      stateLists.forEach(states => states.forEach(s => {
        const id = s.id || s.ID, color = s.color || s.COLOR;
        if (id && color) map[id] = color;
      }));
      set({ stateColorMap: map, stateColorMapLoaded: true });
    } catch {}
  },

  // ── Metadata: PNO (users, project spaces) ────────────────────────
  projectSpaces: [],
  users: [],

  refreshProjectSpaces: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const d = await api.listProjectSpaces(userId);
      set({ projectSpaces: Array.isArray(d) ? d : [] });
    } catch {}
  },

  refreshUsers: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const d = await api.listUsers(userId);
      set({ users: Array.isArray(d) ? d.filter(u => u.active !== false) : [] });
    } catch {}
  },

  // ── PSM node list ─────────────────────────────────────────────────
  // Used by the global Header search dropdown only.
  // Lightweight refresh: reuses cached items, only re-fetches node pages.
  // Call refreshItems() instead when the item catalog itself may have changed.
  nodes: [],

  refreshNodes: async () => {
    const { userId, items } = get();
    if (!userId) return;
    try {
      const psmDescs = items.filter(d => d.serviceCode === 'psm' && d.itemCode === 'node' && d.list);
      const pages = await Promise.all(
        psmDescs.map(d => api.fetchListableItems(userId, d, 0, 50)
          .then(r => r.items || [])
          .catch(() => []))
      );
      set({ nodes: pages.flat() });
    } catch {}
  },

  // ── Transaction ───────────────────────────────────────────────────
  activeTx: null,
  txNodes: [],

  // IDs of psm nodes currently locked by the current user (checked out or
  // just locked). Seeded from txNodes on refreshTx; kept in sync via
  // LOCK_ACQUIRED / LOCK_RELEASED WS events. Used to block basket unpin.
  lockedByMe: new Set(),
  lockItem:   (nodeId) => set(s => { const n = new Set(s.lockedByMe); n.add(nodeId);    return { lockedByMe: n }; }),
  unlockItem: (nodeId) => set(s => { const n = new Set(s.lockedByMe); n.delete(nodeId); return { lockedByMe: n }; }),
  unlockAll:  ()       => set({ lockedByMe: new Set() }),

  refreshTx: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const t = await txApi.current(userId);
      if (t) {
        const txId = t.ID || t.id;
        const tvn  = await txApi.nodes(userId, txId).catch(() => []);
        const nodes = Array.isArray(tvn) ? tvn : [];
        const locked = new Set(nodes.map(n => n.node_id || n.NODE_ID).filter(Boolean));
        set({ activeTx: t, txNodes: nodes, lockedByMe: locked });
      } else {
        set({ activeTx: null, txNodes: [], lockedByMe: new Set() });
      }
    } catch {
      set({ activeTx: null, txNodes: [], lockedByMe: new Set() });
    }
  },

  clearTx: () => set({ activeTx: null, txNodes: [], lockedByMe: new Set() }),

  // Full refresh: items (+ nodes derived) + tx in parallel.
  // Replaces the previous refreshNodes+refreshTx pair so a single
  // api.getItems() call serves both the node list and the UI catalog.
  refreshAll: async () => {
    const { refreshItems, refreshTx } = get();
    await Promise.all([refreshItems(), refreshTx()]);
  },

  // ── Basket ────────────────────────────────────────────────────────
  // Maps "source:typeCode" → Set<itemId>.
  // Scoped to the active project space. Auto-populated on ITEM_CREATED events
  // and by direct user interactions (pin/unpin). Loaded once per login.
  basketItems: {},
  basketLoaded: false,

  loadBasket: async (userId) => {
    if (!userId) return;
    try {
      const entries = await basketApi.list(userId);
      const map = {};
      (entries || []).forEach(({ source, typeCode, itemId }) => {
        const key = `${source}:${typeCode}`;
        if (!map[key]) map[key] = new Set();
        map[key].add(itemId);
      });
      set({ basketItems: map, basketLoaded: true });
    } catch {
      set({ basketItems: {}, basketLoaded: true });
    }
  },

  addToBasket: async (userId, source, typeCode, itemId) => {
    const key = `${source}:${typeCode}`;
    set(state => {
      const prev = state.basketItems[key] ? new Set(state.basketItems[key]) : new Set();
      prev.add(itemId);
      return { basketItems: { ...state.basketItems, [key]: prev } };
    });
    try {
      await basketApi.add(userId, source, typeCode, itemId);
    } catch { /* best-effort */ }
  },

  removeFromBasket: async (userId, source, typeCode, itemId) => {
    const key = `${source}:${typeCode}`;
    set(state => {
      const prev = state.basketItems[key] ? new Set(state.basketItems[key]) : new Set();
      prev.delete(itemId);
      return { basketItems: { ...state.basketItems, [key]: prev } };
    });
    try {
      await basketApi.remove(userId, source, typeCode, itemId);
    } catch { /* best-effort */ }
  },

  emptyBasket: async (userId) => {
    const { lockedByMe, basketItems } = get();
    const lockedPsmIds = new Set(lockedByMe);
    const hasLocked = [...Object.entries(basketItems)].some(([key, ids]) =>
      key.startsWith('psm:') && [...ids].some(id => lockedPsmIds.has(id))
    );
    if (!hasLocked) {
      set({ basketItems: {} });
      try { await basketApi.clear(userId); } catch { /* best-effort */ }
      return;
    }
    // Slow path: remove only non-locked items one by one.
    const nextItems = {};
    const removes = [];
    for (const [key, ids] of Object.entries(basketItems)) {
      const colonIdx = key.indexOf(':');
      const source   = colonIdx > -1 ? key.slice(0, colonIdx) : key;
      const typeCode = colonIdx > -1 ? key.slice(colonIdx + 1) : '';
      const kept = new Set();
      for (const id of ids) {
        if (source === 'psm' && lockedPsmIds.has(id)) { kept.add(id); continue; }
        removes.push(basketApi.remove(userId, source, typeCode, id).catch(() => {}));
      }
      if (kept.size > 0) nextItems[key] = kept;
    }
    set({ basketItems: nextItems });
    await Promise.all(removes);
  },

  isInBasket: (source, typeCode, itemId) => {
    const key = `${source}:${typeCode}`;
    const { basketItems } = usePlmStore.getState();
    return !!(basketItems[key] && basketItems[key].has(itemId));
  },

  syncBasketAdd: (key, value) => set(state => {
    const prev = state.basketItems[key] ? new Set(state.basketItems[key]) : new Set();
    prev.add(value);
    return { basketItems: { ...state.basketItems, [key]: prev } };
  }),
  syncBasketRemove: (key, value) => set(state => {
    if (!state.basketItems[key]) return {};
    const next = new Set(state.basketItems[key]);
    next.delete(value);
    return { basketItems: { ...state.basketItems, [key]: next } };
  }),
  syncBasketClear: () => set({ basketItems: {} }),

  // Remove specific item IDs (e.g. nodes deleted by rollback) from all basket keys.
  removeBasketItemIds: (itemIds) => set(state => {
    const ids = new Set(itemIds);
    const next = {};
    for (const [key, values] of Object.entries(state.basketItems)) {
      const filtered = new Set([...values].filter(v => !ids.has(v)));
      if (filtered.size > 0) next[key] = filtered;
    }
    return { basketItems: next };
  }),

  // ── Plugin store slices ───────────────────────────────────────────
  // Remote plugins register their own state via shellAPI.store.registerSlice().
  // State lives under _slices[name]; actions under _sliceActions[name].
  _slices: {},
  _sliceActions: {},

}));
