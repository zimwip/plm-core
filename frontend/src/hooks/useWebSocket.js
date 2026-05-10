// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { getSessionToken } from '../services/api';
import { useShellStore } from '../shell/shellStore';

function wsLog(level, message) {
  useShellStore.getState().appendLog(level, message);
}

function fmtEvent(evt) {
  const parts = [evt.event || '(unknown)'];
  if (evt.byUser) parts.push(`by ${evt.byUser}`);
  if (evt.nodeId) parts.push(`node=${evt.nodeId}`);
  if (evt.entity) parts.push(evt.entity);
  return `[WS] ${parts.join(' · ')}`;
}

/**
 * Subscribe to real-time PLM events via native WebSocket.
 *
 * The ws-gateway pushes all events scoped to the authenticated user
 * (global + project/user-targeted). Components filter by event type
 * in their onEvent callback.
 *
 * Auth: session token passed as ?token= on the /api/ws URL.
 * spe-api's AuthenticationFilter validates it and mints a forward JWT
 * before proxying to ws-gateway.
 *
 * @param {string|string[]} topics  - Kept for API compatibility. Not used for routing
 *                                    (NATS subjects handle scoping server-side).
 * @param {function} onEvent        - Called with parsed JSON event object.
 * @param {string} userId           - Triggers reconnect when user changes.
 */
export function useWebSocket(topics, onEvent, userId) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const topicArr = Array.isArray(topics) ? topics : (topics ? [topics] : []);
  const topicKey = topicArr.join('\0');

  useEffect(() => {
    if (topicArr.length === 0) return;

    let ws = null;
    let reconnectTimer = null;
    let reconnectDelay = 1000;
    let disposed = false;

    function connect() {
      if (disposed) return;

      const token = getSessionToken();
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      // Trailing slash matters: ws-gateway's context-path is /api/ws and the WebSocket
      // handler is registered at "/". Without the slash the request hits the bare
      // context-root and returns 404. See docker-compose logs from Apr-24 for the dig.
      const url = token
        ? `${proto}//${location.host}/api/ws/?token=${encodeURIComponent(token)}`
        : `${proto}//${location.host}/api/ws/`;

      ws = new WebSocket(url);

      ws.onopen = () => {
        reconnectDelay = 1000;
        wsLog('debug', '[WS] connected');
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          wsLog('info', fmtEvent(event));
          onEventRef.current(event);
        } catch (err) {
          console.warn('WS parse error', err);
          wsLog('warn', `[WS] parse error: ${err.message}`);
        }
      };

      ws.onclose = (e) => {
        if (disposed) return;
        wsLog('warn', `[WS] disconnected — reconnecting in ${reconnectDelay}ms`);
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };

      ws.onerror = () => {
        wsLog('warn', '[WS] connection error');
        // onclose fires after onerror, triggering reconnect
      };
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect on intentional close
        ws.close();
      }
    };
  }, [topicKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
