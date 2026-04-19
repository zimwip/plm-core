package com.plm.node.version.internal;

import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;

/**
 * Computes a canonical SHA-256 fingerprint for a node_version.
 *
 * The fingerprint captures the full observable content of a version:
 *
 *   state=<lifecycle_state_id>
 *   |attrs=<attr_def_id>:<value>;<attr_def_id>:<value>;...   (sorted by attr_def_id)
 *   |sigs=<user_id>:<meaning>;<user_id>:<meaning>;...        (sorted by user_id, meaning)
 *   |links=<link_type_id>:<target_node_id>:<pinned_ver|>;... (sorted by link_type_id, target_node_id)
 *
 * Consistent ordering ensures two versions with identical content produce identical
 * fingerprints regardless of insertion order.
 *
 * Two versions are considered identical (no-op) when their fingerprints match.
 * The fingerprint is stored on node_version.fingerprint at commit time.
 */
@Service
@RequiredArgsConstructor
public class FingerPrintService {

    private final DSLContext dsl;

    /**
     * Computes the fingerprint for a given node version.
     *
     * @param nodeId        the stable node identifier (for link lookup)
     * @param nodeVersionId the specific version to fingerprint
     * @return 64-character lowercase hex SHA-256 digest
     */
    public String compute(String nodeId, String nodeVersionId) {
        StringBuilder sb = new StringBuilder(512);

        // ── 1. Lifecycle state ────────────────────────────────────────────
        Record version = dsl.select()
            .from("node_version")
            .where("id = ?", nodeVersionId)
            .fetchOne();
        if (version == null) throw new IllegalArgumentException("Version not found: " + nodeVersionId);

        sb.append("state=").append(nvl(version.get("lifecycle_state_id", String.class)));

        // ── 2. Attribute values (sorted by attribute_def_id) ─────────────
        List<Record> attrs = dsl.select()
            .from("node_version_attribute")
            .where("node_version_id = ?", nodeVersionId)
            .orderBy(DSL.field("attribute_def_id").asc())
            .fetch();

        sb.append("|attrs=");
        for (Record a : attrs) {
            sb.append(a.get("attribute_def_id", String.class))
              .append(':').append(nvl(a.get("value", String.class)))
              .append(';');
        }

        // ── 3. Signatures (sorted by signed_by, meaning) ─────────────────
        List<Record> sigs = dsl.select()
            .from("node_signature")
            .where("node_version_id = ?", nodeVersionId)
            .orderBy(DSL.field("signed_by").asc(), DSL.field("meaning").asc())
            .fetch();

        sb.append("|sigs=");
        for (Record s : sigs) {
            sb.append(s.get("signed_by", String.class))
              .append(':').append(s.get("meaning", String.class))
              .append(';');
        }

        // ── 4. Outgoing links (sorted by link_type_id, target_node_id) ───
        // Include links whose source_node_version_id chains back to this version or before:
        //   - committed links whose source version_number <= this version's version_number
        //   - links created in this exact version (OPEN, being committed now)
        // Legacy links (source_node_version_id IS NULL) are included for backward compat.
        List<Record> links = dsl.fetch("""
            SELECT nl.link_type_id, nl.target_node_id, nl.pinned_version_id
            FROM node_version_link nl
            JOIN node_version nv_src    ON nv_src.id  = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id  = nv_src.tx_id
            WHERE nv_src.node_id = ?
              AND (pt_src.status = 'COMMITTED' OR nv_src.id = ?)
              AND nv_src.version_number <= (
                SELECT version_number FROM node_version WHERE id = ?)
            ORDER BY nl.link_type_id ASC, nl.target_node_id ASC
            """, nodeId, nodeVersionId, nodeVersionId);

        sb.append("|links=");
        for (Record l : links) {
            sb.append(l.get("link_type_id",   String.class))
              .append(':').append(l.get("target_node_id", String.class))
              .append(':').append(nvl(l.get("pinned_version_id", String.class)))
              .append(';');
        }

        return sha256(sb.toString());
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private static String nvl(String s) { return s != null ? s : ""; }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[]  hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(64);
            for (byte b : hash) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
