package com.plm.search.port;

import com.plm.search.model.ConfigContext;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface EdgeStore {

    // ── Writes ───────────────────────────────────────────────

    void upsert(String srcId, String relType, String dstId,
                boolean structural, Map<String, Object> validity) throws Exception;

    void delete(String srcId, String relType, String dstId) throws Exception;

    void deleteForNode(String nodeId) throws Exception;

    void flush() throws Exception;

    // ── Traversal ────────────────────────────────────────────

    /**
     * Returns destination node IDs reachable from the given frontier in one hop.
     * Applies validity context filtering and optionally restricts to structural edges.
     */
    Set<String> resolveHop(Set<String> frontier, ConfigContext ctx,
                           boolean structuralOnly) throws Exception;

    int count() throws Exception;
}
