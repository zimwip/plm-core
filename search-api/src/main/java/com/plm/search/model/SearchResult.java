package com.plm.search.model;

import java.util.List;
import java.util.Map;

public record SearchResult(
    List<Hit> hits,
    Map<String, Map<String, Integer>> facets,
    int totalHits,
    int hopLevel
) {
    public record Hit(
        String id,
        String serviceCode,
        String itemCode,
        String type,
        String projectSpaceId,
        String sourceJson,
        float  score,
        int    hopLevel
    ) {}

    public static SearchResult empty() {
        return new SearchResult(List.of(), Map.of(), 0, 0);
    }
}
