package com.plm.node.link.internal;
import com.plm.node.version.internal.FingerPrintService;
import com.plm.node.version.internal.VersionService;
import com.plm.node.transaction.internal.LockService;
import com.plm.source.LinkConstraint;
import com.plm.source.ResolvedTarget;
import com.plm.source.SourceResolver;
import com.plm.source.SourceResolverContext;
import com.plm.source.SourceResolverRegistry;

import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.platform.config.dto.SourceConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.shared.model.Enums.ChangeType;
import com.plm.shared.model.Enums.VersionStrategy;
import com.plm.platform.action.PlmAction;
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
 * Manages node links: creation, deletion, update, and read queries.
 *
 * Links are triplets {@code (target_source_id, target_type, target_key)} owned by a
 * source {@code node_version}. Resolver-specific concerns (key parsing, target lookup,
 * type compatibility, cycle detection) live in the {@link SourceResolver} bound to
 * each Source. Generic concerns (cardinality, link_logical_id rules, fingerprint)
 * stay here.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LinkService {

    private final DSLContext              dsl;
    private final ConfigCache             configCache;
    private final LockService             lockService;
    private final VersionService          versionService;
    private final FingerPrintService      fingerPrintService;
    private final SourceResolverRegistry  sourceResolverRegistry;
    private final SecurityContextPort     secCtx;

    // ================================================================
    // CREATE LINK
    // ================================================================

    @PlmAction("create_link")
    @Transactional
    public String createLink(
        String linkTypeId,
        String nodeId,
        String targetSourceCode,
        String targetType,
        String targetKey,
        String userId,
        String txId,
        String linkLogicalId
    ) {
        LinkTypeConfig linkType = configCache.getLinkType(linkTypeId)
            .orElseThrow(() -> new IllegalArgumentException("LinkType not found: " + linkTypeId));

        String resolvedSourceCode = (targetSourceCode == null || targetSourceCode.isBlank())
            ? linkType.targetSourceId() : targetSourceCode;
        if (resolvedSourceCode == null || resolvedSourceCode.isBlank()) resolvedSourceCode = "SELF";
        final String sourceCode = resolvedSourceCode;
        String resolvedType = (targetType == null || targetType.isBlank())
            ? linkType.targetType() : targetType;
        if (resolvedType == null) {
            throw new IllegalArgumentException("targetType is required (none on link_type or request)");
        }
        final String type = resolvedType;
        if (linkType.targetSourceId() != null && !linkType.targetSourceId().equals(sourceCode)) {
            throw new IllegalArgumentException("Link type " + linkTypeId
                + " targets source " + linkType.targetSourceId() + ", got " + sourceCode);
        }
        if (linkType.targetType() != null && !linkType.targetType().equals(type)) {
            throw new IllegalArgumentException("Link type " + linkTypeId
                + " targets type " + linkType.targetType() + ", got " + type);
        }
        if (targetKey == null || targetKey.isBlank()) {
            throw new IllegalArgumentException("targetKey is required");
        }
        configCache.getSource(sourceCode)
            .orElseThrow(() -> new IllegalArgumentException("Unknown source: " + sourceCode));

        // ── link_logical_id rules (generic, owner-side) ─────────────
        String pattern = linkType.linkLogicalIdPattern();
        String label   = linkType.linkLogicalIdLabel();
        if (label == null || label.isBlank()) label = "Link ID";
        if (linkLogicalId == null || linkLogicalId.isBlank()) {
            throw new IllegalArgumentException("'" + label + "' is required");
        }
        if (pattern != null && !pattern.isBlank() && !linkLogicalId.matches(pattern)) {
            throw new IllegalArgumentException(
                "'" + label + "' value '" + linkLogicalId + "' does not match pattern: " + pattern);
        }

        // ── cardinality (generic) ───────────────────────────────────
        Integer maxCard = linkType.maxCardinality();
        if (maxCard != null) {
            int existing = dsl.fetchCount(
                dsl.selectOne()
                    .from("node_version_link nl")
                    .join("node_version nv_src").on("nv_src.id = nl.source_node_version_id")
                    .where("nl.link_type_id = ?", linkTypeId)
                    .and("nv_src.node_id = ?", nodeId)
            );
            if (existing >= maxCard) throw new IllegalStateException(
                "Max cardinality " + maxCard + " reached");
        }

        // ── owner-side: ensure open version + lock ──────────────────
        String sourceVersionId = findOpenVersionInTx(nodeId, txId);
        if (sourceVersionId == null) {
            sourceVersionId = versionService.createVersion(
                nodeId, userId, txId,
                ChangeType.CONTENT, VersionStrategy.ITERATE,
                null, Map.of(), "Link creation"
            );
        }
        lockService.tryLock(nodeId, userId);

        // ── resolver-side validation (target shape, cycle, type pair) ─
        SourceResolver resolver = sourceResolverRegistry.getResolverFor(sourceCode);
        SourceResolverContext rctx = new SourceResolverContext(
            linkTypeId, type, targetKey, sourceVersionId, nodeId);
        LinkConstraint constraint = new LinkConstraint(
            type, linkType.maxCardinality(), linkType.linkPolicy(), linkType.linkLogicalIdPattern());
        List<GuardViolation> violations = resolver.validate(rctx, constraint);
        if (violations != null) {
            for (GuardViolation v : violations) {
                if (v.effect() == GuardEffect.BLOCK) {
                    throw new IllegalArgumentException(v.guardCode() + ": " + v.message());
                }
            }
        }

        // ── link_logical_id uniqueness on this source version ──────
        int dup = dsl.fetchCount(
            dsl.selectOne()
                .from("node_version_link")
                .where("source_node_version_id = ?", sourceVersionId)
                .and("link_logical_id = ?", linkLogicalId)
        );
        if (dup > 0) throw new IllegalArgumentException(
            "'" + label + "' value '" + linkLogicalId + "' is already used by another link on this version");

        String linkId = UUID.randomUUID().toString();
        dsl.execute(
            """
            INSERT INTO node_version_link
              (ID, LINK_TYPE_ID, SOURCE_NODE_VERSION_ID, TARGET_SOURCE_ID, TARGET_TYPE, TARGET_KEY,
               LINK_LOGICAL_ID, CREATED_AT, CREATED_BY)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            linkId, linkTypeId, sourceVersionId, sourceCode, type, targetKey,
            linkLogicalId, LocalDateTime.now(), userId
        );

        String fp = fingerPrintService.compute(nodeId, sourceVersionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, sourceVersionId);

        log.info("Link created: {}→{}/{}/{} type={} logicalId={}",
            nodeId, sourceCode, type, targetKey, linkTypeId, linkLogicalId);
        return linkId;
    }

    // ================================================================
    // DELETE LINK
    // ================================================================

    @PlmAction("delete_link")
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

    @PlmAction("update_link")
    @Transactional
    public void updateLink(
        String linkId,
        String newTargetSourceCode,
        String newTargetType,
        String newTargetKey,
        String newLogicalId,
        String userId,
        String txId
    ) {
        Record link = dsl.select().from("node_version_link").where("id = ?", linkId).fetchOne();
        if (link == null) throw new IllegalArgumentException("Link not found: " + linkId);

        String sourceVersionId = link.get("source_node_version_id", String.class);
        String linkTypeId      = link.get("link_type_id", String.class);
        String sourceNodeId = dsl.select().from("node_version")
            .where("id = ?", sourceVersionId)
            .fetchOne("node_id", String.class);
        if (sourceNodeId == null) throw new IllegalArgumentException("Source node not found for link: " + linkId);

        lockService.tryLock(sourceNodeId, userId);

        boolean targetChanged = (newTargetSourceCode != null && !newTargetSourceCode.isBlank())
            || (newTargetType   != null && !newTargetType.isBlank())
            || (newTargetKey    != null && !newTargetKey.isBlank());

        if (targetChanged) {
            LinkTypeConfig linkType = configCache.getLinkType(linkTypeId)
                .orElseThrow(() -> new IllegalArgumentException("LinkType not found: " + linkTypeId));
            String sourceCode = (newTargetSourceCode != null && !newTargetSourceCode.isBlank())
                ? newTargetSourceCode : link.get("target_source_id", String.class);
            String type = (newTargetType != null && !newTargetType.isBlank())
                ? newTargetType : link.get("target_type", String.class);
            String key  = (newTargetKey != null && !newTargetKey.isBlank())
                ? newTargetKey : link.get("target_key", String.class);
            if (linkType.targetSourceId() != null && !linkType.targetSourceId().equals(sourceCode)) {
                throw new IllegalArgumentException("Link type " + linkTypeId
                    + " targets source " + linkType.targetSourceId() + ", got " + sourceCode);
            }
            if (linkType.targetType() != null && !linkType.targetType().equals(type)) {
                throw new IllegalArgumentException("Link type " + linkTypeId
                    + " targets type " + linkType.targetType() + ", got " + type);
            }
            SourceResolver resolver = sourceResolverRegistry.getResolverFor(sourceCode);
            SourceResolverContext rctx = new SourceResolverContext(
                linkTypeId, type, key, sourceVersionId, sourceNodeId);
            LinkConstraint constraint = new LinkConstraint(
                type, linkType.maxCardinality(), linkType.linkPolicy(), linkType.linkLogicalIdPattern());
            List<GuardViolation> violations = resolver.validate(rctx, constraint);
            if (violations != null) {
                for (GuardViolation v : violations) {
                    if (v.effect() == GuardEffect.BLOCK) {
                        throw new IllegalArgumentException(v.guardCode() + ": " + v.message());
                    }
                }
            }
            dsl.execute(
                "UPDATE node_version_link SET target_source_id = ?, target_type = ?, target_key = ? WHERE id = ?",
                sourceCode, type, key, linkId
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
                "Link ID '" + newLogicalId + "' is already used by another link on this version");
            dsl.execute("UPDATE node_version_link SET link_logical_id = ? WHERE id = ?", newLogicalId, linkId);
        }

        String fp = fingerPrintService.compute(sourceNodeId, sourceVersionId);
        dsl.execute("UPDATE node_version SET fingerprint = ? WHERE id = ?", fp, sourceVersionId);

        log.info("Link {} updated by {}", linkId, userId);
    }

    // ================================================================
    // READ — child and parent links
    // ================================================================

    /**
     * Outgoing links from a node (BOM / children).
     * SELF-source links are JOINed for full target detail; non-SELF rows are
     * routed through their resolver.
     */
    public List<Map<String, Object>> getChildLinks(String nodeId) {
        var ctx = secCtx.currentUser();
        String currentUserId = ctx.getUserId();
        boolean isAdmin = ctx.isAdmin();
        String isAdminStr = String.valueOf(isAdmin);

        // SELF fast-path: full SQL JOIN to node + node_version
        List<Map<String, Object>> self = dsl.fetch(
            """
            SELECT nl.id AS link_id, nl.link_type_id,
                   nl.link_logical_id, nl.target_source_id, nl.target_type, nl.target_key,
                   n.id AS target_node_id, n.node_type_id AS target_node_type_id,
                   n.logical_id AS target_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id,
                   (SELECT COUNT(*) FROM node_version_link nvl_c
                    WHERE nvl_c.source_node_version_id = nv.id) AS target_children_count
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.logical_id = CASE
                    WHEN POSITION('@' IN nl.target_key) > 0
                        THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1)
                    ELSE nl.target_key
                  END
                  AND n.node_type_id = nl.target_type
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nv_src.node_id = ?
              AND nl.target_source_id = 'SELF'
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
            m.put("targetSourceCode",  r.get("target_source_id", String.class));
            m.put("targetType",        r.get("target_type", String.class));
            m.put("targetKey",         r.get("target_key", String.class));
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

        // Non-SELF rows: route each through its resolver.
        List<Map<String, Object>> external = dsl.fetch("""
            SELECT nl.id AS link_id, nl.link_type_id,
                   nl.link_logical_id, nl.target_source_id, nl.target_type, nl.target_key
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            WHERE nv_src.node_id = ?
              AND nl.target_source_id <> 'SELF'
              AND (pt_src.status = 'COMMITTED'
                   OR (pt_src.status = 'OPEN' AND (pt_src.owner_id = ? OR ? = 'true')))
            ORDER BY nl.target_source_id, nl.target_key
            """, nodeId, currentUserId, isAdminStr).stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("linkId", r.get("link_id", String.class));
            String ltId = r.get("link_type_id", String.class);
            var lt = configCache.getLinkType(ltId);
            m.put("linkTypeName", lt.map(LinkTypeConfig::name).orElse(ltId));
            m.put("linkPolicy",   lt.map(LinkTypeConfig::linkPolicy).orElse(""));
            m.put("linkLogicalId", Objects.toString(r.get("link_logical_id", String.class), ""));
            String sourceCode = r.get("target_source_id", String.class);
            String type = r.get("target_type", String.class);
            String key  = r.get("target_key", String.class);
            m.put("targetSourceCode", sourceCode);
            m.put("targetType", type);
            m.put("targetKey", key);
            m.put("sourceName", configCache.getSource(sourceCode).map(SourceConfig::name).orElse(sourceCode));
            try {
                ResolvedTarget rt = sourceResolverRegistry.getResolverFor(sourceCode)
                    .resolve(new SourceResolverContext(ltId, type, key, null, nodeId));
                m.put("displayKey", rt.displayId());
                m.put("targetDetails", rt.details());
            } catch (RuntimeException e) {
                m.put("displayKey", key);
                m.put("resolverError", e.getMessage());
            }
            return m;
        }).toList();

        if (external.isEmpty()) return self;
        java.util.List<Map<String, Object>> all = new java.util.ArrayList<>(self.size() + external.size());
        all.addAll(self);
        all.addAll(external);
        return all;
    }

    /**
     * Incoming links to a node (Where Used / parents).
     * SELF parents come from the SQL fast-path; cross-source references are
     * collected by querying each non-SELF resolver's {@code findReferencesTo}.
     */
    public List<Map<String, Object>> getParentLinks(String nodeId) {
        var ctx = secCtx.currentUser();
        String currentUserId = ctx.getUserId();
        boolean isAdmin = ctx.isAdmin();
        String isAdminStr = String.valueOf(isAdmin);

        // Look up the target node's type + logical_id to filter the SELF reverse query.
        Record self = dsl.select().from("node").where("id = ?", nodeId).fetchOne();
        if (self == null) return List.of();
        String targetType = self.get("node_type_id", String.class);
        String targetLogicalId = self.get("logical_id", String.class);

        return dsl.fetch(
            """
            SELECT nl.id AS link_id, nl.link_type_id,
                   nl.link_logical_id, nl.target_key,
                   n.id AS source_node_id, n.node_type_id AS source_node_type_id,
                   n.logical_id AS source_logical_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN plm_transaction pt_src ON pt_src.id = nv_src.tx_id
            JOIN node n              ON n.id      = nv_src.node_id
            JOIN node_version nv     ON nv.node_id = n.id
            JOIN plm_transaction pt  ON pt.id     = nv.tx_id
            WHERE nl.target_source_id = 'SELF'
              AND nl.target_type = ?
              AND (nl.target_key = ? OR nl.target_key LIKE ?)
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
            targetType, targetLogicalId, targetLogicalId + "@%",
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
}
