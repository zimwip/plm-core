package com.plm.search.port;

import com.plm.search.model.DynamicField;
import com.plm.search.model.SearchRequest;
import com.plm.search.model.SearchResult;

import java.util.List;
import java.util.Map;
import java.util.Set;

public interface NodeStore {

    // ── Writes ───────────────────────────────────────────────

    void upsert(String id, String serviceCode, String itemCode,
                String type, String projectSpaceId,
                String sourceJson, List<DynamicField> fields) throws Exception;

    void delete(String id) throws Exception;

    void flush() throws Exception;

    // ── Reads ────────────────────────────────────────────────

    /**
     * Full-text + filter search within the provided scope IDs.
     * If scopeIds is empty, no results are returned.
     */
    SearchResult searchInScope(Set<String> scopeIds, SearchRequest req, int hop) throws Exception;

    /**
     * Global search — no scope restriction.
     */
    SearchResult searchGlobal(SearchRequest req) throws Exception;

    /**
     * Compute term facet counts for the given node IDs and dimensions.
     * Supports "*" as a special dim that auto-discovers enum-typed fields.
     * Returns: dim → (value → count)
     */
    Map<String, Map<String, Integer>> computeFacets(
        Set<String> ids, List<String> dims) throws Exception;

    /**
     * Compute [min, max] for all numeric fields found in the given node IDs.
     * Returns: fieldName → [min, max]
     */
    Map<String, double[]> computeRangeFacets(Set<String> ids) throws Exception;

    int count() throws Exception;
}
