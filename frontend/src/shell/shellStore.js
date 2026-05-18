import { create } from 'zustand';

export const useShellStore = create((set) => ({
  // ── Collab panel (right) ─────────────────────────────────────────
  showCollab:          false,
  collabWidth:         320,
  collabVersionFilter: null,
  collabTriggerText:   null,
  collabTabs:          [],  // [{id, label, Component}] — plugin-added tabs

  toggleCollab:    () => set(s => ({ showCollab: !s.showCollab })),
  openCollab:      () => set({ showCollab: true }),
  closeCollab:     () => set({ showCollab: false }),
  setCollabWidth:  (w) => set({ collabWidth: w }),
  setVersionFilter: (versionId) => set({ collabVersionFilter: versionId }),
  setTriggerText:   (text)      => set({ collabTriggerText: text }),
  clearTriggerText: ()          => set({ collabTriggerText: null }),
  addCollabTab:    (id, label, Component) => set(s => ({
    collabTabs: s.collabTabs.some(t => t.id === id)
      ? s.collabTabs
      : [...s.collabTabs, { id, label, Component }],
  })),
  removeCollabTab: (id) => set(s => ({ collabTabs: s.collabTabs.filter(t => t.id !== id) })),

  // ── Console panel (bottom) ───────────────────────────────────────
  consoleVisible: false,
  consoleHeight:  220,
  consoleTabs:    [],  // [{id, label, Component}] — plugin-added tabs
  consoleLog:     [],  // [{level, message, ts}]

  toggleConsole:   () => set(s => ({ consoleVisible: !s.consoleVisible })),
  openConsole:     () => set({ consoleVisible: true }),
  setConsoleHeight: (h) => set({ consoleHeight: h }),
  addConsoleTab:   (id, label, Component) => set(s => ({
    consoleTabs: s.consoleTabs.some(t => t.id === id)
      ? s.consoleTabs
      : [...s.consoleTabs, { id, label, Component }],
  })),
  removeConsoleTab: (id) => set(s => ({ consoleTabs: s.consoleTabs.filter(t => t.id !== id) })),
  appendLog: (level, message) => set(s => ({
    consoleLog: [...s.consoleLog.slice(-500), { level, message, ts: Date.now() }],
  })),

  // ── Status bar slots ─────────────────────────────────────────────
  statusSlots: [],  // [{id, Component, position: 'left'|'right'}]

  registerStatus: (id, Component, position = 'left') => set(s => ({
    statusSlots: s.statusSlots.some(sl => sl.id === id)
      ? s.statusSlots.map(sl => sl.id === id ? { id, Component, position } : sl)
      : [...s.statusSlots, { id, Component, position }],
  })),
  unregisterStatus: (id) => set(s => ({ statusSlots: s.statusSlots.filter(sl => sl.id !== id) })),

  // ── Background operations (long-running tasks shown in status bar) ──
  // Each job: { id, label, status: 'running'|'done'|'failed', onOpen: () => void }
  bgJobs: [],
  registerBgJob: (id, label, onOpen) => set(s => ({
    bgJobs: s.bgJobs.some(j => j.id === id)
      ? s.bgJobs.map(j => j.id === id ? { ...j, label, onOpen } : j)
      : [...s.bgJobs, { id, label, status: 'running', onOpen }],
  })),
  updateBgJob: (id, status) => set(s => ({
    bgJobs: s.bgJobs.map(j => j.id === id ? { ...j, status } : j),
  })),
  removeBgJob: (id) => set(s => ({ bgJobs: s.bgJobs.filter(j => j.id !== id) })),

  // ── WS event bus ─────────────────────────────────────────────────
  _wsListeners: new Set(),
  fireWsEvent: (evt) => {
    useShellStore.getState()._wsListeners.forEach(fn => fn(evt));
  },
  subscribeWsEvent: (fn) => {
    useShellStore.getState()._wsListeners.add(fn);
    return () => useShellStore.getState()._wsListeners.delete(fn);
  },
}));
