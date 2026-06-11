// hooks/useWebSocket.js
import { useEffect } from 'react';
import { getSessionToken } from '../services/api';
import { useShellStore } from '../shell/shellStore';
import { useWsEvent } from './useWsEvent';

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

// ── Shared singleton connection ─────────────────────────────────────
// One physical WebSocket per browser tab, regardless of how many
// components call useWebSocket(). Each incoming frame is dispatched once
// onto the shellStore WS event bus. Components subscribe logically.
let socket = null;
let refCount = 0;
let currentUserId = null;
let currentProjectSpaceId = null;
let reconnectTimer = null;
let reconnectDelay = 1000;
let closeTimer = null;

// ── Liveness / keepalive ────────────────────────────────────────────
// The stream is unidirectional (NATS → client), so an idle session receives
// no frames and intermediary proxies silently drop the connection. The server
// emits a text heartbeat every 25s; we mirror it with a client keepalive ping
// and a watchdog that force-reconnects if no frame arrives within the window.
const KEEPALIVE_MS = 25000;   // client → server ping cadence
const WATCHDOG_MS = 10000;    // how often we check liveness
const STALE_MS = 40000;       // no frame for this long ⇒ assume dead, reconnect
let lastActivity = 0;
let keepaliveTimer = null;
let watchdogTimer = null;

function startMonitors() {
  stopMonitors();
  lastActivity = Date.now();
  keepaliveTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping' }));
    }
  }, KEEPALIVE_MS);
  watchdogTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN && Date.now() - lastActivity > STALE_MS) {
      wsLog('warn', `[WS] stale (no frame for ${STALE_MS}ms) — forcing reconnect`);
      socket.close(); // onclose → backoff reconnect
    }
  }, WATCHDOG_MS);
}

function stopMonitors() {
  if (keepaliveTimer) { clearInterval(keepaliveTimer); keepaliveTimer = null; }
  if (watchdogTimer)  { clearInterval(watchdogTimer);  watchdogTimer = null; }
}

function sendSubscribe() {
  if (currentProjectSpaceId && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'subscribe', projectSpaceId: currentProjectSpaceId }));
  }
}

function openSocket() {
  const token = getSessionToken();
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Trailing slash matters: ws-gateway's context-path is /api/ws and the WebSocket
  // handler is registered at "/". Without the slash the request hits the bare
  // context-root and returns 404. See docker-compose logs from Apr-24 for the dig.
  const url = token
    ? `${proto}//${location.host}/api/ws/?token=${encodeURIComponent(token)}`
    : `${proto}//${location.host}/api/ws/`;

  socket = new WebSocket(url);

  socket.onopen = () => {
    reconnectDelay = 1000;
    wsLog('debug', '[WS] connected');
    startMonitors();
    sendSubscribe();
  };

  socket.onmessage = (e) => {
    lastActivity = Date.now();
    try {
      const event = JSON.parse(e.data);
      // Heartbeat keeps the connection alive and feeds the watchdog; it is not
      // an application event, so do not broadcast it on the shell bus.
      if (event.type === 'heartbeat') return;
      wsLog('info', fmtEvent(event));
      useShellStore.getState().fireWsEvent(event);
    } catch (err) {
      console.warn('WS parse error', err);
      wsLog('warn', `[WS] parse error: ${err.message}`);
    }
  };

  socket.onclose = () => {
    socket = null;
    stopMonitors();
    if (refCount === 0) return; // no live consumers — stay closed
    wsLog('warn', `[WS] disconnected — reconnecting in ${reconnectDelay}ms`);
    reconnectTimer = setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
      openSocket();
    }, reconnectDelay);
  };

  socket.onerror = () => {
    wsLog('warn', '[WS] connection error');
    // onclose fires after onerror, triggering reconnect
  };
}

function closeSocket() {
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  stopMonitors();
  if (socket) {
    socket.onclose = null; // prevent reconnect on intentional close
    socket.onmessage = null;
    if (socket.readyState === WebSocket.CONNECTING) {
      // Calling close() on a still-CONNECTING socket logs
      // "WebSocket is closed before the connection is established".
      // Defer the close until it opens, then shut it down cleanly.
      const s = socket;
      s.onopen = () => s.close();
    } else {
      socket.close();
    }
    socket = null;
  }
}

function reconnect() {
  closeSocket();
  reconnectDelay = 1000;
  if (refCount > 0) openSocket();
}

function acquire(userId) {
  if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
  refCount += 1;
  if (!socket) {
    currentUserId = userId;
    openSocket();
  } else if (userId !== currentUserId) {
    // Authenticated user changed — reconnect with the fresh session token.
    currentUserId = userId;
    reconnect();
  }
}

function release() {
  refCount = Math.max(0, refCount - 1);
  if (refCount === 0) {
    // Deferred close absorbs React 18 StrictMode unmount→remount and fast
    // route changes: a remount's acquire() cancels this timer.
    closeTimer = setTimeout(() => {
      closeTimer = null;
      if (refCount === 0) closeSocket();
    }, 250);
  }
}

function setProjectSpace(ps) {
  currentProjectSpaceId = ps;
  sendSubscribe();
}

/**
 * Subscribe to real-time PLM events via the shared WebSocket.
 *
 * All call sites share a single physical connection (ref-counted). The hook
 * itself only registers `onEvent` on the shellStore WS event bus and keeps the
 * shared socket alive while mounted. Each NATS frame is delivered exactly once.
 *
 * Auth: session token passed as ?token= on the /api/ws URL.
 *
 * @param {function} onEvent        - Called with each parsed JSON event object.
 * @param {string} userId           - Triggers reconnect when the user changes.
 * @param {string} projectSpaceId   - Current project space; sent via subscribe
 *                                    message after connect and on each change.
 */
/**
 * Shell-only: owns the single physical WebSocket connection (ref-counted,
 * reconnect on user change) and subscribes {@code onEvent} to the bus.
 *
 * Non-shell code must NOT call this — use {@link useWsEvent} (exposed as
 * {@code shellAPI.useWsEvent}) instead, so there is never more than one
 * physical connection.
 */
export function useWebSocket(onEvent, userId, projectSpaceId) {
  // Event subscription on the shared bus.
  useWsEvent(onEvent);

  // ── Shared connection lifetime (reconnect on user change) ─────────
  useEffect(() => {
    acquire(userId);
    return () => release();
  }, [userId]);

  // ── Project space subscription (no reconnect on ps change) ────────
  useEffect(() => {
    if (projectSpaceId === undefined) return;
    setProjectSpace(projectSpaceId);
  }, [projectSpaceId]);
}
