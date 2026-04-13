import { create } from 'zustand';
import { api, txApi } from '../services/api';

/**
 * Global PLM store — single source of truth for navigation tree,
 * active transaction, and open node descriptions.
 *
 * Flux contract:
 *   WS event arrives → dispatch store action (refreshNodeDesc / refreshNodes / refreshTx)
 *   → Zustand updates state → subscribed components re-render
 *
 * Components must NOT fetch node descriptions independently; they subscribe to
 * activeNodeDescs[nodeId] and call refreshNodeDesc(nodeId) to trigger a reload.
 */
export const usePlmStore = create((set, get) => ({

  // Identity
  userId: null,
  setUserId: (id) => set({ userId: id }),

  // Navigation tree
  nodes: [],
  refreshNodes: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const data = await api.listNodes(userId);
      set({ nodes: Array.isArray(data) ? data : [] });
    } catch (_) { /* callers handle toasts */ }
  },

  // Current open transaction
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
    } catch (_) {
      set({ activeTx: null, txNodes: [] });
    }
  },

  // Convenience: refresh nodes + tx in parallel
  refreshAll: async () => {
    const { refreshNodes, refreshTx } = get();
    await Promise.all([refreshNodes(), refreshTx()]);
  },

  // Imperative clear (e.g. immediately after rollback)
  clearTx: () => set({ activeTx: null, txNodes: [] }),

  // Node description cache
  // Keyed by nodeId. Populated when a NodeEditor tab opens; evicted when closed.
  // WS events and explicit refreshes update this map so all subscribers re-render.
  activeNodeDescs: {},

  // Sequence counter per nodeId — incremented on every refreshNodeDesc call.
  // Only the response to the latest request is applied; stale concurrent responses
  // (e.g. a WS-triggered fetch without txId racing against an action-triggered fetch
  // with txId) are silently discarded.
  _nodeDescSeq: {},

  /**
   * Fetch (or re-fetch) the description for nodeId and store it.
   * Reads userId and activeTx from the store — always call refreshTx/refreshAll
   * before this when you know the tx context has changed.
   *
   * Uses a per-node sequence counter so a slower concurrent response from a
   * WS-triggered call (lacking txId) cannot overwrite a faster response from an
   * action-triggered call that already carries the correct txId.
   */
  refreshNodeDesc: async (nodeId) => {
    const { userId, activeTx, _nodeDescSeq } = get();
    const txId = activeTx?.ID || activeTx?.id || null;
    if (!nodeId || !userId) return;

    // Stamp this request; only apply result if no newer request was issued
    const seq = (_nodeDescSeq[nodeId] || 0) + 1;
    set(state => ({ _nodeDescSeq: { ...state._nodeDescSeq, [nodeId]: seq } }));

    try {
      const desc = await api.getNodeDescription(userId, nodeId, txId);
      if ((get()._nodeDescSeq[nodeId] || 0) === seq) {
        set(state => ({
          activeNodeDescs: { ...state.activeNodeDescs, [nodeId]: desc },
        }));
      }
    } catch (_) {}
  },

  /**
   * Optimistic patch: update attribute values in-place after an auto-save
   * so inputs don't snap back to stale server values while the next refresh is in-flight.
   */
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

  /** Remove a node description from the cache (called when a tab is closed). */
  evictNodeDesc: (nodeId) => set(state => {
    const copy = { ...state.activeNodeDescs };
    delete copy[nodeId];
    return { activeNodeDescs: copy };
  }),

  /**
   * Re-fetch all currently cached node descriptions.
   * Call after TX_COMMITTED / TX_ROLLED_BACK so open editors reflect the new state.
   */
  refreshAllNodeDescs: async () => {
    const { activeNodeDescs, refreshNodeDesc } = get();
    const nodeIds = Object.keys(activeNodeDescs);
    if (nodeIds.length === 0) return;
    await Promise.all(nodeIds.map(nid => refreshNodeDesc(nid)));
  },
}));
