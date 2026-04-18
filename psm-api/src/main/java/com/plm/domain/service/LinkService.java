package com.plm.domain.service;

import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.model.Enums.VersionStrategy;
import com.plm.domain.action.PlmAction;
import com.plm.domain.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Manages node links (BOM structure): creation, deletion, update, and read queries.
 *
 * Extracted from NodeService to keep link management separate from node CRUD.
 * All write operations require an open PLM transaction (txId).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LinkService {

    private final DSLContext              dsl;
    private final LockService             lockService;
    private final VersionService          versionService;
    private final GraphValidationService  graphValidationService;
    private final FingerPrintService      fingerPrintService;
    private final SecurityContextPort     secCtx;

    // ================================================================
    // CREATE LINK
    // ================================================================

    /**
     * Creates a link between two nodes within a transaction.
     * The source node must be locked in the transaction.
     *
     * @param txId transaction PLM ouverte — OBLIGATOIRE
     */
    @PlmAction(value = "CREATE_LINK", nodeIdExpr = "#sourceNodeId")
    @Transactional
    public String createLink(
        String linkTypeId,
        String sourceNodeId,
        String targetNodeId,
        String pinnedVersionId,
        String userId,
        String txId,
        String linkLogicalId
    ) {
        Record linkType = dsl
            .select()
            .from("link_type")
            .where("id = ?", linkTypeId)
            .fetchOne();
        if (linkType == null) throw new IllegalArgumentException(
            "LinkType not found: " + linkTypeId
        );

        String expectedSource = linkType.get("source_node_type_id", String.class);
        String expectedTarget = linkType.get("target_node_type_id", String.class);
        if (expectedSource != null) validateNodeType(sourceNodeId, expectedSource);
        if (expectedTarget != null) validateNodeType(targetNodeId, expectedTarget);

        graphValidationService.assertNoCycle(sourceNodeId, targetNodeId);

        // Validate link_logical_id — mandatory
        String pattern = linkType.get("link_logical_id_pattern", String.class);
        String label   = linkType.get("link_logical_id_label",   String.class);
        if (label == null || label.isBlank()) label = "Link ID";
        if (linkLogicalId == null || linkLogicalId.isBlank()) {
            throw new IllegalArgumentException("'" + label + "' is required");
        }
        if (pattern != null && !pattern.isBlank() && !linkLogicalId.matches(pattern)) {
            throw new IllegalArgumentException(
                "'" + label + "' value '" + linkLogicalId + "' does not match pattern: " + pattern
            );
        }

        Integer maxCard = linkType.get("max_cardinality", Integer.class);
        if (maxCard != null) {
            int existing = dsl.fetchCount(
                dsl.selectOne()
                    .from("node_version_link nl")
                    .join("node_version nv_src").on("nv_src.id = nl.source_node_version_id")
                    .where("nl.link_type_id = ?", linkTypeId)
                    .and("nv_src.node_id = ?", sourceNodeId)
            );
            if (existing >= maxCard) throw new IllegalStateException(
                "Max cardinality " + maxCard + " reached"
            );
        }

        // Ensure the source node has an OPEN version in this tx
        String sourceVersionId = findOpenVersionInTx(sourceNodeId, txId);
        if (sourceVersionId == null) {
            sourceVersionId = versionService.createVersion(
                sourceNodeId, userId, txId,
                ChangeType.CONTENT, VersionStrategy.ITERATE,
                null, Map.of(), "Link creation"
            );
        }

        lockService.tryLock(sourceNodeId, userId);

        // Uniqueness check on link_logical_id per source_node_version_id
        if (linkLogicalId != null && !linkLogicalId.isBlank()) {
            int dup = dsl.fetchCount(
                dsl.selectOne()
                    .from("node_version_link")
                    .where("source_node_version_id = ?", sourceVersionId)
                    .and("link_logical_id = ?", linkLogicalId)
            );
            if (dup > 0) throw new IllegalArgumentException(
                "'" + label + "' value '" + linkLogicalId + "' is already used by another link on this version"
            );
        }

        String linkId = UUID.randomUUID().toString();
        dsl.execute(
            """
            INSERT INTO node_version_link
              (ID, LINK_TYPE_ID, SOURCE_NODE_VERSION_ID, TARGET_NODE_ID, PINNED_VERSION_ID,
               LINK_LOGICAL_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?,?)
            """,
            linkId, linkTypeId, sourceVersionId, targetNodeId, pinnedVersionId,
            (linkLogicalId != null && !linkLogicalId.isBlank()) ? linkLogicalId : null,
            LocalDateTime.now(), userId
        );

        // Recompute fingerprint — link is now part of source version content
        String fp = fingerPrintService.compute(sourceNodeId, sourceVersionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, sourceVersionId);

        log.info("Link created: {}→{} type={} policy={} logicalId={}",
            sourceNodeId, targetNodeId, linkTypeId,
            pinnedVersionId == null ? "V2M" : "V2V", linkLogicalId);
        return linkId;
    }

    // ================================================================
    // DELETE LINK
    // ================================================================

    @PlmAction(value = "DELETE_LINK", linkIdExpr = "#linkId")
    @Transactional
    public void deleteLink(String linkId, String userId, String txId) {
        String sourceNodeId = resolveLinkSourceNodeId(linkId);
        String sourceVersionId = dsl.select(DSL.field("source_node_version_id"))
            .from("node_version_link").where("id = ?", linkId)
            .fetchOne(DSL.field("source_node_version_id"), String.class);
        lockService.tryLock(sourceNodeId, userId);
        dsl.execute("DELETE FROM node_version_link WHERE id = ?", linkId);
        if (sourceVersionId != null) {
            String fp = fingerPrintService.compute(sourceNodeId, sourceVersionId);
            dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, sourceVersionId);
        }
        log.info("Link {} deleted by {}", linkId, userId);
    }

    // ================================================================
    // UPDATE LINK
    // ================================================================

    @PlmAction(value = "UPDATE_LINK", linkIdExpr = "#linkId")
    @Transactional
    public void updateLink(
        String linkId,
        String newTargetNodeId,
        String newLogicalId,
        String userId,
        String txId
    ) {
        Record link = dsl.select().from("node_version_link").where("id = ?", linkId).fetchOne();
        if (link == null) throw new IllegalArgumentException("Link not found: " + linkId);

        String sourceVersionId = link.get("source_node_version_id", String.class);
        String sourceNodeId = dsl.select().from("node_version")
            .where("id = ?", sourceVersionId)
            .fetchOne("node_id", String.class);
        if (sourceNodeId == null) throw new IllegalArgumentException("Source node not found for link: " + linkId);

        lockService.tryLock(sourceNodeId, userId);

        if (newTargetNodeId != null && !newTargetNodeId.isBlank()) {
            graphValidationService.assertNoCycle(sourceNodeId, newTargetNodeId);

            String linkTypeId = link.get("link_type_id", String.class);
            String policy = dsl.select().from("link_type")
                .where("id = ?", linkTypeId)
                .fetchOne("link_policy", String.class);
            String pinnedVersionId = null;
            if ("VERSION_TO_VERSION".equals(policy)) {
                pinnedVersionId = dsl.select().from("node_version")
                    .where("node_id = ?", newTargetNodeId)
                    .and(DSL.exists(
                        dsl.selectOne().from("plm_transaction")
                           .where("id = node_version.tx_id")
                           .and("status = 'COMMITTED'")
                    ))
                    .orderBy(DSL.field("version_number").desc())
                    .limit(1)
                    .fetchOne("id", String.class);
            }
            dsl.execute(
                "UPDATE node_version_link SET target_node_id = ?, pinned_version_id = ? WHERE id = ?",
                newTargetNodeId, pinnedVersionId, linkId
            );
        }

        if (newLogicalId != null && !newLogicalId.isBlank()) {
            int dup = dsl.fetchCount(
                dsl.selectOne().from("node_version_link")
                   .where("source_node_version_id = ?", sourceVersionId)
                   .and("link_logical_id = ?", newLogicalId)
                   .and("id != ?", linkId)
            );
            if (dup > 0) throw new IllegalArgumentException(
                "Link ID '" + newLogicalId + "' is already used by another link on this version"
            );
            dsl.execute("UPDATE node_version_link SET link_logical_id = ? WHERE id = ?", newLogicalId, linkId);
        }

        String fp = fingerPrintService.compute(sourceNodeId, sourceVersionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, sourceVersionId);

        log.info("Link {} updated (target={} logicalId={}) by {}", linkId, newTargetNodeId, newLogicalId, userId);
    }

    // ================================================================
    // READ — child and parent links
    // ================================================================

    /**
     * Returns outgoing links from a node (BOM / children).
     */
    public List<Map<String, Object>> getChildLinks(String nodeId) {
        var ctx = secCtx.currentUser();
        String currentUserId = ctx.getUserId();
        boolean isAdmin = ctx.isAdmin();
        String isAdminStr = String.valueOf(isAdmin);
        return dsl.fetch(
            """
            SELECT nl.id AS link_id, lt.name AS link_type_name, lt.link_policy, lt.color AS link_type_color, lt.icon AS link_type_icon,
                   nl.link_logical_id, lt.link_logical_id_label,
                   n.id AS target_node_id, nt.name AS target_node_type,
                   n.logical_id AS target_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id,
                   (SELECT COUNT(*) FROM node_version_link nvl_c
                    WHERE nvl_c.source_node_version_id = nv.id) AS target_children_count
            FROM node_version_link nl
            JOIN link_type lt        ON lt.id     = nl.link_type_id
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nl.target_node_id
            JOIN node_type nt        ON nt.id     = n.node_type_id
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nv_src.node_id = ?
              AND (pt_src.status = 'COMMITTED'
                   OR (pt_src.status = 'OPEN' AND (pt_src.owner_id = ? OR ? = 'true')))
              AND (pt.status = 'COMMITTED'
                   OR (pt.status = 'OPEN' AND (pt.owner_id = ? OR ? = 'true')))
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id
                WHERE nv2.node_id = n.id
                  AND (pt2.status = 'COMMITTED'
                       OR (pt2.status = 'OPEN' AND (pt2.owner_id = ? OR ? = 'true'))))
            ORDER BY lt.name, n.logical_id
            """,
            nodeId,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr
        ).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("linkId",            r.get("link_id",             String.class));
            m.put("linkTypeName",      r.get("link_type_name",      String.class));
            m.put("linkPolicy",        r.get("link_policy",         String.class));
            m.put("linkTypeColor",     r.get("link_type_color",     String.class));
            m.put("linkTypeIcon",      r.get("link_type_icon",      String.class));
            m.put("linkLogicalId",     Objects.toString(r.get("link_logical_id",      String.class), ""));
            m.put("linkLogicalIdLabel",Objects.toString(r.get("link_logical_id_label",String.class), "Link ID"));
            m.put("targetNodeId",      r.get("target_node_id",      String.class));
            m.put("targetNodeType",    r.get("target_node_type",    String.class));
            m.put("targetLogicalId",   Objects.toString(r.get("target_logical_id",   String.class), ""));
            m.put("targetRevision",    Objects.toString(r.get("revision",             String.class), ""));
            m.put("targetIteration",   Objects.toString(r.get("iteration",            Integer.class), ""));
            m.put("targetState",       Objects.toString(r.get("lifecycle_state_id",  String.class), ""));
            m.put("targetChildrenCount", r.get("target_children_count", Integer.class));
            return m;
        }).toList();
    }

    /**
     * Returns incoming links to a node (Where Used / parents).
     */
    public List<Map<String, Object>> getParentLinks(String nodeId) {
        var ctx = secCtx.currentUser();
        String currentUserId = ctx.getUserId();
        boolean isAdmin = ctx.isAdmin();
        String isAdminStr = String.valueOf(isAdmin);
        return dsl.fetch(
            """
            SELECT nl.id AS link_id, lt.name AS link_type_name, lt.link_policy,
                   nl.link_logical_id, lt.link_logical_id_label,
                   n.id AS source_node_id, nt.name AS source_node_type,
                   n.logical_id AS source_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version_link nl
            JOIN link_type lt        ON lt.id     = nl.link_type_id
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nv_src.node_id
            JOIN node_type nt        ON nt.id     = n.node_type_id
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nl.target_node_id = ?
              AND (pt_src.status = 'COMMITTED'
                   OR (pt_src.status = 'OPEN' AND (pt_src.owner_id = ? OR ? = 'true')))
              AND (pt.status = 'COMMITTED'
                   OR (pt.status = 'OPEN' AND (pt.owner_id = ? OR ? = 'true')))
              AND nv.version_number = (
                SELECT MAX(nv2.version_number) FROM node_version nv2
                JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id
                WHERE nv2.node_id = n.id
                  AND (pt2.status = 'COMMITTED'
                       OR (pt2.status = 'OPEN' AND (pt2.owner_id = ? OR ? = 'true'))))
            ORDER BY lt.name, n.logical_id
            """,
            nodeId,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr
        ).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("linkId",             r.get("link_id",             String.class));
            m.put("linkTypeName",       r.get("link_type_name",      String.class));
            m.put("linkPolicy",         r.get("link_policy",         String.class));
            m.put("linkLogicalId",      Objects.toString(r.get("link_logical_id",      String.class), ""));
            m.put("linkLogicalIdLabel", Objects.toString(r.get("link_logical_id_label",String.class), "Link ID"));
            m.put("sourceNodeId",       r.get("source_node_id",      String.class));
            m.put("sourceNodeType",     r.get("source_node_type",    String.class));
            m.put("sourceLogicalId",    Objects.toString(r.get("source_logical_id",   String.class), ""));
            m.put("sourceRevision",     Objects.toString(r.get("revision",             String.class), ""));
            m.put("sourceIteration",    Objects.toString(r.get("iteration",            Integer.class), ""));
            m.put("sourceState",        Objects.toString(r.get("lifecycle_state_id",  String.class), ""));
            return m;
        }).toList();
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String findOpenVersionInTx(String nodeId, String txId) {
        return dsl.select().from("node_version")
            .where("node_id = ?", nodeId)
            .and("tx_id = ?", txId)
            .orderBy(DSL.field("version_number").desc())
            .limit(1)
            .fetchOne("id", String.class);
    }

    private String resolveLinkSourceNodeId(String linkId) {
        Record link = dsl.select().from("node_version_link").where("id = ?", linkId).fetchOne();
        if (link == null) throw new IllegalArgumentException("Link not found: " + linkId);
        String sourceVersionId = link.get("source_node_version_id", String.class);
        String sourceNodeId = dsl.select().from("node_version")
            .where("id = ?", sourceVersionId)
            .fetchOne("node_id", String.class);
        if (sourceNodeId == null) throw new IllegalArgumentException("Source node not found for link: " + linkId);
        return sourceNodeId;
    }

    private void validateNodeType(String nodeId, String expectedTypeId) {
        String actual = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        if (!isTypeOrDescendant(actual, expectedTypeId)) throw new IllegalArgumentException(
            "Node " + nodeId + " wrong type, expected " + expectedTypeId
        );
    }

    private boolean isTypeOrDescendant(String typeId, String expectedTypeId) {
        String current = typeId;
        while (current != null) {
            if (expectedTypeId.equals(current)) return true;
            current = dsl.select().from("node_type").where("id = ?", current)
                .fetchOne("parent_node_type_id", String.class);
        }
        return false;
    }
}
