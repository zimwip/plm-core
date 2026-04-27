package com.plm.wsgateway.handler;

import io.nats.client.Dispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Tracks active WebSocket sessions and their associated NATS dispatchers.
 */
@Component
public class SessionRegistry {

    private static final Logger log = LoggerFactory.getLogger(SessionRegistry.class);

    private final ConcurrentMap<String, SessionEntry> sessions = new ConcurrentHashMap<>();

    public record SessionEntry(WebSocketSession session, Dispatcher dispatcher, String userId, String projectSpaceId) {}

    public void register(WebSocketSession session, Dispatcher dispatcher, String userId, String projectSpaceId) {
        sessions.put(session.getId(), new SessionEntry(session, dispatcher, userId, projectSpaceId));
        log.info("WS session registered: {} user={} ps={} (total={})", session.getId(), userId, projectSpaceId, sessions.size());
    }

    public SessionEntry remove(String sessionId) {
        SessionEntry entry = sessions.remove(sessionId);
        if (entry != null) {
            log.info("WS session removed: {} user={} (total={})", sessionId, entry.userId(), sessions.size());
        }
        return entry;
    }

    public int sessionCount() {
        return sessions.size();
    }
}
