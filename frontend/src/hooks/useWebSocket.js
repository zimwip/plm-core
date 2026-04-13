// hooks/useWebSocket.js
import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * Subscribe to one or more STOMP topics over SockJS.
 *
 * @param {string|string[]} topics  Full STOMP destination(s), e.g. '/topic/nodes/abc'
 * @param {function}        onEvent Called with the parsed JSON payload for every message
 * @param {string}          userId  Forwarded in the STOMP CONNECT frame as X-PLM-User
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
      webSocketFactory: () => new SockJS('/ws'),
      // Pass userId in the STOMP CONNECT frame — browser blocks custom headers on XHR
      connectHeaders: userId ? { 'X-PLM-User': userId } : {},
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
