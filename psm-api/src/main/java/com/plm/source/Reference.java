package com.plm.source;

/**
 * One incoming reference returned by {@link SourceResolver#findReferencesTo}.
 *
 * Used to build cross-source Where-Used views. SELF returns one row per parent node;
 * other resolvers may return external references (e.g. an external system's
 * change-set referencing a node).
 */
public record Reference(
    String sourceCode,
    String type,
    String key,
    String displayLabel
) {}
