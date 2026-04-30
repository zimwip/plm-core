package com.plm.node.link.internal;
import com.plm.node.NodeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Graph-level validation for the PLM node structure.
 *
 * Currently provides cycle detection for the node link graph.
 * Extracted from NodeService to keep structural-graph concerns separate from node CRUD.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GraphValidationService {

    private final DSLContext dsl;

    /**
     * BFS from targetNodeId through the existing SELF-link graph. Only SELF links
     * participate in cycle detection — links to other sources (files, external systems)
     * never create node-graph cycles.
     *
     * If sourceNodeId is reachable from targetNodeId via the SELF link graph,
     * adding source→target would create a cycle.
     *
     * @throws NodeService.CircularReferenceException if a cycle would be created
     */
    public void assertNoCycle(String sourceNodeId, String targetNodeId) {
        if (sourceNodeId.equals(targetNodeId)) {
            throw new NodeService.CircularReferenceException(sourceNodeId, targetNodeId);
        }
        Set<String> visited = new java.util.HashSet<>();
        java.util.Queue<String> queue = new java.util.ArrayDeque<>();
        queue.add(targetNodeId);
        visited.add(targetNodeId);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            dsl
                .fetch(
                    """
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
                    """,
                    current
                )
                .forEach(r -> {
                    String child = r.get("target_id", String.class);
                    if (child == null) return;
                    if (child.equals(sourceNodeId)) {
                        throw new NodeService.CircularReferenceException(
                            sourceNodeId,
                            targetNodeId
                        );
                    }
                    if (visited.add(child)) {
                        queue.add(child);
                    }
                });
        }
    }
}
