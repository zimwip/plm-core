package com.plm.search.model;

import java.util.List;
import java.util.Map;

/**
 * Search request body.
 *
 * <p>Either {@code query} (global full-text) or {@code scopeRootId} (BFS traversal)
 * or both can be specified.
 */
public record SearchRequest(
    /** Full-text query string — supports Lucene syntax. */
    String query,

    /** Filter by exact type name. */
    String type,

    /** Filter by project space ID. */
    String projectSpaceId,

    /** Root node ID for BFS graph traversal. Null = no graph scope, global search only. */
    String scopeRootId,

    /** Max BFS hops. Defaults to server-configured max. */
    Integer maxHops,

    /** If true, only traverse structural edges during BFS. */
    boolean structuralOnly,

    /** Validity context for conditional edge traversal. */
    ConfigContext context,

    /** Exact-match attribute filters. Key = attribute name, value = filter value. */
    Map<String, String> filters,

    /**
     * Multi-value AND filters. Each value in the list must match (MUST clauses).
     * Supports special keys _type and _projectSpaceId; others map to dyn.*.kw fields.
     */
    Map<String, List<String>> filterTerms,

    /** Facet dimensions to compute. Empty list = no facets. */
    List<String> facetOn,

    /** Max hits to return per hop (for streaming) or total (for non-streaming). */
    int size
) {
    public SearchRequest {
        if (size <= 0) size = 50;
        if (facetOn == null) facetOn = List.of();
        if (filters == null) filters = Map.of();
        if (filterTerms == null) filterTerms = Map.of();
        if (context == null) context = ConfigContext.empty();
    }
}
