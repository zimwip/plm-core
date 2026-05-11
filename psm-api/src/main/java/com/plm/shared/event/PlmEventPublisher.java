package com.plm.shared.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.event.PlmEvent;
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

    @PlmEvent(code = "LOCK_ACQUIRED", description = "Pessimistic lock acquired on a node")
    public void lockAcquired(String nodeId, String lockedBy) {
        publish(nodeId, "LOCK_ACQUIRED", Map.of(
            "nodeId",   nodeId,
            "lockedBy", lockedBy,
            "at",       LocalDateTime.now().toString()
        ));
    }

    @PlmEvent(code = "LOCK_RELEASED", description = "Lock released on a node (commit, rollback, or release)")
    public void lockReleased(String nodeId, String releasedBy) {
        publish(nodeId, "LOCK_RELEASED", Map.of(
            "nodeId",     nodeId,
            "releasedBy", releasedBy,
            "at",         LocalDateTime.now().toString()
        ));
    }

    @PlmEvent(code = "LOCK_EXPIRING", description = "Lock expiry warning — N minutes remaining")
    public void lockExpiring(String nodeId, String lockedBy, int minutesLeft) {
        publish(nodeId, "LOCK_EXPIRING", Map.of(
            "nodeId",     nodeId,
            "lockedBy",   lockedBy,
            "minutesLeft", minutesLeft
        ));
    }

    @PlmEvent(code = "STATE_CHANGED", description = "Node lifecycle state transitioned")
    public void stateChanged(String nodeId, String fromState, String toState, String byUser) {
        publish(nodeId, "STATE_CHANGED", Map.of(
            "nodeId",    nodeId,
            "fromState", fromState,
            "toState",   toState,
            "byUser",    byUser,
            "at",        LocalDateTime.now().toString()
        ));
    }

    @PlmEvent(code = "BASELINE_CREATED", description = "Baseline snapshot created")
    public void baselineCreated(String baselineId, String name, String byUser) {
        enqueue("global.BASELINE_CREATED", Map.of(
            "event",      "BASELINE_CREATED",
            "baselineId", baselineId,
            "name",       name,
            "byUser",     byUser,
            "at",         LocalDateTime.now().toString()
        ));
    }

    /**
     * Item created: emits {@code ITEM_CREATED} (consumed by pno-api basket auto-add).
     * NODE_CREATED is intentionally dropped — ITEM_CREATED is strictly richer
     * (includes source, typeCode, projectSpaceId) and replaces it.
     */
    @PlmEvent(code = "ITEM_CREATED", description = "Item created in a project space (triggers basket auto-add)")
    public void nodeCreated(String nodeId, String nodeTypeId, String byUser, String projectSpaceId) {
        enqueue("global.ITEM_CREATED", Map.of(
            "event",          "ITEM_CREATED",
            "source",         "psm",
            "typeCode",       nodeTypeId != null ? nodeTypeId : "",
            "itemId",         nodeId,
            "userId",         byUser,
            "projectSpaceId", projectSpaceId != null ? projectSpaceId : "",
            "at",             LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEM_CREATED → node={} type={}", nodeId, nodeTypeId);
    }

    @PlmEvent(code = "ITEM_CAPTURED", description = "Item captured into a transaction (checkout created OPEN version)")
    public void itemCaptured(String nodeId, String txId, String byUser) {
        enqueue("global.ITEM_CAPTURED", Map.of(
            "event",  "ITEM_CAPTURED",
            "nodeId", nodeId,
            "txId",   txId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEM_CAPTURED → node={} tx={}", nodeId, txId);
    }

    @PlmEvent(code = "ITEM_UPDATED", description = "Item attributes modified within an open transaction")
    public void itemUpdated(String nodeId, String byUser) {
        publish(nodeId, "ITEM_UPDATED", Map.of(
            "nodeId", nodeId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
    }

    @PlmEvent(code = "SIGNED", description = "Node version signed by a user")
    public void signed(String nodeId, String signedBy, String meaning) {
        publish(nodeId, "SIGNED", Map.of(
            "nodeId",   nodeId,
            "signedBy", signedBy,
            "meaning",  meaning,
            "at",       LocalDateTime.now().toString()
        ));
    }

    @PlmEvent(code = "ITEM_VERSION_CREATED", description = "Committed version created for an item (post-commit)")
    public void itemVersionCreated(String nodeId, String byUser) {
        enqueue("global.ITEM_VERSION_CREATED", Map.of(
            "event",  "ITEM_VERSION_CREATED",
            "nodeId", nodeId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEM_VERSION_CREATED → node={}", nodeId);
    }

    @PlmEvent(code = "TX_COMMITTED", description = "Transaction committed — all OPEN versions sealed")
    public void transactionCommitted(String txId, java.util.List<String> nodeIds, String byUser) {
        enqueue("global.TX_COMMITTED", Map.of(
            "event",   "TX_COMMITTED",
            "txId",    txId,
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: TX_COMMITTED → tx={} nodes={}", txId, nodeIds.size());
    }

    @PlmEvent(code = "TX_ROLLED_BACK", description = "Transaction rolled back — OPEN versions discarded")
    public void transactionRolledBack(String txId, java.util.List<String> nodeIds, String byUser) {
        enqueue("global.TX_ROLLED_BACK", Map.of(
            "event",   "TX_ROLLED_BACK",
            "txId",    txId,
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: TX_ROLLED_BACK → tx={} nodes={}", txId, nodeIds.size());
    }

    @PlmEvent(code = "ITEM_DELETED", description = "Item physically deleted (first version rolled back)")
    public void itemDeleted(String nodeId, String byUser) {
        enqueue("global.ITEM_DELETED", Map.of(
            "event",  "ITEM_DELETED",
            "nodeId", nodeId,
            "byUser", byUser,
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEM_DELETED → node={}", nodeId);
    }

    @PlmEvent(code = "ITEMS_RELEASED", description = "Items released from a transaction (partial rollback)")
    public void itemsReleased(java.util.List<String> nodeIds, String byUser) {
        enqueue("global.ITEMS_RELEASED", Map.of(
            "event",   "ITEMS_RELEASED",
            "byUser",  byUser,
            "nodeIds", nodeIds,
            "at",      LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: ITEMS_RELEASED → count={}", nodeIds.size());
    }

    @PlmEvent(code = "COMMENT_ADDED", description = "Comment added to a node version")
    public void commentAdded(String nodeId, String commentId, String nodeVersionId, String byUser) {
        publish(nodeId, "COMMENT_ADDED", Map.of(
            "nodeId",        nodeId,
            "commentId",     commentId,
            "nodeVersionId", nodeVersionId,
            "byUser",        byUser,
            "at",            LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: COMMENT_ADDED → node={} comment={}", nodeId, commentId);
    }

    @PlmEvent(code = "METAMODEL_CHANGED", description = "Metamodel (node types, lifecycles, link types) changed")
    public void metamodelChanged(String byUser) {
        enqueue("global.METAMODEL_CHANGED", Map.of(
            "event",  "METAMODEL_CHANGED",
            "byUser", byUser != null ? byUser : "unknown",
            "at",     LocalDateTime.now().toString()
        ));
        log.debug("Event enqueued: METAMODEL_CHANGED by={}", byUser);
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
     * The generated UUID is injected as {@code "id"} in the payload and reused
     * as the outbox row primary key — same ID for both traceability and dedup.
     */
    @SuppressWarnings("unchecked")
    private void enqueue(String destination, Object payload) {
        try {
            String id = UUID.randomUUID().toString();
            var envelope = new java.util.LinkedHashMap<>((Map<String, Object>) payload);
            envelope.put("id", id);
            String json = objectMapper.writeValueAsString(envelope);
            dsl.execute(
                "INSERT INTO event_outbox (id, destination, payload, created_at) VALUES (?,?,?,?)",
                id, destination, json, LocalDateTime.now()
            );
        } catch (Exception e) {
            log.error("Failed to enqueue event to outbox: destination={} error={}", destination, e.getMessage(), e);
        }
    }
}
