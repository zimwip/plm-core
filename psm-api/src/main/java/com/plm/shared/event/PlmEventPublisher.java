package com.plm.shared.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.event.PlmEvent;
import com.plm.platform.event.PlmEventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
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
        enqueue("global.LOCK_ACQUIRED", PlmEventEnvelope.of("LOCK_ACQUIRED")
            .field("nodeId", nodeId)
            .field("lockedBy", lockedBy)
            .build());
    }

    @PlmEvent(code = "LOCK_RELEASED", description = "Lock released on a node (commit, rollback, or release)")
    public void lockReleased(String nodeId, String releasedBy) {
        enqueue("global.LOCK_RELEASED", PlmEventEnvelope.of("LOCK_RELEASED")
            .field("nodeId", nodeId)
            .field("releasedBy", releasedBy)
            .build());
    }

    @PlmEvent(code = "LOCK_EXPIRING", description = "Lock expiry warning — N minutes remaining")
    public void lockExpiring(String nodeId, String lockedBy, int minutesLeft) {
        enqueue("global.LOCK_EXPIRING", PlmEventEnvelope.of("LOCK_EXPIRING")
            .field("nodeId", nodeId)
            .field("lockedBy", lockedBy)
            .field("minutesLeft", minutesLeft)
            .build());
    }

    @PlmEvent(code = "STATE_CHANGED", description = "Node lifecycle state transitioned")
    public void stateChanged(String nodeId, String fromState, String toState, String byUser) {
        enqueue("global.STATE_CHANGED", PlmEventEnvelope.of("STATE_CHANGED")
            .field("nodeId", nodeId)
            .field("fromState", fromState)
            .field("toState", toState)
            .byUser(byUser)
            .build());
    }

    @PlmEvent(code = "BASELINE_CREATED", description = "Baseline snapshot created")
    public void baselineCreated(String baselineId, String name, String byUser) {
        enqueue("global.BASELINE_CREATED", PlmEventEnvelope.of("BASELINE_CREATED")
            .field("baselineId", baselineId)
            .field("name", name)
            .byUser(byUser)
            .build());
    }

    /**
     * Item created: emits {@code ITEM_CREATED} (consumed by pno-api basket auto-add, search indexing).
     * NODE_CREATED is intentionally dropped — ITEM_CREATED is strictly richer
     * (includes source, typeCode, projectSpaceId) and replaces it.
     *
     * @param payload service-specific data for downstream consumers (e.g. search-api extractor).
     *                Pass {@code Map.of()} when unavailable.
     */
    @PlmEvent(code = "ITEM_CREATED", description = "Item created in a project space (triggers basket auto-add)")
    public void nodeCreated(String nodeId, String nodeTypeId, String byUser, String projectSpaceId,
                            Map<String, Object> payload) {
        enqueue("global.ITEM_CREATED", PlmEventEnvelope.of("ITEM_CREATED")
            .source("psm")
            .typeCode(nodeTypeId)
            .itemId(nodeId)
            .userId(byUser)
            .projectSpaceId(projectSpaceId)
            .payload(payload)
            .build());
        log.debug("Event enqueued: ITEM_CREATED → node={} type={}", nodeId, nodeTypeId);
    }

    /** Backward-compat overload — no payload. */
    public void nodeCreated(String nodeId, String nodeTypeId, String byUser, String projectSpaceId) {
        nodeCreated(nodeId, nodeTypeId, byUser, projectSpaceId, Map.of());
    }

    @PlmEvent(code = "ITEM_CAPTURED", description = "Item captured into a transaction (checkout created OPEN version)")
    public void itemCaptured(String nodeId, String txId, String byUser) {
        enqueue("global.ITEM_CAPTURED", PlmEventEnvelope.of("ITEM_CAPTURED")
            .field("nodeId", nodeId)
            .field("txId", txId)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: ITEM_CAPTURED → node={} tx={}", nodeId, txId);
    }

    /**
     * @param payload service-specific data for downstream consumers (e.g. search-api extractor).
     *                Pass {@code Map.of()} when unavailable.
     */
    @PlmEvent(code = "ITEM_UPDATED", description = "Item attributes modified within an open transaction")
    public void itemUpdated(String nodeId, String byUser, Map<String, Object> payload) {
        enqueue("global.ITEM_UPDATED", PlmEventEnvelope.of("ITEM_UPDATED")
            .source("psm")
            .itemId(nodeId)
            .byUser(byUser)
            .payload(payload)
            .build());
        log.debug("Event enqueued: ITEM_UPDATED → node={}", nodeId);
    }

    /** Backward-compat overload — no payload. */
    public void itemUpdated(String nodeId, String byUser) {
        itemUpdated(nodeId, byUser, Map.of());
    }

    @PlmEvent(code = "ITEM_DEFINITION_UPDATED",
              description = "Item attribute definition changed (domain assigned/unassigned — attribute set differs)")
    public void itemDefinitionUpdated(String nodeId, String byUser) {
        enqueue("global.ITEM_DEFINITION_UPDATED", PlmEventEnvelope.of("ITEM_DEFINITION_UPDATED")
            .source("psm")
            .itemId(nodeId)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: ITEM_DEFINITION_UPDATED → node={}", nodeId);
    }

    @PlmEvent(code = "SIGNED", description = "Node version signed by a user")
    public void signed(String nodeId, String signedBy, String meaning) {
        enqueue("global.SIGNED", PlmEventEnvelope.of("SIGNED")
            .field("nodeId", nodeId)
            .field("signedBy", signedBy)
            .field("meaning", meaning)
            .build());
    }

    @PlmEvent(code = "ITEM_VERSION_CREATED", description = "Committed version created for an item (post-commit)")
    public void itemVersionCreated(String nodeId, String byUser) {
        enqueue("global.ITEM_VERSION_CREATED", PlmEventEnvelope.of("ITEM_VERSION_CREATED")
            .field("nodeId", nodeId)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: ITEM_VERSION_CREATED → node={}", nodeId);
    }

    @PlmEvent(code = "TX_COMMITTED", description = "Transaction committed — all OPEN versions sealed")
    public void transactionCommitted(String txId, List<String> nodeIds, String byUser) {
        enqueue("global.TX_COMMITTED", PlmEventEnvelope.of("TX_COMMITTED")
            .field("txId", txId)
            .byUser(byUser)
            .field("nodeIds", nodeIds)
            .build());
        log.debug("Event enqueued: TX_COMMITTED → tx={} nodes={}", txId, nodeIds.size());
    }

    @PlmEvent(code = "TX_ROLLED_BACK", description = "Transaction rolled back — OPEN versions discarded")
    public void transactionRolledBack(String txId, List<String> nodeIds, String byUser) {
        enqueue("global.TX_ROLLED_BACK", PlmEventEnvelope.of("TX_ROLLED_BACK")
            .field("txId", txId)
            .byUser(byUser)
            .field("nodeIds", nodeIds)
            .build());
        log.debug("Event enqueued: TX_ROLLED_BACK → tx={} nodes={}", txId, nodeIds.size());
    }

    @PlmEvent(code = "ITEM_DELETED", description = "Item physically deleted (first version rolled back)")
    public void itemDeleted(String nodeId, String byUser) {
        enqueue("global.ITEM_DELETED", PlmEventEnvelope.of("ITEM_DELETED")
            .source("psm")
            .itemId(nodeId)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: ITEM_DELETED → node={}", nodeId);
    }

    @PlmEvent(code = "ITEMS_RELEASED", description = "Items released from a transaction (partial rollback)")
    public void itemsReleased(List<String> nodeIds, String byUser) {
        enqueue("global.ITEMS_RELEASED", PlmEventEnvelope.of("ITEMS_RELEASED")
            .byUser(byUser)
            .field("nodeIds", nodeIds)
            .build());
        log.debug("Event enqueued: ITEMS_RELEASED → count={}", nodeIds.size());
    }

    @PlmEvent(code = "COMMENT_ADDED", description = "Comment added to a node version")
    public void commentAdded(String nodeId, String commentId, String nodeVersionId, String byUser) {
        enqueue("global.COMMENT_ADDED", PlmEventEnvelope.of("COMMENT_ADDED")
            .field("nodeId", nodeId)
            .field("commentId", commentId)
            .field("nodeVersionId", nodeVersionId)
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: COMMENT_ADDED → node={} comment={}", nodeId, commentId);
    }

    @PlmEvent(code = "LINK_CREATED", description = "Typed link created between two nodes")
    public void linkCreated(String srcId, String dstId, String relType, boolean structural) {
        enqueue("global.LINK_CREATED", PlmEventEnvelope.of("LINK_CREATED")
            .field("srcId", srcId)
            .field("dstId", dstId)
            .field("relType", relType)
            .field("structural", structural)
            .build());
    }

    @PlmEvent(code = "LINK_DELETED", description = "Typed link deleted between two nodes")
    public void linkDeleted(String srcId, String dstId, String relType) {
        enqueue("global.LINK_DELETED", PlmEventEnvelope.of("LINK_DELETED")
            .field("srcId", srcId)
            .field("dstId", dstId)
            .field("relType", relType)
            .build());
    }

    @PlmEvent(code = "METAMODEL_CHANGED", description = "Metamodel (node types, lifecycles, link types) changed")
    public void metamodelChanged(String byUser) {
        enqueue("global.METAMODEL_CHANGED", PlmEventEnvelope.of("METAMODEL_CHANGED")
            .byUser(byUser)
            .build());
        log.debug("Event enqueued: METAMODEL_CHANGED by={}", byUser);
    }

    // -------------------------------------------------------

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
