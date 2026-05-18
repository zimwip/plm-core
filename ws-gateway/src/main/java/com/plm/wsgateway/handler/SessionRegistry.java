package com.plm.wsgateway.handler;

import io.nats.client.Dispatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Tracks active WebSocket sessions and their NATS dispatchers.
 * Each session has a global dispatcher (always active) and an optional
 * per-project dispatcher (updated via subscribe messages from the client).
 */
@Component
public class SessionRegistry {

    private static final Logger log = LoggerFactory.getLogger(SessionRegistry.class);

    private final ConcurrentMap<String, SessionEntry> sessions = new ConcurrentHashMap<>();

    public record SessionEntry(
            WebSocketSession session,
            Dispatcher globalDispatcher,
            AtomicReference<Dispatcher> projectDispatcher,
            String userId
    ) {}

    public SessionEntry register(WebSocketSession session, Dispatcher globalDispatcher, String userId) {
        SessionEntry entry = new SessionEntry(session, globalDispatcher, new AtomicReference<>(), userId);
        sessions.put(session.getId(), entry);
        log.info("WS session registered: {} user={} (total={})", session.getId(), userId, sessions.size());
        return entry;
    }

    public SessionEntry get(String sessionId) {
        return sessions.get(sessionId);
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
