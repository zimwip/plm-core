package com.plm.node.source;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.source.KeyHint;
import com.plm.source.LinkConstraint;
import com.plm.source.Reference;
import com.plm.source.ResolvedTarget;
import com.plm.source.SourceResolver;
import com.plm.source.SourceResolverContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Built-in resolver for the SELF source: link targets are nodes inside this PLM instance.
 *
 * Key format:
 * <ul>
 *   <li>{@code logical_id} — V2M, master link, target is the latest committed version</li>
 *   <li>{@code logical_id@versionNumber} — V2V, target is pinned to that exact version</li>
 * </ul>
 *
 * Validation reproduces the legacy node-type-pair check (parent-chain compatible)
 * and runs cycle detection through the link graph.
 */
@Slf4j
@AlgorithmBean(code = "self_node_resolver", name = "SELF Node Resolver",
    description = "Resolves links targeting nodes inside this PLM instance (logical_id[@version])")
@RequiredArgsConstructor
public class SelfNodeResolver implements SourceResolver {

    private final DSLContext dsl;
    private final ConfigCache configCache;

    @Override
    public String code() { return "self_node_resolver"; }

    @Override
    public boolean isVersioned() { return true; }

    @Override
    public List<String> supportedTypes() {
        return configCache.getAllNodeTypes().stream().map(NodeTypeConfig::id).toList();
    }

    @Override
    public ResolvedTarget resolve(SourceResolverContext ctx) {
        ParsedKey p = parseKey(ctx.key());

        Record node = dsl.fetchOne(
            "SELECT id, node_type_id, logical_id FROM node WHERE logical_id = ? AND node_type_id = ?",
            p.logicalId, ctx.type());
        if (node == null) {
            // Fallback: when a node-type chain is involved, the link_type's targetType may be
            // an ancestor — accept any node whose type chain resolves through that ancestor.
            node = dsl.fetchOne(
                "SELECT id, node_type_id, logical_id FROM node WHERE logical_id = ?", p.logicalId);
            if (node == null) {
                throw new IllegalArgumentException("SELF: no node with logical_id=" + p.logicalId);
            }
            String actualType = node.get("node_type_id", String.class);
            if (!isTypeOrDescendant(actualType, ctx.type())) {
                throw new IllegalArgumentException("SELF: node " + p.logicalId
                    + " is not a " + ctx.type() + " (was " + actualType + ")");
            }
        }
        String nodeId = node.get("id", String.class);
        String actualType = node.get("node_type_id", String.class);

        Map<String, Object> details = new LinkedHashMap<>();
        details.put("nodeId", nodeId);
        details.put("nodeType", actualType);
        details.put("logicalId", p.logicalId);

        if (p.versionNumber == null) {
            // V2M — pinnedKey null tells the caller the link wasn't pinned at write time.
            return new ResolvedTarget(p.logicalId, actualType, null, details);
        }

        Record version = dsl.fetchOne("""
            SELECT nv.id, nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node_version nv
            JOIN plm_transaction pt ON pt.id = nv.tx_id
            WHERE nv.node_id = ? AND nv.version_number = ? AND pt.status = 'COMMITTED'
            """, nodeId, p.versionNumber);
        if (version == null) {
            throw new IllegalArgumentException("SELF: no committed version " + p.versionNumber
                + " for node " + p.logicalId);
        }
        details.put("versionId", version.get("id", String.class));
        details.put("revision", version.get("revision", String.class));
        details.put("iteration", version.get("iteration", Integer.class));
        details.put("lifecycleStateId", version.get("lifecycle_state_id", String.class));
        return new ResolvedTarget(p.logicalId + "@" + p.versionNumber, actualType,
            p.logicalId + "@" + p.versionNumber, details);
    }

