import { create } from 'zustand';
import { api, txApi } from '../services/api';

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

  refreshTx: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const t = await txApi.current(userId);
      if (t) {
        const txId = t.ID || t.id;
        const tvn  = await txApi.nodes(userId, txId).catch(() => []);
        set({ activeTx: t, txNodes: Array.isArray(tvn) ? tvn : [] });
      } else {
        set({ activeTx: null, txNodes: [] });
      }
    } catch {
      set({ activeTx: null, txNodes: [] });
    }
  },

  clearTx: () => set({ activeTx: null, txNodes: [] }),

  // Full refresh: items (+ nodes derived) + tx in parallel.
  // Replaces the previous refreshNodes+refreshTx pair so a single
  // api.getItems() call serves both the node list and the UI catalog.
  refreshAll: async () => {
    const { refreshItems, refreshTx } = get();
    await Promise.all([refreshItems(), refreshTx()]);
  },

  // ── Node description cache ────────────────────────────────────────
  // Keyed by nodeId. Populated when a NodeEditor tab opens; evicted when closed.
  // WS events and explicit refreshes update this map so all subscribers re-render.
  activeNodeDescs: {},

  // Sequence counter per nodeId — incremented on every refreshNodeDesc call.
  // Only the response to the latest request is applied; stale concurrent responses
  // are silently discarded.
  _nodeDescSeq: {},

  refreshNodeDesc: async (nodeId) => {
    const { userId, activeTx, _nodeDescSeq } = get();
    const txId = activeTx?.ID || activeTx?.id || null;
    if (!nodeId || !userId) return;

    const seq = (_nodeDescSeq[nodeId] || 0) + 1;
    set(state => ({ _nodeDescSeq: { ...state._nodeDescSeq, [nodeId]: seq } }));

    try {
      const desc = await api.getNodeDescription(userId, nodeId, txId);
      if ((get()._nodeDescSeq[nodeId] || 0) === seq) {
        set(state => ({
          activeNodeDescs: { ...state.activeNodeDescs, [nodeId]: desc },
        }));
      }
    } catch {}
  },

  patchNodeDescAttrs: (nodeId, pendingEdits) => set(state => {
    const prev = state.activeNodeDescs[nodeId];
    if (!prev) return state;
    const updatedAttrs = (prev.attributes || []).map(a =>
      pendingEdits[a.id] !== undefined ? { ...a, value: pendingEdits[a.id] } : a
    );
    return {
      activeNodeDescs: {
        ...state.activeNodeDescs,
        [nodeId]: { ...prev, attributes: updatedAttrs },
      },
    };
  }),

  evictNodeDesc: (nodeId) => set(state => {
    const copy = { ...state.activeNodeDescs };
    delete copy[nodeId];
    return { activeNodeDescs: copy };
  }),

  refreshAllNodeDescs: async () => {
    const { activeNodeDescs, refreshNodeDesc } = get();
    const nodeIds = Object.keys(activeNodeDescs);
    if (nodeIds.length === 0) return;
    await Promise.all(nodeIds.map(nid => refreshNodeDesc(nid)));
  },
}));
