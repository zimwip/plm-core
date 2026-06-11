package com.plm.wsgateway.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.nats.NatsListenerFactory;
import io.nats.client.Dispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.ConcurrentWebSocketSessionDecorator;
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

    /** Text heartbeat keeps idle hops (nginx/spe/proxies) warm and feeds the client watchdog. */
    private static final String HEARTBEAT_FRAME = "{\"type\":\"heartbeat\"}";
    /** Concurrent send guards: a send blocked longer than this, or a buffer over the limit, closes the session. */
    private static final int SEND_TIME_LIMIT_MS = 5_000;
    private static final int SEND_BUFFER_LIMIT_BYTES = 512 * 1024;

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

        // WebSocketSession.sendMessage is not thread-safe. NATS dispatcher threads and the
        // heartbeat scheduler both write to this session, so wrap it once and use the
        // decorated session for every send.
        WebSocketSession concurrent = new ConcurrentWebSocketSessionDecorator(
                session, SEND_TIME_LIMIT_MS, SEND_BUFFER_LIMIT_BYTES);

        Dispatcher globalDispatcher = natsListenerFactory.subscribe(
                new String[]{"global.>"},
                msg -> send(concurrent, msg.getData())
        );

        sessionRegistry.register(concurrent, globalDispatcher, userId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        SessionRegistry.SessionEntry entry = sessionRegistry.get(session.getId());
        if (entry == null) return;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> msg = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) msg.get("type");
            // Only "subscribe" is actionable. Other types (e.g. client keepalive "ping")
            // are intentionally ignored — no-op, no error.
            if (!"subscribe".equals(type)) return;

            String ps = (String) msg.get("projectSpaceId");
            if (ps == null || ps.isBlank()) return;

            String subject = "project." + ps + ".users." + entry.userId() + ".>";
            // Send via the decorated (thread-safe) session stored at registration.
            Dispatcher newDispatcher = natsListenerFactory.subscribe(
                    new String[]{subject},
                    m -> send(entry.session(), m.getData())
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

    /**
     * Periodic text heartbeat to every live session. Keeps idle connections warm across
     * all hops (nginx/spe/proxies) and feeds the client-side liveness watchdog. A failed
     * send (closed/broken socket) drains and removes the session.
     */
    @Scheduled(fixedRate = 25_000)
    public void heartbeat() {
        for (SessionRegistry.SessionEntry entry : sessionRegistry.all()) {
            WebSocketSession s = entry.session();
            try {
                if (s.isOpen()) {
                    s.sendMessage(new TextMessage(HEARTBEAT_FRAME));
                } else {
                    closeSession(s.getId());
                }
            } catch (IOException e) {
                log.warn("WS heartbeat failed: session={} err={}", s.getId(), e.getMessage());
                closeSession(s.getId());
            }
        }
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
