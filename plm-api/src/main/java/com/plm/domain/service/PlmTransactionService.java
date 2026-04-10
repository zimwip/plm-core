package com.plm.domain.service;

import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Gestion du cycle de vie des transactions PLM.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Modèle de transaction PLM                                  │
 * │                                                             │
 * │  OPEN ──────► COMMITTED   (commit avec commentaire)         │
 * │    │                                                         │
 * │    └────────► ROLLEDBACK  (annulation explicite)            │
 * │                                                             │
 * │  Visibilité des node_version liées à la transaction :       │
 * │   OPEN        → owner + admins uniquement                   │
 * │   COMMITTED   → tout le monde                               │
 * │   ROLLEDBACK  → admins uniquement (traçabilité)             │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Règles :
 *  - Un utilisateur ne peut avoir qu'une seule transaction OPEN à la fois
 *  - La transaction est créée explicitement ou automatiquement
 *    au premier checkin si aucune n'est ouverte
 *  - Le commit exige un commentaire non vide
 *  - Le commit libère tous les locks de la transaction
 *  - Le rollback marque les versions ROLLEDBACK et libère les locks
 *  - Les versions ROLLEDBACK restent en base pour l'audit (visibles admins)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PlmTransactionService {

    private final DSLContext         dsl;
    private final LockService        lockService;
    private final ValidationService  validationService;

    // ================================================================
    // OUVERTURE
    // ================================================================

    /**
     * Ouvre une transaction explicitement.
     * Échoue si l'utilisateur a déjà une transaction OPEN.
     */
    @Transactional
    public String openTransaction(String userId, String title) {
        assertNoOpenTransaction(userId);

        String txId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO plm_transaction
              (ID, OWNER_ID, STATUS, TITLE, CREATED_AT)
            VALUES (?, ?, 'OPEN', ?, ?)
            """,
            txId, userId, title, LocalDateTime.now()
        );

        log.info("Transaction opened: id={} owner={} title={}", txId, userId, title);
        return txId;
    }

    // getOrCreateTransaction a été supprimé : la transaction est désormais
    // un élément de première classe, toujours créée explicitement par l'appelant.

    // ================================================================
    // COMMIT
    // ================================================================

    /**
     * Commite la transaction :
     *  1. Vérifie que l'utilisateur est bien le propriétaire
     *  2. Vérifie que le commentaire est renseigné
     *  3. Marque toutes les node_version de cette tx comme COMMITTED
     *  4. Libère tous les locks
     *  5. Ferme la transaction
     */
    @Transactional
    public void commitTransaction(String txId, String userId, String comment) {
        Record tx = loadAndVerifyOwnership(txId, userId);

        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException("Commit comment is required");
        }

        // 0. Validation pre-commit : collecte toutes les violations sur toutes les versions OPEN
        List<Record> openVersions = dsl.select()
            .from("node_version")
            .where("tx_id = ?", txId)
            .and("tx_status = 'OPEN'")
            .fetch();

        List<String> allViolations = new java.util.ArrayList<>();
        for (Record version : openVersions) {
            String versionId = version.get("id",                  String.class);
            String nodeId    = version.get("node_id",             String.class);
            String stateId   = version.get("lifecycle_state_id",  String.class);
            String revision  = version.get("revision",            String.class);
            int    iteration = version.get("iteration",           Integer.class);
            String prefix    = "[" + revision + "." + iteration + "] ";

            List<String> violations = validationService.collectVersionViolations(nodeId, versionId, stateId);
            for (String v : violations) {
                allViolations.add(prefix + v);
            }
        }
        if (!allViolations.isEmpty()) {
            throw new ValidationService.ValidationException(allViolations);
        }

        // 1a. Supprimer les checkouts sans modification (version OPEN ≡ version précédente)
        int noOpsPruned = pruneNoOpCheckouts(txId);

        // 1b. Marquer les versions restantes comme COMMITTED (visibles par tous)
        int versionsUpdated = dsl.execute(
            "UPDATE node_version SET tx_status = 'COMMITTED' WHERE tx_id = ? AND tx_status = 'OPEN'",
            txId
        );

        // 2. Enregistrer le commentaire et fermer la transaction
        dsl.execute("""
            UPDATE plm_transaction
               SET status = 'COMMITTED', commit_comment = ?, committed_at = ?
             WHERE id = ?
            """,
            comment, LocalDateTime.now(), txId
        );

        // 3. Libérer tous les locks attachés à cette transaction
        int locksReleased = releaseAllLocks(txId);

        log.info("Transaction committed: id={} owner={} versions={} noOps={} locks={} comment='{}'",
            txId, userId, versionsUpdated, noOpsPruned, locksReleased, comment);
    }

    // ================================================================
    // ROLLBACK
    // ================================================================

    /**
     * Annule la transaction et supprime physiquement toutes les versions créées dedans.
     *
     * Sémantique : "comme si rien ne s'était passé".
     *  1. Vérifie ownership
     *  2. Supprime les attributs des versions OPEN de cette tx
     *  3. Supprime les versions OPEN de cette tx
     *  4. Libère les locks
     *  5. Supprime la transaction elle-même (pas de trace)
     *
     * Après rollback, le noeud retrouve exactement son état avant le checkin.
     */
    @Transactional
    public void rollbackTransaction(String txId, String userId) {
        loadAndVerifyOwnership(txId, userId);

        // 1. Supprimer les attributs des versions OPEN de cette transaction
        int attrsDeleted = dsl.execute("""
            DELETE FROM node_version_attribute
             WHERE node_version_id IN (
               SELECT id FROM node_version
                WHERE tx_id = ? AND tx_status = 'OPEN'
             )
            """, txId);

        // 2. Supprimer les signatures attachées aux versions OPEN
        dsl.execute("""
            DELETE FROM node_signature
             WHERE node_version_id IN (
               SELECT id FROM node_version
                WHERE tx_id = ? AND tx_status = 'OPEN'
             )
            """, txId);

        // 3. Supprimer les versions OPEN
        int versionsDeleted = dsl.execute(
            "DELETE FROM node_version WHERE tx_id = ? AND tx_status = 'OPEN'",
            txId
        );

        // 4. Libérer les locks
        int locksReleased = releaseAllLocks(txId);

        // 5. Supprimer la transaction (pas de trace)
        dsl.execute("DELETE FROM plm_transaction WHERE id = ?", txId);

        log.info("Transaction rolled back and deleted: id={} owner={} versions={} attrs={} locks={}",
            txId, userId, versionsDeleted, attrsDeleted, locksReleased);
    }

    // ================================================================
    // LECTURE (avec règles de visibilité)
    // ================================================================

    /**
     * Retourne la transaction OPEN de l'utilisateur courant, ou null.
     */
    public String findOpenTransaction(String userId) {
        return dsl.select()
            .from("plm_transaction")
            .where("owner_id = ?", userId)
            .and("status = 'OPEN'")
            .fetchOne("id", String.class);
    }

    /**
     * Retourne les détails d'une transaction.
     * Applique les règles de visibilité :
     *  - OPEN : owner + admins uniquement
     *  - COMMITTED : tout le monde
     *  - ROLLEDBACK : admins uniquement
     */
    public Record getTransaction(String txId) {
        Record tx = dsl.select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();

        if (tx == null) throw new IllegalArgumentException("Transaction not found: " + txId);

        String status  = tx.get("status", String.class);
        String ownerId = tx.get("owner_id", String.class);
        PlmUserContext ctx = PlmSecurityContext.get();

        if ("OPEN".equals(status) && !ctx.isAdmin() && !ctx.getUserId().equals(ownerId)) {
            throw new PermissionService.AccessDeniedException(
                "Transaction " + txId + " is OPEN and belongs to another user"
            );
        }

        return tx;
    }

    /**
     * Liste les transactions visibles par l'utilisateur courant.
     *  - COMMITTED → toutes
     *  - OPEN      → seulement les siennes (+ toutes si admin)
     */
    public List<Record> listTransactions(int limit) {
        PlmUserContext ctx = PlmSecurityContext.get();

        if (ctx.isAdmin()) {
            // Admin voit tout
            return dsl.select()
                .from("plm_transaction")
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .fetch();
        }

        // Utilisateur standard : COMMITTED + ses propres OPEN
        return dsl.select()
            .from("plm_transaction")
            .where("status = 'COMMITTED'")
            .or("(status = 'OPEN' AND owner_id = ?)", ctx.getUserId())
            .orderBy(DSL.field("created_at").desc())
            .limit(limit)
            .fetch();
    }

    /**
     * Retourne les node_version associées à une transaction,
     * en appliquant les règles de visibilité.
     */
    public List<Record> getTransactionVersions(String txId) {
        // getTransaction applique déjà les règles de visibilité
        getTransaction(txId);

        return dsl.select()
            .from("node_version nv")
            .join("node n").on("nv.node_id = n.id")
            .where("nv.tx_id = ?", txId)
            .orderBy(DSL.field("nv.created_at"))
            .fetch();
    }

    // ================================================================
    // INTÉGRATION AVEC LockService / VersionService
    // ================================================================

    /**
     * Vérifie si une node_version est visible par l'utilisateur courant.
     *
     * Règles :
     *  - tx_id = NULL           → version initiale, toujours visible
     *  - tx_status = COMMITTED  → visible par tous
     *  - tx_status = OPEN       → visible uniquement par owner de la tx + admins
     *
     * Note : il n'y a pas de statut ROLLEDBACK — les versions annulées
     * sont supprimées physiquement au rollback.
     */
    public boolean isVersionVisible(Record nodeVersion) {
        String txId     = nodeVersion.get("tx_id",     String.class);
        String txStatus = nodeVersion.get("tx_status", String.class);

        // Pas de tx ou déjà committée → visible par tous
        if (txId == null || "COMMITTED".equals(txStatus)) return true;

        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return true;

        // OPEN → uniquement le owner
        String ownerId = dsl.select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne("owner_id", String.class);
        return ownerId != null && ctx.getUserId().equals(ownerId);
    }

    /**
     * Retourne la version courante visible d'un noeud pour l'utilisateur courant.
     * Prend la dernière version COMMITTED ou la dernière OPEN si owner/admin.
     */
    public Record getCurrentVisibleVersion(String nodeId) {
        PlmUserContext ctx = PlmSecurityContext.get();

        if (ctx.isAdmin()) {
            // Admin voit tout (COMMITTED + OPEN)
            return dsl.select()
                .from("node_version")
                .where("node_id = ?", nodeId)
                .and("tx_status IN ('COMMITTED', 'OPEN')")
                .orderBy(DSL.field("version_number").desc())
                .limit(1)
                .fetchOne();
        }

        // Utilisateur : version COMMITTED ou OPEN dont il est le owner
        String openTxId = findOpenTransaction(ctx.getUserId());

        if (openTxId != null) {
            // Si l'utilisateur a une tx ouverte, il voit ses propres versions OPEN
            Record ownVersion = dsl.select()
                .from("node_version")
                .where("node_id = ?", nodeId)
                .and("tx_id = ?", openTxId)
                .and("tx_status = 'OPEN'")
                .orderBy(DSL.field("version_number").desc())
                .limit(1)
                .fetchOne();

            if (ownVersion != null) return ownVersion;
        }

        // Sinon : dernière version COMMITTED
        return dsl.select()
            .from("node_version")
            .where("node_id = ?", nodeId)
            .and("tx_status = 'COMMITTED'")
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne();
    }

    // ================================================================
    // NETTOYAGE AUTOMATIQUE
    // ================================================================

    /**
     * Rollback automatique des transactions OPEN expirées
     * (sans activité depuis plus de 24h → lock expiré mais tx pas fermée).
     * Tourne toutes les heures.
     */
    @Scheduled(fixedDelay = 3_600_000)
    @Transactional
    public void cleanStaleTransactions() {
        List<String> staleTxIds = dsl.select()
            .from("plm_transaction")
            .where("status = 'OPEN'")
            .and("created_at < ?", LocalDateTime.now().minusHours(24))
            .fetch("id", String.class);

        for (String txId : staleTxIds) {
            String ownerId = dsl.select()
                .from("plm_transaction")
                .where("id = ?", txId)
                .fetchOne("owner_id", String.class);

            // Suppression physique des versions OPEN (même sémantique que rollback manuel)
            dsl.execute("""
                DELETE FROM node_version_attribute
                 WHERE node_version_id IN (
                   SELECT id FROM node_version WHERE tx_id = ? AND tx_status = 'OPEN'
                 )""", txId);
            dsl.execute("DELETE FROM node_signature WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND tx_status = 'OPEN')", txId);
            dsl.execute("DELETE FROM node_version WHERE tx_id = ? AND tx_status = 'OPEN'", txId);
            releaseAllLocks(txId);
            dsl.execute("DELETE FROM plm_transaction WHERE id = ?", txId);
            log.warn("Stale transaction auto-rolled-back and deleted: id={} owner={}", txId, ownerId);
        }

        if (!staleTxIds.isEmpty()) {
            log.info("Cleaned {} stale transactions", staleTxIds.size());
        }
    }

    // ================================================================
    // NO-OP CHECKOUT PRUNING
    // ================================================================

    /**
     * Au moment du commit, supprime les versions OPEN qui n'ont apporté aucune modification
     * par rapport à leur version précédente (checkout sans sauvegarde de changement).
     *
     * Comparaison : même lifecycle_state_id + mêmes attributs clé-valeur.
     *
     * @return nombre de versions supprimées
     */
    private int pruneNoOpCheckouts(String txId) {
        List<Record> openVersions = dsl.select()
            .from("node_version")
            .where("tx_id = ?", txId)
            .and("tx_status = 'OPEN'")
            .fetch();

        int pruned = 0;
        for (Record version : openVersions) {
            String versionId     = version.get("id",                  String.class);
            String prevVersionId = version.get("previous_version_id", String.class);

            if (prevVersionId == null) continue; // version initiale, on ne touche pas

            if (isNoOp(version, versionId, prevVersionId)) {
                dsl.execute("DELETE FROM node_version_attribute WHERE node_version_id = ?", versionId);
                dsl.execute("DELETE FROM node_signature         WHERE node_version_id = ?", versionId);
                dsl.execute("DELETE FROM node_version           WHERE id = ?",              versionId);
                log.info("No-op checkout pruned at commit: node={} version={}",
                    version.get("node_id", String.class), versionId);
                pruned++;
            }
        }
        return pruned;
    }

    private boolean isNoOp(Record version, String versionId, String prevVersionId) {
        Record prev = dsl.select().from("node_version").where("id = ?", prevVersionId).fetchOne();
        if (prev == null) return false;

        // Même état lifecycle ?
        if (!Objects.equals(
                version.get("lifecycle_state_id", String.class),
                prev.get("lifecycle_state_id",    String.class))) return false;

        // Mêmes attributs ?
        return fetchAttributes(versionId).equals(fetchAttributes(prevVersionId));
    }

    private Map<String, String> fetchAttributes(String versionId) {
        Map<String, String> attrs = new HashMap<>();
        dsl.select().from("node_version_attribute")
           .where("node_version_id = ?", versionId)
           .fetch().forEach(r -> attrs.put(
               r.get("attribute_def_id", String.class),
               r.get("value",            String.class)));
        return attrs;
    }

    // ================================================================
    // Helpers privés
    // ================================================================

    private Record loadAndVerifyOwnership(String txId, String userId) {
        Record tx = dsl.select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();

        if (tx == null) throw new IllegalArgumentException("Transaction not found: " + txId);

        String status  = tx.get("status", String.class);
        String ownerId = tx.get("owner_id", String.class);

        PlmUserContext ctx = PlmSecurityContext.get();
        if (!ctx.isAdmin() && !userId.equals(ownerId)) {
            throw new PermissionService.AccessDeniedException(
                "User " + userId + " does not own transaction " + txId
            );
        }
        if (!"OPEN".equals(status)) {
            throw new IllegalStateException(
                "Transaction " + txId + " is already " + status
            );
        }

        return tx;
    }

    private void assertNoOpenTransaction(String userId) {
        String existing = findOpenTransaction(userId);
        if (existing != null) {
            throw new IllegalStateException(
                "User " + userId + " already has an open transaction: " + existing +
                ". Commit or rollback it first."
            );
        }
    }

    private int releaseAllLocks(String txId) {
        return dsl.execute("DELETE FROM plm_lock WHERE tx_id = ?", txId);
    }

    // ================================================================
    // Exceptions
    // ================================================================

    public static class TransactionOwnershipException extends RuntimeException {
        public TransactionOwnershipException(String msg) { super(msg); }
    }
}
