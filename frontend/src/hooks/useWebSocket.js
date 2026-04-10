// hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export function useWebSocket(nodeId, onEvent) {
  const clientRef = useRef(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!nodeId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      onConnect: () => {
        client.subscribe(`/topic/nodes/${nodeId}`, (msg) => {
          try {
            const event = JSON.parse(msg.body);
            onEventRef.current(event);
          } catch (e) {
            console.warn('WS parse error', e);
          }
        });
      },
      onStompError: (frame) => {
        console.warn('STOMP error', frame);
      },
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [nodeId]);
}
