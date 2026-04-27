package com.plm.node.link.internal;
import com.plm.node.NodeService;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.node.version.internal.VersionService;
import com.plm.node.transaction.internal.LockService;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.shared.model.Enums.ChangeType;
import com.plm.shared.model.Enums.VersionStrategy;
import com.plm.shared.action.PlmAction;
import com.plm.shared.security.SecurityContextPort;
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
    private final ConfigCache             configCache;
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
    @PlmAction(value = "create_link", nodeIdExpr = "#sourceNodeId")
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
        LinkTypeConfig linkType = configCache.getLinkType(linkTypeId)
            .orElseThrow(() -> new IllegalArgumentException("LinkType not found: " + linkTypeId));

        String expectedSource = linkType.sourceNodeTypeId();
        String expectedTarget = linkType.targetNodeTypeId();
        if (expectedSource != null) validateNodeType(sourceNodeId, expectedSource);
        if (expectedTarget != null) validateNodeType(targetNodeId, expectedTarget);

        graphValidationService.assertNoCycle(sourceNodeId, targetNodeId);

        // Validate link_logical_id — mandatory
        String pattern = linkType.linkLogicalIdPattern();
        String label   = linkType.linkLogicalIdLabel();
        if (label == null || label.isBlank()) label = "Link ID";
        if (linkLogicalId == null || linkLogicalId.isBlank()) {
            throw new IllegalArgumentException("'" + label + "' is required");
        }
        if (pattern != null && !pattern.isBlank() && !linkLogicalId.matches(pattern)) {
            throw new IllegalArgumentException(
                "'" + label + "' value '" + linkLogicalId + "' does not match pattern: " + pattern
            );
        }

        Integer maxCard = linkType.maxCardinality();
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

    @PlmAction(value = "delete_link", linkIdExpr = "#linkId")
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

    @PlmAction(value = "update_link", linkIdExpr = "#linkId")
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
            String policy = configCache.getLinkType(linkTypeId)
                .map(LinkTypeConfig::linkPolicy).orElse(null);
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
            SELECT nl.id AS link_id, nl.link_type_id,
                   nl.link_logical_id,
                   n.id AS target_node_id, n.node_type_id AS target_node_type_id,
                   n.logical_id AS target_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id,
                   (SELECT COUNT(*) FROM node_version_link nvl_c
                    WHERE nvl_c.source_node_version_id = nv.id) AS target_children_count
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nl.target_node_id
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
            ORDER BY n.logical_id
            """,
            nodeId,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr
        ).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("linkId",            r.get("link_id",             String.class));
            String ltId = r.get("link_type_id", String.class);
            var lt = configCache.getLinkType(ltId);
            m.put("linkTypeName",      lt.map(LinkTypeConfig::name).orElse(ltId));
            m.put("linkPolicy",        lt.map(LinkTypeConfig::linkPolicy).orElse(""));
            m.put("linkTypeColor",     lt.map(LinkTypeConfig::color).orElse(null));
            m.put("linkTypeIcon",      lt.map(LinkTypeConfig::icon).orElse(null));
            m.put("linkLogicalId",     Objects.toString(r.get("link_logical_id",      String.class), ""));
            m.put("linkLogicalIdLabel",lt.map(LinkTypeConfig::linkLogicalIdLabel).orElse("Link ID"));
            m.put("targetNodeId",      r.get("target_node_id",      String.class));
            String tntId = r.get("target_node_type_id", String.class);
            m.put("targetNodeType",    configCache.getNodeType(tntId)
                .map(NodeTypeConfig::name).orElse(tntId));
            m.put("targetLogicalId",   Objects.toString(r.get("target_logical_id",   String.class), ""));
            m.put("targetRevision",    Objects.toString(r.get("revision",             String.class), ""));
            m.put("targetIteration",   Objects.toString(r.get("iteration",            Integer.class), ""));
            String targetStateId = r.get("lifecycle_state_id", String.class);
            m.put("targetState",       Objects.toString(targetStateId, ""));
            m.put("targetStateName",   resolveStateName(targetStateId));
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
            SELECT nl.id AS link_id, nl.link_type_id,
                   nl.link_logical_id,
                   n.id AS source_node_id, n.node_type_id AS source_node_type_id,
                   n.logical_id AS source_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nv_src.node_id
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
            ORDER BY n.logical_id
            """,
            nodeId,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr,
            currentUserId, isAdminStr
        ).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("linkId",             r.get("link_id",             String.class));
            String ltId = r.get("link_type_id", String.class);
            var lt = configCache.getLinkType(ltId);
            m.put("linkTypeName",       lt.map(LinkTypeConfig::name).orElse(ltId));
            m.put("linkPolicy",         lt.map(LinkTypeConfig::linkPolicy).orElse(""));
            m.put("linkLogicalId",      Objects.toString(r.get("link_logical_id",      String.class), ""));
            m.put("linkLogicalIdLabel", lt.map(LinkTypeConfig::linkLogicalIdLabel).orElse("Link ID"));
            m.put("sourceNodeId",       r.get("source_node_id",      String.class));
            String sntId = r.get("source_node_type_id", String.class);
            m.put("sourceNodeType",     configCache.getNodeType(sntId)
                .map(NodeTypeConfig::name).orElse(sntId));
            m.put("sourceLogicalId",    Objects.toString(r.get("source_logical_id",   String.class), ""));
            m.put("sourceRevision",     Objects.toString(r.get("revision",             String.class), ""));
            m.put("sourceIteration",    Objects.toString(r.get("iteration",            Integer.class), ""));
            String sourceStateId = r.get("lifecycle_state_id", String.class);
            m.put("sourceState",        Objects.toString(sourceStateId, ""));
            m.put("sourceStateName",    resolveStateName(sourceStateId));
            return m;
        }).toList();
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String resolveStateName(String stateId) {
        if (stateId == null) return "";
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.states() != null) {
                for (LifecycleStateConfig st : lc.states()) {
                    if (stateId.equals(st.id())) return st.name();
                }
            }
        }
        return stateId;
    }

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
            current = configCache.getNodeType(current)
                .map(NodeTypeConfig::parentNodeTypeId).orElse(null);
        }
        return false;
    }
}
