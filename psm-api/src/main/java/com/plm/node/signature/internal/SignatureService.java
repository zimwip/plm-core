package com.plm.node.signature.internal;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.node.version.internal.VersionService;

import com.plm.shared.action.PlmAction;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.event.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Gestion des signatures électroniques.
 *
 * Signatures attach directly to the current version — no new version created,
 * no lock acquired, no PLM transaction required (like comments).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SignatureService {

    private final DSLContext         dsl;
    private final VersionService     versionService;
    private final FingerPrintService fingerPrintService;
    private final PlmEventPublisher  eventPublisher;

    @PlmAction(value = "SIGN", nodeIdExpr = "#nodeId")
    @Transactional
    public String sign(String nodeId, String userId, String meaning, String comment) {

        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) throw new IllegalStateException("Node has no version: " + nodeId);

        String currentVersionId = current.get("id", String.class);

        // Vérifier doublon sur cette version (signatures valid only for current frozen version)
        boolean alreadySigned = dsl.fetchCount(dsl.selectOne()
            .from("node_signature ns")
            .where("ns.node_id = ?", nodeId).and("ns.signed_by = ?", userId)
            .and("ns.node_version_id = ?", currentVersionId)) > 0;

        if (alreadySigned) throw new IllegalStateException(
            "User " + userId + " already signed " + nodeId + " on this version");

        // Capture fingerprint of current version — records what is being signed
        String fingerprint = fingerPrintService.compute(nodeId, currentVersionId);

        // Insert signature attached to current version (no new version created)
        String sigId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_signature (ID, NODE_ID, NODE_VERSION_ID, SIGNED_BY, SIGNED_AT, MEANING, COMMENT, SIGNED_VERSION_FINGERPRINT)
            VALUES (?,?,?,?,?,?,?,?)
            """, sigId, nodeId, currentVersionId, userId, LocalDateTime.now(), meaning, comment, fingerprint);

        eventPublisher.signed(nodeId, userId, meaning);
        log.info("Signature: node={} user={} meaning={} version={}", nodeId, userId, meaning, currentVersionId);
        return sigId;
    }

    @PlmPermission(value = "READ_NODE", nodeIdExpr = "#nodeId")
    public List<Record> getSignaturesForCurrentVersion(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return List.of();
        String currentVersionId = current.get("id", String.class);
        return dsl.fetch("""
            SELECT ns.id, ns.node_id, ns.node_version_id, ns.signed_by, ns.signed_at,
                   ns.meaning, ns.comment,
                   nv.version_number, nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_signature ns
            JOIN node_version nv ON ns.node_version_id = nv.id
            WHERE ns.node_version_id = ?
            ORDER BY ns.signed_at
            """, currentVersionId);
    }

    @PlmPermission(value = "READ_NODE", nodeIdExpr = "#nodeId")
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
