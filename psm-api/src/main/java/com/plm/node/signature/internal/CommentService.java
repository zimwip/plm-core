package com.plm.node.signature.internal;
import com.plm.node.version.internal.FingerPrintService;

import com.plm.platform.authz.KeyExpr;
import com.plm.platform.authz.PlmPermission;
import com.plm.shared.event.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Manages free-text comments on node versions.
 *
 * Comments are outside the PLM transaction system — they attach directly to a
 * node_version (open or committed) and capture its SHA-256 fingerprint at post time
 * for tamper evidence (same mechanism as node_signature.signed_version_fingerprint).
 *
 * Threading: top-level comments have parent_comment_id = NULL; replies reference
 * the parent. UI enforces max 1 level of nesting.
 *
 * Attribute context: optional attribute_name pins a comment to a specific attribute.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final DSLContext         dsl;
    private final FingerPrintService fingerPrintService;
    private final PlmEventPublisher  eventPublisher;

    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    @Transactional
    public String addComment(String nodeId, String nodeVersionId, String userId,
                             String text, String parentCommentId, String attributeName) {

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Comment text is required");
        }

        // Validate version belongs to this node
        if (dsl.fetchOne("SELECT 1 FROM node_version WHERE id = ? AND node_id = ?",
                nodeVersionId, nodeId) == null) {
            throw new IllegalArgumentException("Version " + nodeVersionId + " not found on node " + nodeId);
        }

        // Validate parent belongs to same node
        if (parentCommentId != null) {
            if (dsl.fetchOne("SELECT 1 FROM node_version_comment WHERE id = ? AND node_id = ?",
                    parentCommentId, nodeId) == null) {
                throw new IllegalArgumentException("Parent comment not found on this node");
            }
        }

        // Fingerprint the version being commented on (tamper evidence)
        String fp = fingerPrintService.compute(nodeId, nodeVersionId);

        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_version_comment
              (id, node_id, node_version_id, author, created_at, text,
               version_fingerprint, parent_comment_id, attribute_name)
            VALUES (?,?,?,?,?,?,?,?,?)
            """, id, nodeId, nodeVersionId, userId, LocalDateTime.now(),
               text, fp, parentCommentId, attributeName);

        log.info("Comment {} on node={} version={} parent={} attr={} by {}",
            id, nodeId, nodeVersionId, parentCommentId, attributeName, userId);
        eventPublisher.commentAdded(nodeId, id, nodeVersionId, userId);
        return id;
    }

    @PlmPermission(value = "READ_NODE", keyExprs = @KeyExpr(name = "nodeType", expr = "#nodeId"))
    public List<Map<String, Object>> getComments(String nodeId) {
        return dsl.fetch("""
            SELECT c.id, c.author, c.created_at, c.text, c.version_fingerprint,
                   c.parent_comment_id, c.attribute_name,
                   nv.revision, nv.iteration, nv.id AS version_id
            FROM node_version_comment c
            JOIN node_version nv ON nv.id = c.node_version_id
            WHERE c.node_id = ?
            ORDER BY c.created_at ASC
            """, nodeId)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",                 r.get("id", String.class));
                m.put("author",             r.get("author", String.class));
                m.put("createdAt",          Objects.toString(r.get("created_at"), ""));
                m.put("text",               r.get("text", String.class));
                m.put("versionFingerprint", Objects.toString(r.get("version_fingerprint", String.class), ""));
                m.put("parentCommentId",    r.get("parent_comment_id", String.class));
                m.put("attributeName",      r.get("attribute_name", String.class));
                m.put("revision",           Objects.toString(r.get("revision", String.class), ""));
                m.put("iteration",          Objects.toString(r.get("iteration", Integer.class), "0"));
                m.put("versionId",          r.get("version_id", String.class));
                return m;
            });
    }
}
