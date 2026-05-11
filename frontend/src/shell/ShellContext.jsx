import { createContext, useContext } from 'react';
import { eventBus } from './EventBus';
import { useShellStore } from './shellStore';
import { usePlmStore } from '../store/usePlmStore';
import { useWebSocket } from '../hooks/useWebSocket';
import {
  getSessionToken, getProjectSpaceId as apiGetProjectSpaceId,
  api, txApi, authoringApi, cadApi, pollJobStatus,
  serviceRequest, uploadWithProgress,
} from '../services/api';
import { getDraggedNode, clearDraggedNode } from '../services/dragState';
import { lookupLinkRowForSource } from '../services/sourcePlugins';
import { NODE_ICONS, SignIcon } from '../components/Icons';
import LifecycleDiagram from '../components/LifecycleDiagram';

export const ShellContext = createContext(null);

export function useShell() {
  return useContext(ShellContext);
}

export function createShellAPI({ navigate, openTab, closeTab }) {
  const store = useShellStore.getState;
  return {
    navigate,
    openTab,
    closeTab,

    getToken: () => getSessionToken(),
    getProjectSpaceId: () => apiGetProjectSpaceId(),

    emit: (event, payload) => eventBus.emit(event, payload),
    on:   (event, handler) => {
      eventBus.on(event, handler);
      return () => eventBus.off(event, handler);
    },

    getStore: () => usePlmStore.getState(),

    // ── Reactive store hook — callable inside remote plugin components ──
    // Remote plugins share the same React instance (importmap), so Zustand
    // hooks work correctly when called in remote component bodies.
    usePlmStore,
    useWebSocket,

    // ── Backend API clients — pre-configured with auth + error handling ──
    api, txApi, authoringApi, cadApi,
    pollJobStatus,

    // ── Drag-and-drop state shared between nav panel and editor ──
    getDraggedNode,
    clearDraggedNode,

    // ── Source-plugin link row lookup ──
    getLinkRowForSource: lookupLinkRowForSource,

    // ── Shell icon set (lucide-react, served by shell bundle) ──
    icons: { NODE_ICONS, SignIcon },

    // ── Shell components reusable by remote plugins ──
    components: { LifecycleDiagram },

    // ── HTTP primitives — authenticated, traced ───────────────────
    // Remote plugins use these to call their own backend service without
    // bundling auth logic. serviceRequest handles 401 retry + error modal.
    http: {
      serviceRequest: (serviceCode, method, path, body) =>
        serviceRequest(serviceCode, method, path, body),
      serviceUpload: (serviceCode, path, formData, onProgress) =>
        uploadWithProgress(
          `/api/${serviceCode}${path}`, 'POST',
          {
            Authorization:       `Bearer ${getSessionToken()}`,
            'X-PLM-ProjectSpace': apiGetProjectSpaceId() || '',
          },
          formData, onProgress,
        ),
    },

    // ── Plugin store slices ───────────────────────────────────────
    // Remote plugins register state + actions here during init().
    // State is stored under usePlmStore._slices[name].
    store: {
      registerSlice(name, def) {
        usePlmStore.setState(s => ({
          _slices:       { ...s._slices,       [name]: def.state   ?? {} },
          _sliceActions: { ...s._sliceActions, [name]: def.actions ?? {} },
        }));
      },
      getSlice:  (name) => usePlmStore.getState()._slices?.[name],
      useSlice:  (name) => usePlmStore(s => s._slices?.[name]),
      dispatch(sliceName, action, ...args) {
        const fn = usePlmStore.getState()._sliceActions?.[sliceName]?.[action];
        if (fn) fn(usePlmStore.setState, usePlmStore.getState, ...args);
      },
    },

    console: {
      addTab:    (id, label, Component) => store().addConsoleTab(id, label, Component),
      removeTab: (id)                   => store().removeConsoleTab(id),
      log:       (level, message)       => store().appendLog(level, message),
    },

    status: {
      register:   (id, Component, position) => store().registerStatus(id, Component, position),
      unregister: (id)                      => store().unregisterStatus(id),
    },

    collab: {
      addTab:    (id, label, Component) => store().addCollabTab(id, label, Component),
      removeTab: (id)                   => store().removeCollabTab(id),
    },
  };
}
