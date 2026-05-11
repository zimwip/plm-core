package com.pno.infrastructure.event;

import com.plm.platform.nats.PlmMessageBus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Publishes basket mutation events to the specific user via NATS/WebSocket.
 * Subject: project.{psId}.users.{userId}.BASKET_ITEM_ADDED/REMOVED/CLEARED
 * Skips publish when psId is blank (global UI_PREF group is never basket).
 */
@Component
public class BasketPublisher {

    private static final Logger log = LoggerFactory.getLogger(BasketPublisher.class);

    private final PlmMessageBus messageBus;

    public BasketPublisher(@Autowired(required = false) PlmMessageBus messageBus) {
        this.messageBus = messageBus;
    }

    public void itemAdded(String userId, String psId, String key, String value) {
        send(userId, psId, "BASKET_ITEM_ADDED", Map.of("key", key, "value", value));
    }

    public void itemRemoved(String userId, String psId, String key, String value) {
        send(userId, psId, "BASKET_ITEM_REMOVED", Map.of("key", key, "value", value));
    }

    public void cleared(String userId, String psId) {
        send(userId, psId, "BASKET_CLEARED", Map.of());
    }

    private void send(String userId, String psId, String eventType, Map<String, Object> extra) {
        if (messageBus == null || psId == null || psId.isBlank()) return;
        try {
            var payload = new LinkedHashMap<String, Object>();
            payload.put("id", UUID.randomUUID().toString());
            payload.put("userId", userId);
            payload.put("projectSpaceId", psId);
            payload.putAll(extra);
            messageBus.sendToUser(psId, userId, eventType, payload);
        } catch (Exception e) {
            log.warn("Failed to publish basket event {} for user={}: {}", eventType, userId, e.getMessage());
        }
    }
}
