// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { getSessionToken } from '../services/api';
import { useShellStore } from '../shell/shellStore';

function wsLog(level, message) {
  useShellStore.getState().appendLog(level, message);
}

function fmtEvent(evt) {
  if (!evt.event) {
    return `[WS] (unknown) ${JSON.stringify(evt)}`;
  }
  const parts = [evt.event];
  if (evt.byUser)  parts.push(`by ${evt.byUser}`);
  if (evt.nodeId || evt.itemId)  parts.push(`node=${evt.nodeId || evt.itemId}`);
  if (evt.userId)  parts.push(`user=${evt.userId}`);
  if (evt.entity)  parts.push(evt.entity);
  if (evt.status)  parts.push(evt.status);
  if (evt.jobId)   parts.push(`job=${evt.jobId}`);
  return `[WS] ${parts.join(' · ')}`;
}

/**
 * Subscribe to real-time PLM events via native WebSocket.
 *
 * The WS connection is project-agnostic. After connecting, a subscribe
 * message is sent to ws-gateway to establish the per-project NATS
 * subscription. When projectSpaceId changes, a new subscribe message is
 * sent without reconnecting.
 *
 * Auth: session token passed as ?token= on the /api/ws URL.
 * spe-api's AuthenticationFilter validates it and mints a forward JWT
 * before proxying to ws-gateway.
 *
 * @param {string|string[]} topics  - Kept for API compatibility. Not used for routing
 *                                    (NATS subjects handle scoping server-side).
 * @param {function} onEvent        - Called with parsed JSON event object.
 * @param {string} userId           - Triggers reconnect when user changes.
 * @param {string} projectSpaceId   - Current project space; sent via subscribe message
 *                                    after connect and on each change.
 */
export function useWebSocket(topics, onEvent, userId, projectSpaceId) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Stable ref so the subscribe effect always sends the latest value.
  const projectSpaceIdRef = useRef(projectSpaceId);
  projectSpaceIdRef.current = projectSpaceId;

  // Ref to the live WebSocket so the projectSpaceId effect can reach it.
  const wsRef = useRef(null);

  const topicArr = Array.isArray(topics) ? topics : (topics ? [topics] : []);
  const topicKey = topicArr.join('\0');

  // ── Connection lifecycle (reconnect on user change) ───────────────
  useEffect(() => {
    if (topicArr.length === 0) return;

    let ws = null;
    let reconnectTimer = null;
    let reconnectDelay = 1000;
    let disposed = false;

    function sendSubscribe(socket) {
      const ps = projectSpaceIdRef.current;
      if (ps && socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'subscribe', projectSpaceId: ps }));
      }
    }

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
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectDelay = 1000;
        wsLog('debug', '[WS] connected');
        sendSubscribe(ws);
      };

      ws.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          wsLog('info', fmtEvent(event));
          onEventRef.current(event);
          useShellStore.getState().fireWsEvent(event);
        } catch (err) {
          console.warn('WS parse error', err);
          wsLog('warn', `[WS] parse error: ${err.message}`);
        }
      };

      ws.onclose = (e) => {
        wsRef.current = null;
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
      wsRef.current = null;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // prevent reconnect on intentional close
        ws.close();
      }
    };
  }, [topicKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Project space subscription (no reconnect on ps change) ───────
  useEffect(() => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN && projectSpaceId) {
      ws.send(JSON.stringify({ type: 'subscribe', projectSpaceId }));
    }
  }, [projectSpaceId]);
}
