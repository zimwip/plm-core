// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getSessionToken } from '../services/api';

/**
 * Subscribe to one or more STOMP topics over SockJS.
 *
 * Auth: browsers cannot set custom headers on the WebSocket upgrade, so the
 * session token is passed as ?token=... on the /ws URL. spe-api's
 * AuthenticationFilter reads it when the path starts with /ws.
 */
export function useWebSocket(topics, onEvent, userId) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  // Normalize to array and build a stable dep-key string
  const topicArr = Array.isArray(topics) ? topics : (topics ? [topics] : []);
  const topicKey = topicArr.join('\0');

  useEffect(() => {
    if (topicArr.length === 0) return;

    const client = new Client({
      webSocketFactory: () => {
        const token = getSessionToken();
        const url = token ? `/ws?token=${encodeURIComponent(token)}` : '/ws';
        return new SockJS(url);
      },
      connectHeaders: {},
      onConnect: () => {
        topicArr.forEach(topic => {
          client.subscribe(topic, (msg) => {
            try {
              const event = JSON.parse(msg.body);
              onEventRef.current(event);
            } catch (e) {
              console.warn('WS parse error', e);
            }
          });
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP error', frame);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    return () => client.deactivate();
  }, [topicKey, userId]); // eslint-disable-line react-hooks/exhaustive-deps
}
