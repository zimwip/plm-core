package com.plm.search.model;

import java.util.Map;

/**
 * Runtime configuration context used to filter edge validity during BFS traversal.
 * Each field that is non-null activates the corresponding validity constraint.
 */
public record ConfigContext(
    String country,
    String profile,
    Long   asOfEpochMs,
    Map<String, String> extra
) {
    public static ConfigContext empty() {
        return new ConfigContext(null, null, null, Map.of());
    }
}
