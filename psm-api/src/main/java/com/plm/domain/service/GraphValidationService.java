package com.plm.domain.service;

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
     * BFS from targetNodeId through the existing link graph.
     * If sourceNodeId is reachable from targetNodeId, adding source→target would create a cycle.
     *
     * Queries ALL link rows across all versions (OPEN + COMMITTED) to be conservative:
     * even a link that lives on an uncommitted version participates in the structure.
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
                    SELECT DISTINCT nl.target_node_id
                    FROM node_version_link nl
                    JOIN node_version nv ON nv.id = nl.source_node_version_id
                    WHERE nv.node_id = ?
                    """,
                    current
                )
                .forEach(r -> {
                    String child = r.get("target_node_id", String.class);
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
