package com.plm.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Gestion des locks pessimistes sur les noeuds PLM.
 *
 * La transaction PLM est désormais un élément de première classe :
 * le txId est toujours passé EXPLICITEMENT par l'appelant.
 * Il n'y a plus de création automatique de transaction ici.
 *
 * C'est l'API / le service appelant qui est responsable de :
 *   1. Ouvrir une transaction (PlmTransactionService.openTransaction)
 *   2. Passer le txId à chaque opération d'authoring
 *   3. Commiter ou annuler la transaction
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LockService {

    private static final int LOCK_DURATION_MINUTES = 30;

    private final DSLContext dsl;

    // ================================================================
    // CHECKIN — txId OBLIGATOIRE
    // ================================================================

    /**
     * Acquiert un lock sur un noeud dans le contexte d'une transaction.
     *
     * Idempotent : si le noeud est déjà locké par la MÊME transaction, pas d'erreur.
     * Fail-fast  : si le noeud est locké par une AUTRE transaction → LockConflictException.
     *
     * @param nodeId  noeud à locker
     * @param userId  utilisateur qui demande le lock
     * @param txId    transaction PLM — DOIT exister et être OPEN
     */
    @Transactional
    public void checkin(String nodeId, String userId, String txId) {
        validateTxOpen(txId, userId);

        Record existing = dsl.select()
            .from("plm_lock")
            .where("node_id = ?", nodeId)
            .and("expires_at > ?", LocalDateTime.now())
            .fetchOne();

        if (existing != null) {
            String existingTxId = existing.get("tx_id", String.class);
            if (txId.equals(existingTxId)) {
                log.debug("Node {} already locked by tx {} — idempotent", nodeId, txId);
                return;
            }
            throw new LockConflictException(nodeId,
                existing.get("locked_by", String.class), existingTxId);
        }

        LocalDateTime now = LocalDateTime.now();
        dsl.execute(
            "INSERT INTO plm_lock (ID, NODE_ID, LOCKED_BY, LOCKED_AT, EXPIRES_AT, TX_ID) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID().toString(), nodeId, userId,
            now, now.plusMinutes(LOCK_DURATION_MINUTES), txId
        );
        log.info("Lock acquired: node={} user={} tx={}", nodeId, userId, txId);
    }

    /**
     * Checkin cascade : lock récursif sur tous les descendants VERSION_TO_MASTER.
     * Fail-fast au premier conflit.
     */
    @Transactional
    public void checkinCascade(String rootNodeId, String userId, String txId) {
        List<String> toLock = resolveV2MDescendants(rootNodeId);
        toLock.add(0, rootNodeId);
        for (String nodeId : toLock) {
            checkin(nodeId, userId, txId);
        }
        log.info("Cascade lock: root={} count={} tx={}", rootNodeId, toLock.size(), txId);
    }

    /**
     * Checkout unitaire : libère le lock d'un noeud sans fermer la transaction.
     * Usage rare — préférer le commit/rollback qui libère tous les locks d'un coup.
     */
    @Transactional
    public void checkout(String nodeId, String userId) {
        int n = dsl.execute("DELETE FROM plm_lock WHERE node_id = ? AND locked_by = ?", nodeId, userId);
        if (n == 0) throw new IllegalStateException("No active lock on node " + nodeId + " for " + userId);
        log.info("Lock released (unit checkout): node={} user={}", nodeId, userId);
    }

    // ================================================================
    // INTERROGATION
    // ================================================================

    public boolean isLockedBy(String nodeId, String userId) {
        return dsl.fetchCount(dsl.selectOne().from("plm_lock")
            .where("node_id = ?", nodeId).and("locked_by = ?", userId)
            .and("expires_at > ?", LocalDateTime.now())) > 0;
    }

    public boolean isLockedByTx(String nodeId, String txId) {
        return dsl.fetchCount(dsl.selectOne().from("plm_lock")
            .where("node_id = ?", nodeId).and("tx_id = ?", txId)
            .and("expires_at > ?", LocalDateTime.now())) > 0;
    }

    public boolean isLocked(String nodeId) {
        return dsl.fetchCount(dsl.selectOne().from("plm_lock")
            .where("node_id = ?", nodeId).and("expires_at > ?", LocalDateTime.now())) > 0;
    }

    public LockInfo getLockInfo(String nodeId) {
        Record r = dsl.select().from("plm_lock")
            .where("node_id = ?", nodeId).and("expires_at > ?", LocalDateTime.now()).fetchOne();
        if (r == null) return LockInfo.FREE;
        return new LockInfo(true, r.get("locked_by", String.class),
            r.get("tx_id", String.class), r.get("expires_at", LocalDateTime.class));
    }

    // ================================================================
    // NETTOYAGE
    // ================================================================

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void cleanExpiredLocks() {
        int n = dsl.execute("DELETE FROM plm_lock WHERE expires_at < ?", LocalDateTime.now());
        if (n > 0) log.info("Cleaned {} expired locks", n);
    }

    // ================================================================
    // Helpers
    // ================================================================

    /** Vérifie que la transaction existe, est OPEN et appartient à l'utilisateur. */
    private void validateTxOpen(String txId, String userId) {
        Record tx = dsl.select().from("plm_transaction").where("id = ?", txId).fetchOne();
        if (tx == null)
            throw new IllegalArgumentException("Transaction not found: " + txId);
        if (!"OPEN".equals(tx.get("status", String.class)))
            throw new IllegalStateException("Transaction " + txId + " is not OPEN");
        if (!userId.equals(tx.get("owner_id", String.class)))
            throw new PermissionService.AccessDeniedException(
                "Transaction " + txId + " does not belong to user " + userId);
    }

    private List<String> resolveV2MDescendants(String nodeId) {
        List<String> children = dsl.select(
                DSL.field("nl.target_node_id").as("target_node_id"))
            .from("node_link nl").join("link_type lt").on("nl.link_type_id = lt.id")
            .where("nl.source_node_id = ?", nodeId)
            .and("lt.link_policy = 'VERSION_TO_MASTER'").and("nl.pinned_version_id IS NULL")
            .fetch("target_node_id", String.class);
        List<String> all = new ArrayList<>(children);
        for (String c : children) all.addAll(resolveV2MDescendants(c));
        return all;
    }

    // ================================================================
    // Types
    // ================================================================

    public record LockInfo(boolean locked, String lockedBy, String txId, LocalDateTime expiresAt) {
        static final LockInfo FREE = new LockInfo(false, null, null, null);
    }

    public static class LockConflictException extends com.plm.domain.exception.PlmFunctionalException {
        public LockConflictException(String nodeId, String lockedBy, String txId) {
            super("Node " + nodeId + " is locked by " + lockedBy + " in tx " + txId, 409);
        }
    }
}
