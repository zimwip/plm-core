package com.plm.source;

import java.util.Map;

/**
 * One row of the key-picker autocomplete result.
 *
 * @param key     the value that should be sent back as {@code targetKey}
 * @param label   human-readable rendering (often "{key} — {name}")
 * @param details optional structured info (state, type, ...)
 */
public record KeyHint(
    String key,
    String label,
    Map<String, Object> details
) {}
