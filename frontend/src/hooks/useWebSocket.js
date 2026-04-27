// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { getSessionToken } from '../services/api';

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
        reconnectDelay = 1000; // reset on successful connect
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          onEventRef.current(event);
        } catch (err) {
          console.warn('WS parse error', err);
        }
      };

      ws.onclose = (e) => {
        if (disposed) return;
        console.warn('WS closed, reconnecting in', reconnectDelay, 'ms');
        reconnectTimer = setTimeout(() => {
          reconnectDelay = Math.min(reconnectDelay * 2, 30000);
          connect();
        }, reconnectDelay);
      };

      ws.onerror = (e) => {
        console.warn('WS error', e);
        // onclose will fire after onerror, triggering reconnect
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
