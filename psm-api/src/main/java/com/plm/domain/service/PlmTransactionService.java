package com.plm.domain.service;

import com.plm.domain.hook.*;
import com.plm.infrastructure.PlmEventPublisher;
import com.plm.infrastructure.security.PlmSecurityContext;
import com.plm.infrastructure.security.PlmUserContext;
import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    private final DSLContext        dsl;
    private final LockService       lockService;
    private final ValidationService validationService;
    private final FingerPrintService fingerPrintService;
    private final PlmEventPublisher  eventPublisher;

    // ================================================================
    // HOOK REGISTRY
    // ================================================================

    private final LinkedHashMap<
        String,
        PreCommitValidator
    > preCommitValidators = new LinkedHashMap<>();
    private final LinkedHashMap<String, AtCommitHook> atCommitHooks =
        new LinkedHashMap<>();
    private final LinkedHashMap<String, PostCommitHook> postCommitHooks =
        new LinkedHashMap<>();

    public void registerPreCommitValidator(PreCommitValidator v) {
        preCommitValidators.put(v.name(), v);
        log.info("PreCommitValidator registered: {}", v.name());
    }

    public void unregisterPreCommitValidator(String name) {
        preCommitValidators.remove(name);
    }

    public void registerAtCommitHook(AtCommitHook h) {
        atCommitHooks.put(h.name(), h);
        log.info("AtCommitHook registered: {}", h.name());
    }

    public void unregisterAtCommitHook(String name) {
        atCommitHooks.remove(name);
    }

    public void registerPostCommitHook(PostCommitHook h) {
        postCommitHooks.put(h.name(), h);
        log.info("PostCommitHook registered: {}", h.name());
    }

    public void unregisterPostCommitHook(String name) {
        postCommitHooks.remove(name);
    }

    /** Registers built-in validators wrapping the existing services. */
    @PostConstruct
    public void registerBuiltInHooks() {
        // 1. Attribute / state-rule validation
        registerPreCommitValidator(
            new PreCommitValidator() {
                @Override
                public String name() {
                    return "attribute-validation";
                }

                @Override
                public List<CommitViolation> validate(CommitContext ctx) {
                    List<CommitViolation> violations =
                        new java.util.ArrayList<>();
                    for (CommitContext.NodeVersionRef ref : ctx.versions()) {
                        List<String> msgs =
                            validationService.collectVersionViolations(
                                ref.nodeId(),
                                ref.versionId(),
                                ref.lifecycleStateId()
                            );
                        String prefix =
                            "[" + ref.revision() + "." + ref.iteration() + "] ";
                        for (String m : msgs)
                            violations.add(
                                new CommitViolation(
                                    ref.nodeId(),
                                    ref.versionId(),
                                    prefix + m
                                )
                            );
                    }
                    return violations;
                }
            }
        );
    }

    // ================================================================
    // OUVERTURE
    // ================================================================

    /**
     * Ouvre une transaction explicitement.
     * Échoue si l'utilisateur a déjà une transaction OPEN.
     */
    @Transactional
    public String openTransaction(String userId) {
        assertNoOpenTransaction(userId);
        return createTransactionInternal(userId);
    }

    // getOrCreateTransaction a été supprimé : la transaction est désormais
    // un élément de première classe, toujours créée explicitement par l'appelant.

    /**
     * Crée une transaction sans vérifier l'unicité (usage interne uniquement).
     * Utilisé lors du partial-commit pour créer la transaction "suite" avant
     * de fermer la transaction courante, et par openTransaction après validation.
     */
    private String createTransactionInternal(String userId) {
        String txId = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO plm_transaction (ID, OWNER_ID, STATUS, CREATED_AT) VALUES (?,?,?,?)",
            txId, userId, "OPEN", LocalDateTime.now()
        );
        log.info("Transaction opened: id={} owner={}", txId, userId);
        return txId;
    }

    // ================================================================
    // COMMIT
    // ================================================================

    /**
     * Commit partiel ou total.
     *
     * @param selectedNodeIds  liste des node_id à inclure dans ce commit.
     *                         null ou liste vide = commit tous les noeuds (comportement historique).
     *                         Si certains noeuds sont exclus, leurs versions et locks sont transférés
     *                         dans une nouvelle transaction OPEN automatiquement créée.
     * @return l'id de la transaction de continuation si un commit partiel a créé une nouvelle tx,
     *         null pour un commit total.
     */
    @Transactional
    public String commitTransaction(
        String txId,
        String userId,
        String comment,
        List<String> selectedNodeIds
    ) {
        loadAndVerifyOwnership(txId, userId);

        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException("Commit comment is required");
        }

        // ── Collect all node_ids in this tx ──────────────────────────────
        List<String> allNodeIds = dsl
            .select()
            .from("node_version")
            .where("tx_id = ?", txId)
            .fetch()
            .stream()
            .map(r -> r.get("node_id", String.class))
            .distinct()
            .collect(Collectors.toList());

        // ── Determine deferred nodes (in tx but not selected) ────────────
        List<String> deferredNodeIds = new java.util.ArrayList<>();
        if (selectedNodeIds != null && !selectedNodeIds.isEmpty()) {
            for (String nid : allNodeIds) {
                if (!selectedNodeIds.contains(nid)) deferredNodeIds.add(nid);
            }
        }

        // ── Move deferred nodes to a new transaction ─────────────────────
        String continuationTxId = null;
        if (!deferredNodeIds.isEmpty()) {
            continuationTxId = createTransactionInternal(userId);
            try {
                for (String nodeId : deferredNodeIds) {
                    dsl.execute(
                        "UPDATE node_version SET tx_id = ? WHERE tx_id = ? AND node_id = ?",
                        continuationTxId,
                        txId,
                        nodeId
                    );
                    // Lock follows the version — no separate lock table to update
                }
                log.info(
                    "Partial commit: {} nodes deferred to new tx {}",
                    deferredNodeIds.size(),
                    continuationTxId
                );
            } catch (Exception e) {
                // Compensation: clean up the continuation tx so no orphan is left
                log.error("Partial-commit deferral failed; rolling back continuation tx {}: {}",
                    continuationTxId, e.getMessage());
                try {
                    // Collect any node_versions already moved, unlock, and delete them
                    List<String> movedNodeIds = dsl.fetch(
                        "SELECT DISTINCT node_id FROM node_version WHERE tx_id = ?", continuationTxId
                    ).stream().map(r -> r.get("node_id", String.class)).collect(Collectors.toList());
                    for (String nid : movedNodeIds) {
                        lockService.unlock(nid);
                    }
                    dsl.execute("DELETE FROM node_version WHERE tx_id = ?", continuationTxId);
                    dsl.execute("DELETE FROM plm_transaction WHERE id = ?", continuationTxId);
                } catch (Exception ce) {
                    log.error("Compensation cleanup of continuation tx {} also failed: {}",
                        continuationTxId, ce.getMessage(), ce);
                }
                throw e; // re-throw to abort the outer transaction
            }
        }

        // ── Load remaining (selected) versions ───────────────────────────
        List<Record> openVersions = dsl
            .select()
            .from("node_version")
            .where("tx_id = ?", txId)
            .fetch();

        if (openVersions.isEmpty()) {
            throw new IllegalStateException("No objects selected for commit");
        }

        // ── Fingerprint check — detect no-op versions ─────────────────────
        // Fingerprints are stored at version creation time; read from DB instead of recomputing.
        List<String> noOpLabels = new java.util.ArrayList<>();

        for (Record version : openVersions) {
            String versionId = version.get("id", String.class);
            String nodeId = version.get("node_id", String.class);
            String prevVersionId = version.get(
                "previous_version_id",
                String.class
            );
            String revision = version.get("revision", String.class);
            int iteration = version.get("iteration", Integer.class);
            String fp = getOrComputeFingerPrint(nodeId, versionId);

            if (prevVersionId != null) {
                String parentFp = getOrComputeFingerPrint(
                    nodeId,
                    prevVersionId
                );
                if (fp.equals(parentFp)) {
                    String logicalId = dsl
                        .select()
                        .from("node")
                        .where("id = ?", nodeId)
                        .fetchOne("logical_id", String.class);
                    noOpLabels.add(
                        (logicalId != null ? logicalId : nodeId) +
                            " [" +
                            revision +
                            "." +
                            iteration +
                            "]"
                    );
                }
            }
        }

        if (!noOpLabels.isEmpty()) {
            throw new IllegalStateException(
                "Nothing to commit — no changes detected for: " +
                    String.join(", ", noOpLabels)
            );
        }

        // ── Build CommitContext for hooks ─────────────────────────────────
        List<CommitContext.NodeVersionRef> versionRefs = openVersions
            .stream()
            .map(v -> {
                String nodeId = v.get("node_id", String.class);
                String nodeTypeId = dsl
                    .select()
                    .from("node")
                    .where("id = ?", nodeId)
                    .fetchOne("node_type_id", String.class);
                return new CommitContext.NodeVersionRef(
                    nodeId,
                    v.get("id", String.class),
                    nodeTypeId,
                    v.get("lifecycle_state_id", String.class),
                    v.get("revision", String.class),
                    v.get("iteration", Integer.class)
                );
            })
            .toList();

        CommitContext commitCtx = new CommitContext(
            txId,
            userId,
            comment,
            versionRefs
        );

        // ── [PRE-COMMIT] Run all validators — collect all violations ──────
        List<CommitViolation> allViolations = new java.util.ArrayList<>();
        for (PreCommitValidator validator : preCommitValidators.values()) {
            allViolations.addAll(validator.validate(commitCtx));
        }
        if (!allViolations.isEmpty()) {
            throw new ValidationService.ValidationException(
                allViolations.stream().map(CommitViolation::toString).toList()
            );
        }

        // ── [AT-COMMIT] Run at-commit hooks — any exception aborts ────────
        for (AtCommitHook hook : atCommitHooks.values()) {
            hook.onCommit(commitCtx);
        }

        // ── Commit ────────────────────────────────────────────────────────
        LocalDateTime committedAt = LocalDateTime.now();
        dsl.execute(
            """
            UPDATE plm_transaction
               SET status = 'COMMITTED', commit_comment = ?, committed_at = ?
             WHERE id = ?
            """,
            comment,
            committedAt,
            txId
        );
        // Unlock every committed node: LockService is the single place that clears
        // locked_by / locked_at (deferred nodes have already been moved to continuationTxId).
        for (Record version : openVersions) {
            lockService.unlock(version.get("node_id", String.class));
        }

        log.info(
            "Transaction committed: id={} owner={} versions={} deferred={} continuation={} comment='{}'",
            txId, userId, openVersions.size(), deferredNodeIds.size(), continuationTxId, comment
        );

        // ── [POST-COMMIT] Run post-commit hooks — exceptions are swallowed ─
        List<String> committedNodeIds = openVersions
            .stream()
            .map(v -> v.get("node_id", String.class))
            .distinct()
            .toList();
        CommitResult commitResult = new CommitResult(
            txId,
            committedNodeIds,
            continuationTxId,
            committedAt
        );
        for (PostCommitHook hook : postCommitHooks.values()) {
            try {
                hook.afterCommit(commitResult);
            } catch (Exception e) {
                log.warn(
                    "PostCommitHook '{}' threw an exception (ignored): {}",
                    hook.name(),
                    e.getMessage(),
                    e
                );
            }
        }

        eventPublisher.transactionCommitted(txId, committedNodeIds, userId);

        return continuationTxId;
    }

    // ================================================================
    // RELEASE (partial rollback)
    // ================================================================

    /**
     * Libère des noeuds spécifiques d'une transaction OPEN (partial rollback).
     *
     * Pour chaque noeud :
     *  1. Supprime les attributs de ses versions dans la tx
     *  2. Supprime les versions elles-mêmes
     *  3. Libère le lock
     *
     * Si la transaction devient vide après l'opération, elle est supprimée.
     */
    @Transactional
    public void releaseNodes(String txId, String userId, List<String> nodeIds) {
        loadAndVerifyOwnership(txId, userId);

        if (nodeIds == null || nodeIds.isEmpty()) return;

        for (String nodeId : nodeIds) {
            // 1. baseline_entry → node_link FK
            dsl.execute(
                "DELETE FROM baseline_entry WHERE node_link_id IN (SELECT id FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND node_id = ?))",
                txId, nodeId
            );
            // 2. baseline_entry → node_version FK
            dsl.execute(
                "DELETE FROM baseline_entry WHERE resolved_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND node_id = ?)",
                txId, nodeId
            );
            // 3. node_version_attribute
            dsl.execute(
                "DELETE FROM node_version_attribute WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND node_id = ?)",
                txId, nodeId
            );
            // 4. node_signature
            dsl.execute(
                "DELETE FROM node_signature WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND node_id = ?)",
                txId, nodeId
            );
            // 5. node_link whose source version belongs to this tx
            dsl.execute(
                "DELETE FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ? AND node_id = ?)",
                txId, nodeId
            );
            // 6. node_version
            dsl.execute("DELETE FROM node_version WHERE tx_id = ? AND node_id = ?", txId, nodeId);
            // 7. Unlock the node
            lockService.unlock(nodeId);
            log.info("Node {} released from transaction {}", nodeId, txId);
        }

        // If tx is now empty, clean it up
        int remaining = dsl.fetchCount(
            dsl.selectOne().from("node_version").where("tx_id = ?", txId)
        );
        if (remaining == 0) {
            dsl.execute("DELETE FROM plm_transaction WHERE id = ?", txId);
            log.info("Empty transaction {} deleted after node release", txId);
        }

        eventPublisher.nodesReleased(nodeIds, userId);
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

        // Collect affected node IDs before deletion (needed for unlock + LOCK_RELEASED events)
        List<String> affectedNodeIds = dsl.fetch(
            "SELECT DISTINCT node_id FROM node_version WHERE tx_id = ?", txId
        ).stream().map(r -> r.get("node_id", String.class)).collect(Collectors.toList());

        // Unlock all affected nodes before deleting versions
        for (String nodeId : affectedNodeIds) {
            lockService.unlock(nodeId);
        }

        // 1. baseline_entry → node_link FK
        dsl.execute(
            "DELETE FROM baseline_entry WHERE node_link_id IN (SELECT id FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?))",
            txId
        );

        // 2. baseline_entry → node_version FK
        dsl.execute(
            "DELETE FROM baseline_entry WHERE resolved_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)",
            txId
        );

        // 3. node_version_attribute
        int attrsDeleted = dsl.execute(
            "DELETE FROM node_version_attribute WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)",
            txId
        );

        // 4. node_signature
        dsl.execute(
            "DELETE FROM node_signature WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)",
            txId
        );

        // 5. node_link whose source version belongs to this tx
        dsl.execute(
            "DELETE FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)",
            txId
        );

        // 6. node_version
        int versionsDeleted = dsl.execute("DELETE FROM node_version WHERE tx_id = ?", txId);

        // 6b. Delete nodes orphaned by this rollback (created in this tx, no remaining versions)
        if (!affectedNodeIds.isEmpty()) {
            String placeholders = affectedNodeIds.stream()
                .map(id -> "?")
                .collect(Collectors.joining(", "));
            List<Object> params = new ArrayList<>(affectedNodeIds);
            dsl.execute(
                "DELETE FROM node WHERE id IN (" + placeholders + ")" +
                " AND NOT EXISTS (SELECT 1 FROM node_version WHERE node_id = node.id)",
                params.toArray()
            );
        }

        // 7. Supprimer la transaction (pas de trace)
        dsl.execute("DELETE FROM plm_transaction WHERE id = ?", txId);

        eventPublisher.transactionRolledBack(txId, affectedNodeIds, userId);
        log.info("Transaction rolled back and deleted: id={} owner={} versions={} attrs={}",
            txId, userId, versionsDeleted, attrsDeleted);
    }

    // ================================================================
    // LECTURE (avec règles de visibilité)
    // ================================================================

    /**
     * Retourne la transaction OPEN de l'utilisateur courant, ou null.
     */
    public String findOpenTransaction(String userId) {
        return dsl
            .select()
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
        Record tx = dsl
            .select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();

        if (tx == null) throw new IllegalArgumentException(
            "Transaction not found: " + txId
        );

        String status = tx.get("status", String.class);
        String ownerId = tx.get("owner_id", String.class);
        PlmUserContext ctx = PlmSecurityContext.get();

        if (
            "OPEN".equals(status) &&
            !ctx.isAdmin() &&
            !ctx.getUserId().equals(ownerId)
        ) {
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
            return dsl
                .select()
                .from("plm_transaction")
                .orderBy(DSL.field("created_at").desc())
                .limit(limit)
                .fetch();
        }

        // Utilisateur standard : COMMITTED + ses propres OPEN
        return dsl
            .select()
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

        return dsl.fetch(
            """
            SELECT nv.id, nv.node_id, nv.version_number, nv.revision, nv.iteration,
                   nv.lifecycle_state_id, nv.change_type, nv.change_description,
                   nv.previous_version_id, nv.version_reason, nv.created_at, nv.created_by,
                   nv.fingerprint,
                   n.logical_id, n.node_type_id
            FROM node_version nv
            JOIN node n ON n.id = nv.node_id
            WHERE nv.tx_id = ?
            ORDER BY nv.created_at
            """,
            txId
        );
    }

    /**
     * Retourne un résumé des noeuds modifiés dans la transaction :
     * une ligne par noeud (dernière version dans la tx), avec logical_id
     * et node_type_name résolus.
     *
     * Utilisé par le panneau de navigation du frontend.
     */
    public List<Record> getTransactionNodes(String txId) {
        getTransaction(txId); // applique les règles de visibilité

        return dsl.fetch(
            """
            SELECT
                n.id                  AS node_id,
                n.logical_id,
                n.node_type_id,
                nt.name               AS node_type_name,
                nv.revision,
                nv.iteration,
                nv.change_type,
                nv.lifecycle_state_id
            FROM node_version nv
            JOIN node      n  ON n.id  = nv.node_id
            JOIN node_type nt ON nt.id = n.node_type_id
            WHERE nv.tx_id = ?
              AND nv.version_number = (
                  SELECT MAX(nv2.version_number)
                  FROM   node_version nv2
                  WHERE  nv2.node_id = nv.node_id
                    AND  nv2.tx_id   = ?
              )
            ORDER BY n.logical_id
            """,
            txId,
            txId
        );
    }

    // ================================================================
    // INTÉGRATION AVEC LockService / VersionService
    // ================================================================

    /**
     * Vérifie si une node_version est visible par l'utilisateur courant.
     *
     * Règles :
     *  - tx_id = NULL           → version initiale, toujours visible
     *  - plm_transaction.status = COMMITTED  → visible par tous
     *  - plm_transaction.status = OPEN       → visible uniquement par owner de la tx + admins
     *
     * Note : il n'y a pas de statut ROLLEDBACK — les versions annulées
     * sont supprimées physiquement au rollback.
     */
    public boolean isVersionVisible(Record nodeVersion) {
        String txId = nodeVersion.get("tx_id", String.class);
        Record tx = dsl
            .select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();
        if (tx == null) return false;

        if ("COMMITTED".equals(tx.get("status", String.class))) return true;

        PlmUserContext ctx = PlmSecurityContext.get();
        if (ctx.isAdmin()) return true;

        // OPEN → uniquement le owner
        return ctx.getUserId().equals(tx.get("owner_id", String.class));
    }

    /**
     * Retourne la version courante visible d'un noeud pour l'utilisateur courant.
     * Prend la dernière version COMMITTED ou la dernière OPEN si owner/admin.
     */
    public Record getCurrentVisibleVersion(String nodeId) {
        PlmUserContext ctx = PlmSecurityContext.get();

        if (ctx.isAdmin()) {
            // Admin voit tout (COMMITTED + OPEN)
            return dsl.select().from("node_version")
                .where("node_id = ?", nodeId)
                .and(DSL.exists(
                    dsl.selectOne().from("plm_transaction")
                       .where("id = node_version.tx_id")
                       .and("status IN ('COMMITTED', 'OPEN')")
                ))
                .orderBy(DSL.field("version_number").desc())
                .limit(1)
                .fetchOne();
        }

        // Utilisateur : version OPEN de sa propre tx, sinon dernière COMMITTED
        String openTxId = findOpenTransaction(ctx.getUserId());
        if (openTxId != null) {
            Record ownVersion = dsl
                .select()
                .from("node_version")
                .where("node_id = ?", nodeId)
                .and("tx_id = ?", openTxId)
                .orderBy(DSL.field("version_number").desc())
                .limit(1)
                .fetchOne();
            if (ownVersion != null) return ownVersion;
        }

        // Dernière version COMMITTED
        return dsl.select().from("node_version")
            .where("node_id = ?", nodeId)
            .and(DSL.exists(
                dsl.selectOne().from("plm_transaction")
                   .where("id = node_version.tx_id")
                   .and("status = 'COMMITTED'")
            ))
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
        List<String> staleTxIds = dsl
            .select()
            .from("plm_transaction")
            .where("status = 'OPEN'")
            .and("created_at < ?", LocalDateTime.now().minusHours(24))
            .fetch("id", String.class);

        for (String txId : staleTxIds) {
            String ownerId = dsl
                .select()
                .from("plm_transaction")
                .where("id = ?", txId)
                .fetchOne("owner_id", String.class);

            // Suppression physique (même sémantique que rollback manuel)
            dsl.execute("DELETE FROM baseline_entry WHERE node_link_id IN (SELECT id FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?))", txId);
            dsl.execute("DELETE FROM baseline_entry WHERE resolved_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)", txId);
            dsl.execute("DELETE FROM node_version_attribute WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)", txId);
            dsl.execute("DELETE FROM node_signature WHERE node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)", txId);
            dsl.execute("DELETE FROM node_version_link WHERE source_node_version_id IN (SELECT id FROM node_version WHERE tx_id = ?)", txId);
            dsl.execute("DELETE FROM node_version WHERE tx_id = ?", txId);
            dsl.execute("DELETE FROM plm_transaction WHERE id = ?", txId);
            log.warn(
                "Stale transaction auto-rolled-back and deleted: id={} owner={}",
                txId,
                ownerId
            );
        }

        if (!staleTxIds.isEmpty()) {
            log.info("Cleaned {} stale transactions", staleTxIds.size());
        }
    }

    // ================================================================
    // FINGERPRINT HELPERS
    // ================================================================

    /**
     * Returns the stored fingerprint of a version, or computes it on-the-fly
     * if not yet persisted (e.g. versions created before V8 migration).
     */
    private String getOrComputeFingerPrint(String nodeId, String versionId) {
        String stored = dsl
            .select()
            .from("node_version")
            .where("id = ?", versionId)
            .fetchOne("fingerprint", String.class);
        if (stored != null && !stored.isBlank()) return stored;
        return fingerPrintService.compute(nodeId, versionId);
    }

    // ================================================================
    // Helpers privés
    // ================================================================

    private Record loadAndVerifyOwnership(String txId, String userId) {
        Record tx = dsl
            .select()
            .from("plm_transaction")
            .where("id = ?", txId)
            .fetchOne();

        if (tx == null) throw new IllegalArgumentException(
            "Transaction not found: " + txId
        );

        String status = tx.get("status", String.class);
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
                "User " +
                    userId +
                    " already has an open transaction: " +
                    existing +
                    ". Commit or rollback it first."
            );
        }
    }

    // ================================================================
    // Exceptions
    // ================================================================

    public static class TransactionOwnershipException extends RuntimeException {

        public TransactionOwnershipException(String msg) {
            super(msg);
        }
    }
}
