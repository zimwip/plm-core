package com.pno.domain.service;

import com.plm.platform.nats.PlmMessageBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Publishes PNO domain events to NATS.
 *
 * All mutations publish global.PNO_CHANGED so the frontend can refresh
 * user/role/project-space lists. The event payload includes the entity type
 * and action for more granular handling if needed.
 *
 * Gracefully no-ops when PlmMessageBus is unavailable (NATS disabled / tests).
 */
@Component
public class PnoEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PnoEventPublisher.class);

    private final PlmMessageBus messageBus;

    public PnoEventPublisher(@Autowired(required = false) PlmMessageBus messageBus) {
        this.messageBus = messageBus;
    }

    public void userChanged(String action, String userId, String byUser) {
        publish("USER", action, Map.of("userId", userId), byUser);
    }

    public void roleChanged(String action, String roleId, String byUser) {
        publish("ROLE", action, Map.of("roleId", roleId), byUser);
    }

    public void projectSpaceChanged(String action, String projectSpaceId, String byUser) {
        publish("PROJECT_SPACE", action, Map.of("projectSpaceId", projectSpaceId), byUser);
    }

    private void publish(String entity, String action, Map<String, Object> extra, String byUser) {
        if (messageBus == null) return;
        try {
            var payload = new java.util.LinkedHashMap<String, Object>();
            payload.put("event", "PNO_CHANGED");
            payload.put("entity", entity);
            payload.put("action", action);
            payload.putAll(extra);
            payload.put("byUser", byUser != null ? byUser : "unknown");
            payload.put("at", LocalDateTime.now().toString());
            messageBus.sendGlobal("PNO_CHANGED", payload);
            log.debug("PNO event: {}.{}", entity, action);
        } catch (Exception e) {
            log.warn("Failed to publish PNO event: {}.{} — {}", entity, action, e.getMessage());
        }
    }
}
