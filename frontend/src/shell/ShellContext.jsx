import { createContext, useContext } from 'react';
import { eventBus } from './EventBus';
import { useShellStore } from './shellStore';
import { usePlmStore } from '../store/usePlmStore';

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

    emit: (event, payload) => eventBus.emit(event, payload),
    on:   (event, handler) => {
      eventBus.on(event, handler);
      return () => eventBus.off(event, handler);
    },

    getStore: () => usePlmStore.getState(),

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
