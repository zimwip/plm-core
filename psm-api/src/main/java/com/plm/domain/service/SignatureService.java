package com.plm.domain.service;

import com.plm.domain.action.PlmAction;
import com.plm.domain.model.Enums.ChangeType;
import com.plm.infrastructure.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Gestion des signatures électroniques.
 *
 * txId obligatoire — une signature est un acte d'authoring dans une transaction.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SignatureService {

    private final DSLContext        dsl;
    private final LockService       lockService;
    private final VersionService    versionService;
    private final FingerPrintService fingerPrintService;
    private final PlmEventPublisher eventPublisher;

    /**
     * Appose une signature électronique.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @PlmAction(value = "SIGN", nodeIdExpr = "#nodeId")
    @Transactional
    public String sign(String nodeId, String userId, String txId, String meaning, String comment) {

        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) throw new IllegalStateException("Node has no version: " + nodeId);

        String revision  = current.get("revision",  String.class);
        int    iteration = current.get("iteration", Integer.class);

        // Vérifier doublon sur cette révision.itération
        boolean alreadySigned = dsl.fetchCount(dsl.selectOne()
            .from("node_signature ns")
            .join("node_version nv").on("ns.node_version_id = nv.id")
            .where("ns.node_id = ?", nodeId).and("ns.signed_by = ?", userId)
            .and("nv.revision = ?", revision).and("nv.iteration = ?", iteration)) > 0;

        if (alreadySigned) throw new IllegalStateException(
            "User " + userId + " already signed " + nodeId + " at " + revision + "." + iteration);

        // Capture fingerprint of the parent (committed) version — records what is being signed.
        String currentVersionId = current.get("id", String.class);
        String parentFingerprint = fingerPrintService.compute(nodeId, currentVersionId);

        // Créer la version SIGNATURE — NONE : pas de changement de numérotation
        String newVersionId = versionService.createVersion(
            nodeId, userId, txId,
            ChangeType.SIGNATURE, com.plm.domain.model.Enums.VersionStrategy.NONE, null,
            Collections.emptyMap(),
            "Signature: " + meaning + (comment != null ? " — " + comment : "")
        );

        // Acquiert le lock (conflit → exception + rollback) et écrit locked_by / locked_at.
        lockService.tryLock(nodeId, userId);

        // Enregistrer la signature
        String sigId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_signature (ID, NODE_ID, NODE_VERSION_ID, SIGNED_BY, SIGNED_AT, MEANING, COMMENT, SIGNED_VERSION_FINGERPRINT)
            VALUES (?,?,?,?,?,?,?,?)
            """, sigId, nodeId, newVersionId, userId, LocalDateTime.now(), meaning, comment, parentFingerprint);

        // Recompute and store fingerprint on the new version now that the signature row exists.
        // The version was created before the signature insert, so its stored fingerprint was stale.
        String updatedFp = fingerPrintService.compute(nodeId, newVersionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", updatedFp, newVersionId);

        eventPublisher.signed(nodeId, userId, meaning);
        log.info("Signature: node={} user={} meaning={} {}.{} tx={}", nodeId, userId, meaning, revision, iteration, txId);
        return sigId;
    }

    @PlmAction(value = "READ", nodeIdExpr = "#nodeId")
    public List<Record> getSignaturesForCurrentIteration(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return Collections.emptyList();
        return dsl.fetch("""
            SELECT ns.id, ns.node_id, ns.node_version_id, ns.signed_by, ns.signed_at,
                   ns.meaning, ns.comment,
                   nv.version_number, nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_signature ns
            JOIN node_version nv ON ns.node_version_id = nv.id
            WHERE ns.node_id = ? AND nv.revision = ? AND nv.iteration = ?
            ORDER BY ns.signed_at
            """, nodeId, current.get("revision", String.class), current.get("iteration", Integer.class));
    }

    @PlmAction(value = "READ", nodeIdExpr = "#nodeId")
    public List<Record> getFullSignatureHistory(String nodeId) {
        return dsl.fetch("""
            SELECT ns.id, ns.node_id, ns.node_version_id, ns.signed_by, ns.signed_at,
                   ns.meaning, ns.comment,
                   nv.version_number, nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_signature ns
            JOIN node_version nv ON ns.node_version_id = nv.id
            WHERE ns.node_id = ?
            ORDER BY ns.signed_at DESC
            """, nodeId);
    }
}
