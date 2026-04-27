package com.plm.wsgateway.handler;

import com.plm.platform.nats.NatsListenerFactory;
import com.plm.wsgateway.security.JwtVerifier;
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

/**
 * WebSocket handler that bridges NATS messages to connected browser clients.
 *
 * On connect:
 *   - Extracts userId + projectSpaceId from forward JWT (passed via handshake attributes)
 *   - Subscribes to NATS: global.> and project.{psId}.users.{userId}.>
 *   - Forwards all matching NATS messages as WebSocket text frames
 *
 * On disconnect:
 *   - Drains NATS dispatcher and removes session from registry
 */
@Component
public class PlmWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(PlmWebSocketHandler.class);

    private final NatsListenerFactory natsListenerFactory;
    private final SessionRegistry sessionRegistry;

    public PlmWebSocketHandler(NatsListenerFactory natsListenerFactory, SessionRegistry sessionRegistry) {
        this.natsListenerFactory = natsListenerFactory;
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = (String) session.getAttributes().get("userId");
        String projectSpaceId = (String) session.getAttributes().get("projectSpaceId");

        if (userId == null || projectSpaceId == null) {
            log.warn("WS connection rejected: missing userId or projectSpaceId");
            try { session.close(CloseStatus.POLICY_VIOLATION); } catch (IOException ignored) {}
            return;
        }

        // Subscribe to NATS subjects for this user
        String globalSubject = "global.>";
        String userSubject = "project." + projectSpaceId + ".users." + userId + ".>";

        Dispatcher dispatcher = natsListenerFactory.subscribe(
                new String[]{globalSubject, userSubject},
                msg -> {
                    try {
                        if (session.isOpen()) {
                            String payload = new String(msg.getData(), StandardCharsets.UTF_8);
                            session.sendMessage(new TextMessage(payload));
                        }
                    } catch (IOException e) {
                        log.warn("Failed to send WS message to session {}: {}", session.getId(), e.getMessage());
                    }
                }
        );

        sessionRegistry.register(session, dispatcher, userId, projectSpaceId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        SessionRegistry.SessionEntry entry = sessionRegistry.remove(session.getId());
        if (entry != null) {
            natsListenerFactory.close(entry.dispatcher());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Gateway is push-only for now. Client messages are ignored.
        log.debug("WS client message ignored: session={} size={}", session.getId(), message.getPayloadLength());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("WS transport error: session={} error={}", session.getId(), exception.getMessage());
        SessionRegistry.SessionEntry entry = sessionRegistry.remove(session.getId());
        if (entry != null) {
            natsListenerFactory.close(entry.dispatcher());
        }
    }
}
