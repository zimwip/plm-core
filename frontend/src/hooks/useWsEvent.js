import { useEffect, useRef } from 'react';
import { useShellStore } from '../shell/shellStore';

/**
 * Subscribe to WS events from the singleton connection managed by App.jsx.
 * Does NOT create a new WebSocket — uses the shell event bus.
 */
export function useWsEvent(handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    return useShellStore.getState().subscribeWsEvent(evt => handlerRef.current(evt));
  }, []);
}
