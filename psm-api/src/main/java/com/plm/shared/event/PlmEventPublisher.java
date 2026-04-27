package com.plm.shared.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Publication d'événements PLM via le pattern outbox transactionnel.
 *
 * Les événements sont écrits atomiquement dans event_outbox avec l'opération
 * métier, puis lus par OutboxPoller et publiés sur NATS avant suppression.
 *
 * NATS subjects :
 *  global.{eventType}                                    → tous les utilisateurs connectés
 *  project.{psId}.users.{userId}.{eventType}             → utilisateur ciblé
 *  env.service.{serviceCode}.{eventType}                 → interne inter-services
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PlmEventPublisher {

    private final DSLContext dsl;
    private final ObjectMapper objectMapper;

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
        enqueue("global.BASELINE_CREATED", Map.of(
            "event",      "BASELINE_CREATED",
            "baselineId", baselineId,
            "name",       name,
            "byUser",     byUser,
            "at",         LocalDateTime.now().toString()
        ));
    }

    public void nodeCreated(String nodeId, String byUser) {
        enqueue("global.NODE_CREATED", Map.of(
            "event",  "NODE_CREATED",
            "nodeId", nodeId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event published: NODE_CREATED → node={}", nodeId);
    }

    public void nodeUpdated(String nodeId, String byUser) {
        publish(nodeId, "NODE_UPDATED", Map.of(
            "nodeId", nodeId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
    }

    public void signed(String nodeId, String signedBy, String meaning) {
        publish(nodeId, "SIGNED", Map.of(
            "nodeId",   nodeId,
            "signedBy", signedBy,
            "meaning",  meaning,
            "at",       LocalDateTime.now().toString()
        ));
    }

    public void transactionCommitted(String txId, java.util.List<String> nodeIds, String byUser) {
        enqueue("global.TX_COMMITTED", Map.of(
            "event",   "TX_COMMITTED",
            "txId",    txId,
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        String at = LocalDateTime.now().toString();
        for (String nodeId : nodeIds) {
            publish(nodeId, "LOCK_RELEASED", Map.of(
                "nodeId",     nodeId,
                "releasedBy", byUser,
                "txId",       txId,
                "at",         at
            ));
            enqueue("global.NODE_UPDATED", Map.of(
                "event",  "NODE_UPDATED",
                "nodeId", nodeId,
                "byUser", byUser,
                "at",     at
            ));
        }
        log.debug("Event published: TX_COMMITTED → tx={} nodes={}", txId, nodeIds.size());
    }

    public void transactionRolledBack(String txId, java.util.List<String> nodeIds, String byUser) {
        enqueue("global.TX_ROLLED_BACK", Map.of(
            "event",   "TX_ROLLED_BACK",
            "txId",    txId,
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        for (String nodeId : nodeIds) {
            publish(nodeId, "LOCK_RELEASED", Map.of(
                "nodeId",     nodeId,
                "releasedBy", byUser,
                "txId",       txId,
                "at",         LocalDateTime.now().toString()
            ));
        }
        log.debug("Event published: TX_ROLLED_BACK → tx={} nodes={}", txId, nodeIds.size());
    }

    public void nodesReleased(java.util.List<String> nodeIds, String byUser) {
        for (String nodeId : nodeIds) {
            publish(nodeId, "LOCK_RELEASED", Map.of(
                "nodeId",     nodeId,
                "releasedBy", byUser,
                "at",         LocalDateTime.now().toString()
            ));
        }
        enqueue("global.NODES_RELEASED", Map.of(
            "event",   "NODES_RELEASED",
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        log.debug("Event published: NODES_RELEASED → count={}", nodeIds.size());
    }

    public void commentAdded(String nodeId, String commentId, String nodeVersionId, String byUser) {
        publish(nodeId, "COMMENT_ADDED", Map.of(
            "nodeId",        nodeId,
            "commentId",     commentId,
            "nodeVersionId", nodeVersionId,
            "byUser",        byUser,
            "at",            LocalDateTime.now().toString()
        ));
        log.debug("Event published: COMMENT_ADDED → node={} comment={}", nodeId, commentId);
    }

    public void metamodelChanged(String byUser) {
        enqueue("global.METAMODEL_CHANGED", Map.of(
            "event",  "METAMODEL_CHANGED",
            "byUser", byUser != null ? byUser : "unknown",
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event published: METAMODEL_CHANGED by={}", byUser);
    }

    // -------------------------------------------------------

    private void publish(String nodeId, String eventType, Map<String, Object> payload) {
        var envelope = new java.util.HashMap<>(payload);
        envelope.put("event", eventType);
        enqueue("global." + eventType, envelope);
        log.debug("Event enqueued: {} → node={}", eventType, nodeId);
    }

    /**
     * Inserts an event row into event_outbox within the current DB transaction.
     * OutboxPoller picks it up after commit and publishes to NATS before deletion.
     */
    private void enqueue(String destination, Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            dsl.execute(
                "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES (?,?,?,?)",
                UUID.randomUUID().toString(), destination, json, LocalDateTime.now()
            );
        } catch (Exception e) {
            log.error("Failed to enqueue event to outbox: destination={} error={}", destination, e.getMessage(), e);
        }
    }
}
