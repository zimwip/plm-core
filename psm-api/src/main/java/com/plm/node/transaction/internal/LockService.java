package com.plm.node.transaction.internal;
import com.plm.node.NodeService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LinkTypeConfig;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Lock pessimiste sur les noeuds PLM.
 *
 * Le lock est porté par la table {@code node} (colonnes locked_by / locked_at),
 * indépendamment du modèle de transaction et de versioning.
 *
 *   Noeud libre  → node.locked_by IS NULL
 *   Noeud locké  → node.locked_by IS NOT NULL
 *
 * {@link #tryLock} et {@link #unlock} sont les SEULS endroits qui écrivent
 * ces colonnes.
 *
 * {@link NodeService#checkout} est le point d'entrée de haut niveau qui
 * coordonne : tryLock → find/create transaction → create OPEN version.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LockService {

    private final DSLContext dsl;
    private final ConfigCache configCache;

    /**
     * Self-reference via Spring proxy for cascade calls.
     * Ensures that {@link #tryLock} calls within {@link #tryLockCascade}
     * are intercepted by AOP (including any future {@link com.plm.platform.authz.PlmAction} annotations).
     * {@code @Lazy} breaks the circular dependency.
     */
    @Lazy
    @Autowired
    private LockService self;

    // ================================================================
    // TRY LOCK
    // ================================================================

    /**
     * Tente d'acquérir le lock sur {@code nodeId} pour {@code userId}.
     *
     * <p>Utilise {@code SELECT … FOR UPDATE} pour une acquisition atomique
     * (la ligne node est verrouillée au niveau base de données pour toute
     * la durée de la transaction Spring courante, évitant les races
     * concurrentes entre deux checkouts simultanés sur le même noeud).
     *
     * <ul>
     *   <li>Si {@code node.locked_by} est NULL → acquiert le lock.</li>
     *   <li>Si {@code node.locked_by == userId} → idempotent, retour silencieux.</li>
     *   <li>Si {@code node.locked_by} est un autre utilisateur → {@link LockConflictException}.</li>
     * </ul>
     */
    @Transactional
    public void tryLock(String nodeId, String userId) {
        Record row = dsl.fetchOne(
            "SELECT locked_by FROM node WHERE id = ? FOR UPDATE", nodeId);
        if (row == null) throw new IllegalArgumentException("Node not found: " + nodeId);

        String currentOwner = row.get("locked_by", String.class);

        if (currentOwner == null) {
            dsl.execute(
                "UPDATE node SET locked_by = ?, locked_at = ? WHERE id = ?",
                userId, LocalDateTime.now(), nodeId);
            log.debug("Node {} locked by {}", nodeId, userId);
        } else if (currentOwner.equals(userId)) {
            log.debug("Node {} already locked by {} — idempotent", nodeId, userId);
        } else {
            throw new LockConflictException(nodeId, currentOwner);
        }
    }

    /**
     * Lock cascade : acquiert le lock sur {@code rootNodeId} et tous ses
     * descendants reliés par des liens VERSION_TO_MASTER.
     * Fail-fast au premier conflit.
     */
    @Transactional
    public void tryLockCascade(String rootNodeId, String userId) {
        List<String> toLock = resolveV2MDescendants(rootNodeId);
        toLock.add(0, rootNodeId);
        for (String nodeId : toLock) {
            self.tryLock(nodeId, userId);
        }
        log.info("Cascade lock: root={} count={} user={}", rootNodeId, toLock.size(), userId);
    }

    // ================================================================
    // UNLOCK
    // ================================================================

    /**
     * Libère le lock sur {@code nodeId} : efface locked_by et locked_at.
     * Appelé au commit / checkin pour chaque noeud commité.
     */
    @Transactional
    public void unlock(String nodeId) {
        dsl.execute(
            "UPDATE node SET locked_by = NULL, locked_at = NULL WHERE id = ?",
            nodeId);
        log.debug("Node {} unlocked", nodeId);
    }

    // ================================================================
    // INTERROGATION
    // ================================================================

    public boolean isLocked(String nodeId) {
        String owner = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("locked_by", String.class);
        return owner != null;
    }

    public boolean isLockedBy(String nodeId, String userId) {
        String owner = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("locked_by", String.class);
        return userId.equals(owner);
    }

    /**
     * Retourne true si le noeud est locké ET possède une version OPEN dans {@code txId}.
     * Utilisé par les tests pour vérifier qu'un checkout a bien eu lieu.
     */
    public boolean isLockedByTx(String nodeId, String txId) {
        if (!isLocked(nodeId)) return false;
        return dsl.fetchCount(
            dsl.selectOne().from("node_version")
               .where("node_id = ?", nodeId).and("tx_id = ?", txId)) > 0;
    }

    public LockInfo getLockInfo(String nodeId) {
        Record row = dsl.select().from("node").where("id = ?", nodeId).fetchOne();
        if (row == null) return LockInfo.FREE;
        String lockedBy = row.get("locked_by", String.class);
        if (lockedBy == null) return LockInfo.FREE;
        return new LockInfo(true, lockedBy, row.get("locked_at", LocalDateTime.class));
    }

    // ================================================================
    // Helpers
    // ================================================================

    /**
     * Resolves all VERSION_TO_MASTER descendants of a node using a single recursive CTE query.
     * Returns the flat list of all descendant nodeIds (excluding the root itself).
     *
     * <p>Only SELF-source links participate in lock cascade: cross-source links (files,
     * external systems) cannot be locked through psm-api. V2M is detected by the absence
     * of an {@code @version} suffix in {@code target_key}.
     */
    private List<String> resolveV2MDescendants(String nodeId) {
        List<String> v2mLinkTypeIds = configCache.getAllLinkTypes().stream()
            .filter(lt -> "VERSION_TO_MASTER".equals(lt.linkPolicy()))
            .map(LinkTypeConfig::id)
            .toList();
        if (v2mLinkTypeIds.isEmpty()) return new ArrayList<>();

        String placeholders = v2mLinkTypeIds.stream().map(id -> "?").collect(Collectors.joining(", "));
        List<Object> params = new ArrayList<>();
        params.add(nodeId);
        params.addAll(v2mLinkTypeIds);
        params.addAll(v2mLinkTypeIds);

        // target_key with no '@' is V2M; resolve to node id by joining on (logical_id, type).
        String targetJoin =
              "JOIN node n ON n.logical_id = CASE "
            + "       WHEN POSITION('@' IN nl.target_key) > 0 "
            + "         THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1) "
            + "       ELSE nl.target_key "
            + "     END "
            + "  AND n.node_type_id = nl.target_type ";

        String sql = "WITH RECURSIVE descendants AS ("
            + "  SELECT n.id AS node_id"
            + "  FROM node_version_link nl"
            + "  JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id"
            + "  " + targetJoin.replace("nl.", "nl.")  // first leg uses alias nl
            + "  WHERE nv_src.node_id = ?"
            + "    AND nl.link_type_id IN (" + placeholders + ")"
            + "    AND nl.target_source_id = 'SELF'"
            + "    AND POSITION('@' IN nl.target_key) = 0"
            + "  UNION ALL"
            + "  SELECT n2.id"
            + "  FROM node_version_link nl2"
            + "  JOIN node_version nv_src2 ON nv_src2.id = nl2.source_node_version_id"
            + "  JOIN node n2 ON n2.logical_id = CASE "
            + "       WHEN POSITION('@' IN nl2.target_key) > 0 "
            + "         THEN SUBSTR(nl2.target_key, 1, POSITION('@' IN nl2.target_key) - 1) "
            + "       ELSE nl2.target_key "
            + "     END "
            + "  AND n2.node_type_id = nl2.target_type"
            + "  JOIN descendants d ON nv_src2.node_id = d.node_id"
            + "  WHERE nl2.link_type_id IN (" + placeholders + ")"
            + "    AND nl2.target_source_id = 'SELF'"
            + "    AND POSITION('@' IN nl2.target_key) = 0"
            + ") SELECT DISTINCT node_id FROM descendants";

        return dsl.fetch(sql, params.toArray())
            .getValues("node_id", String.class);
    }

    // ================================================================
    // Types
    // ================================================================

    public record LockInfo(boolean locked, String lockedBy, LocalDateTime lockedAt) {
        static final LockInfo FREE = new LockInfo(false, null, null);
    }

    public static class LockConflictException extends com.plm.shared.exception.PlmFunctionalException {
        public LockConflictException(String nodeId, String lockedBy) {
            super("Node " + nodeId + " is locked by " + lockedBy, 409);
        }
    }
}