    @Override
    public List<GuardViolation> validate(SourceResolverContext ctx, LinkConstraint constraint) {
        List<GuardViolation> violations = new ArrayList<>();
        ParsedKey p = parseKey(ctx.key());

        // Type check — target must match the link_type's allowed type (or a descendant).
        String actualType = dsl.select().from("node")
            .where("logical_id = ?", p.logicalId)
            .fetchOne("node_type_id", String.class);
        if (actualType == null) {
            violations.add(new GuardViolation("SELF_TARGET_NOT_FOUND",
                "Target node not found: " + p.logicalId, GuardEffect.BLOCK));
            return violations;
        }
        if (constraint.allowedType() != null
                && !isTypeOrDescendant(actualType, constraint.allowedType())
                && !hasAncestorOfType(p.logicalId, constraint.allowedType())) {
            violations.add(new GuardViolation("SELF_WRONG_TYPE",
                "Target " + p.logicalId + " is " + actualType + ", expected " + constraint.allowedType(),
                GuardEffect.BLOCK));
        }

        // Cycle check: only V2M participates in structural cascade. V2V links are pinned
        // and therefore safe by construction.
        if (p.versionNumber == null) {
            String targetNodeId = dsl.select().from("node")
                .where("logical_id = ?", p.logicalId)
                .fetchOne("id", String.class);
            if (ctx.sourceNodeId() != null && targetNodeId != null) {
                if (ctx.sourceNodeId().equals(targetNodeId)) {
                    violations.add(new GuardViolation("SELF_SELF_LINK",
                        "Cannot link a node to itself", GuardEffect.BLOCK));
                } else if (createsCycle(ctx.sourceNodeId(), targetNodeId)) {
                    violations.add(new GuardViolation("SELF_CYCLE",
                        "Adding this link would create a cycle in the structural graph",
                        GuardEffect.BLOCK));
                }
            }
        }

        return violations;
    }

    @Override
    public List<KeyHint> suggestKeys(String type, String query, int limit) {
        int max = (limit <= 0 || limit > 100) ? 25 : limit;
        String like = (query == null ? "" : query.trim()) + "%";

        List<String> typeIds = (type != null && !type.isBlank())
            ? collectTypeAndDescendants(type)
            : null;

        String typeFilter = typeIds != null
            ? "AND n.node_type_id IN (" + "?,".repeat(typeIds.size()).replaceAll(",$", "") + ")\n"
            : "";
        String sql = """
            SELECT n.logical_id, n.node_type_id,
                   nv.revision, nv.iteration, nv.lifecycle_state_id
            FROM node n
            LEFT JOIN node_version nv ON nv.node_id = n.id
                AND nv.version_number = (
                    SELECT MAX(nv2.version_number)
                    FROM node_version nv2
                    JOIN plm_transaction pt ON pt.id = nv2.tx_id
                    WHERE nv2.node_id = n.id AND pt.status = 'COMMITTED'
                )
            WHERE n.logical_id LIKE ?
            """ + typeFilter + """
            ORDER BY n.logical_id
            LIMIT ?
            """;

        List<Object> params = new ArrayList<>();
        params.add(like);
        if (typeIds != null) params.addAll(typeIds);
        params.add(max);
        var rows = dsl.fetch(sql, params.toArray());

        List<KeyHint> hints = new ArrayList<>(rows.size());
        for (Record r : rows) {
            String lid      = r.get("logical_id",        String.class);
            String nodeType = r.get("node_type_id",      String.class);
            String revision = r.get("revision",          String.class);
            Integer iter    = r.get("iteration",         Integer.class);
            String stateId  = r.get("lifecycle_state_id", String.class);

            String typeName = configCache.getNodeType(nodeType)
                .map(NodeTypeConfig::name).orElse(nodeType);

            String label = lid + " — " + typeName;
            if (revision != null) {
                label += " " + (iter != null && iter > 0 ? revision + "." + iter : revision);
            }
            if (stateId != null) label += " [" + stateId + "]";

            Map<String, Object> d = new LinkedHashMap<>();
            d.put("nodeType", nodeType);
            if (revision != null) d.put("revision", revision);
            if (iter != null)     d.put("iteration", iter);
            if (stateId != null)  d.put("lifecycleStateId", stateId);
            hints.add(new KeyHint(lid, label, d));
        }
        return hints;
    }

    @Override
    public List<Reference> findReferencesTo(String type, String key) {
        ParsedKey p = parseKey(key);
        // Match V2M (target_key == logical_id) and V2V (target_key starts with logical_id@).
        var rows = dsl.fetch("""
            SELECT n.logical_id AS source_logical_id, n.node_type_id, nl.link_type_id, nl.target_key
            FROM node_version_link nl
            JOIN node_version nv ON nv.id = nl.source_node_version_id
            JOIN node n          ON n.id  = nv.node_id
            WHERE nl.target_source_id = 'SELF'
              AND nl.target_type      = ?
              AND (nl.target_key = ? OR nl.target_key LIKE ?)
            """, type, p.logicalId, p.logicalId + "@%");
        List<Reference> refs = new ArrayList<>(rows.size());
        for (Record r : rows) {
            String lid = r.get("source_logical_id", String.class);
            refs.add(new Reference("SELF", r.get("node_type_id", String.class), lid, lid));
        }
        return refs;
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private boolean isTypeOrDescendant(String typeId, String expected) {
        String current = typeId;
        while (current != null) {
            if (expected.equals(current)) return true;
            current = configCache.getNodeType(current).map(NodeTypeConfig::parentNodeTypeId).orElse(null);
        }
        return false;
    }

    private List<String> collectTypeAndDescendants(String typeId) {
        List<String> result = new ArrayList<>();
        result.add(typeId);
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            if (typeId.equals(nt.parentNodeTypeId())) {
                result.addAll(collectTypeAndDescendants(nt.id()));
            }
        }
        return result;
    }

