package com.plm.wsgateway.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import io.nats.client.Dispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * WebSocket handler bridging NATS events to browser clients.
 *
 * On connect:
 *   - Requires userId from forward JWT (set by JwtHandshakeInterceptor)
 *   - Subscribes to NATS: global.>
 *
 * On client message {"type":"subscribe","projectSpaceId":"ps-1"}:
 *   - Replaces per-project NATS subscription with project.<psId>.users.<userId>.>
 *   - Allows the client to switch project space without reconnecting
 *
 * On disconnect:
 *   - Drains both dispatchers
 */
@Component
public class PlmWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(PlmWebSocketHandler.class);

    private final NatsListenerFactory natsListenerFactory;
    private final SessionRegistry sessionRegistry;
    private final ObjectMapper objectMapper;

    public PlmWebSocketHandler(NatsListenerFactory natsListenerFactory,
                               SessionRegistry sessionRegistry,
                               ObjectMapper objectMapper) {
        this.natsListenerFactory = natsListenerFactory;
        this.sessionRegistry = sessionRegistry;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = (String) session.getAttributes().get("userId");

        if (userId == null) {
            log.warn("WS connection rejected: missing userId");
            try { session.close(CloseStatus.POLICY_VIOLATION); } catch (IOException ignored) {}
            return;
        }

        Dispatcher globalDispatcher = natsListenerFactory.subscribe(
                new String[]{"global.>"},
                msg -> send(session, msg.getData())
        );

        sessionRegistry.register(session, globalDispatcher, userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        SessionRegistry.SessionEntry entry = sessionRegistry.get(session.getId());
        if (entry == null) return;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> msg = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) msg.get("type");
            if (!"subscribe".equals(type)) return;

            String ps = (String) msg.get("projectSpaceId");
            if (ps == null || ps.isBlank()) return;

            String subject = "project." + ps + ".users." + entry.userId() + ".>";
            Dispatcher newDispatcher = natsListenerFactory.subscribe(
                    new String[]{subject},
                    m -> send(session, m.getData())
            );

            Dispatcher old = entry.projectDispatcher().getAndSet(newDispatcher);
            if (old != null) natsListenerFactory.close(old);

            log.info("WS project subscription updated: session={} ps={}", session.getId(), ps);
        } catch (Exception e) {
            log.warn("WS subscribe message parse error: session={} err={}", session.getId(), e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        closeSession(session.getId());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("WS transport error: session={} error={}", session.getId(), exception.getMessage());
        closeSession(session.getId());
    }

    private void closeSession(String sessionId) {
        SessionRegistry.SessionEntry entry = sessionRegistry.remove(sessionId);
        if (entry == null) return;
        natsListenerFactory.close(entry.globalDispatcher());
        Dispatcher pd = entry.projectDispatcher().get();
        if (pd != null) natsListenerFactory.close(pd);
    }

    private void send(WebSocketSession session, byte[] data) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(new String(data, StandardCharsets.UTF_8)));
            }
        } catch (IOException e) {
            log.warn("Failed to send WS message to session {}: {}", session.getId(), e.getMessage());
        }
    }
}
