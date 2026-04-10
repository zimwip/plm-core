package com.plm.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Publication d'événements PLM via WebSocket (pattern notification + fetch).
 *
 * Le frontend reçoit une notification légère puis rappelle
 * le REST endpoint pour récupérer les données complètes.
 *
 * Topics :
 *  /topic/nodes/{nodeId} → événements sur un noeud spécifique
 *  /topic/locks           → vue globale des locks
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlmEventPublisher {

    private final SimpMessagingTemplate messaging;

    public void lockAcquired(String nodeId, String lockedBy) {
        publish(nodeId, "LOCK_ACQUIRED", Map.of(
            "nodeId",   nodeId,
            "lockedBy", lockedBy,
            "at",       LocalDateTime.now().toString()
        ));
    }

    public void lockReleased(String nodeId, String releasedBy) {
        publish(nodeId, "LOCK_RELEASED", Map.of(
            "nodeId",     nodeId,
            "releasedBy", releasedBy,
            "at",         LocalDateTime.now().toString()
        ));
    }

    public void lockExpiring(String nodeId, String lockedBy, int minutesLeft) {
        publish(nodeId, "LOCK_EXPIRING", Map.of(
            "nodeId",     nodeId,
            "lockedBy",   lockedBy,
            "minutesLeft", minutesLeft
        ));
    }

    public void stateChanged(String nodeId, String fromState, String toState, String byUser) {
        publish(nodeId, "STATE_CHANGED", Map.of(
            "nodeId",    nodeId,
            "fromState", fromState,
            "toState",   toState,
            "byUser",    byUser,
            "at",        LocalDateTime.now().toString()
        ));
    }

    public void baselineCreated(String baselineId, String name, String byUser) {
        messaging.convertAndSend("/topic/baselines", Map.of(
            "event",      "BASELINE_CREATED",
            "baselineId", baselineId,
            "name",       name,
            "byUser",     byUser,
            "at",         LocalDateTime.now().toString()
        ));
    }

    // -------------------------------------------------------

    private void publish(String nodeId, String eventType, Map<String, Object> payload) {
        var envelope = new java.util.HashMap<>(payload);
        envelope.put("event", eventType);

        messaging.convertAndSend("/topic/nodes/" + nodeId, envelope);
        log.debug("Event published: {} → node={}", eventType, nodeId);
    }
}