    /**
     * BFS upward through the committed SELF-link parent hierarchy of {@code logicalId}.
     * Returns true if any ancestor node has a type that is {@code expectedType} or a
     * descendant of it. This allows linking to a part that lives inside an assembly
     * when the link type declares nt-assembly as the allowed target type.
     */
    private boolean hasAncestorOfType(String logicalId, String expectedType) {
        java.util.Set<String> visited = new java.util.HashSet<>();
        java.util.Deque<String> queue = new java.util.ArrayDeque<>();
        queue.add(logicalId);
        visited.add(logicalId);
        while (!queue.isEmpty()) {
            String current = queue.poll();
            // Find committed nodes that have `current` as a SELF child target.
            var parents = dsl.fetch("""
                SELECT DISTINCT n.logical_id AS parent_logical_id, n.node_type_id AS parent_type
                FROM node_version_link nl
                JOIN node_version nv ON nv.id = nl.source_node_version_id
                JOIN plm_transaction pt ON pt.id = nv.tx_id
                JOIN node n ON n.id = nv.node_id
                WHERE pt.status = 'COMMITTED'
                  AND nl.target_source_id = 'SELF'
                  AND (nl.target_key = ? OR nl.target_key LIKE ?)
                """, current, current + "@%");
            for (Record r : parents) {
                String parentType    = r.get("parent_type", String.class);
                String parentLogical = r.get("parent_logical_id", String.class);
                if (isTypeOrDescendant(parentType, expectedType)) return true;
                if (parentLogical != null && visited.add(parentLogical)) {
                    queue.add(parentLogical);
                }
            }
        }
        return false;
    }

    private boolean createsCycle(String sourceNodeId, String targetNodeId) {
        // BFS from targetNodeId through the SELF-link graph; if sourceNodeId is reachable
        // a new source→target link would close a cycle.
        java.util.Set<String> visited = new java.util.HashSet<>();
        java.util.Deque<String> queue = new java.util.ArrayDeque<>();
        queue.add(targetNodeId);
        visited.add(targetNodeId);
        while (!queue.isEmpty()) {
            String current = queue.poll();
            // SELF children of `current`: target_key starts with logical_id of `current`
            String currentLogicalId = dsl.select().from("node").where("id = ?", current)
                .fetchOne("logical_id", String.class);
            if (currentLogicalId == null) continue;
            var children = dsl.fetch("""
                SELECT DISTINCT n2.id AS target_id
                FROM node_version_link nl
                JOIN node_version nv ON nv.id = nl.source_node_version_id
                JOIN node n2 ON n2.logical_id = CASE
                    WHEN POSITION('@' IN nl.target_key) > 0
                        THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1)
                    ELSE nl.target_key
                  END
                  AND n2.node_type_id = nl.target_type
                WHERE nv.node_id = ?
                  AND nl.target_source_id = 'SELF'
                """, current);
            for (Record c : children) {
                String childId = c.get("target_id", String.class);
                if (childId == null) continue;
                if (childId.equals(sourceNodeId)) return true;
                if (visited.add(childId)) queue.add(childId);
            }
        }
        return false;
    }

    private static ParsedKey parseKey(String key) {
        if (key == null) throw new IllegalArgumentException("SELF: key is required");
        int at = key.indexOf('@');
        if (at < 0) return new ParsedKey(key, null);
        if (at == 0 || at == key.length() - 1) {
            throw new IllegalArgumentException("SELF: malformed key: " + key);
        }
        String logical = key.substring(0, at);
        String versionStr = key.substring(at + 1);
        try {
            return new ParsedKey(logical, Integer.parseInt(versionStr));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("SELF: version must be an integer in key " + key);
        }
    }

    private record ParsedKey(String logicalId, Integer versionNumber) {}
}
