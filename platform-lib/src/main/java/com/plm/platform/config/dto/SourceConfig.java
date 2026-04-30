package com.plm.platform.config.dto;

/**
 * A managed Source declares an external (or local) system that hosts link targets.
 * Each Source is bound to a resolver algorithm instance which knows how to look up
 * a target object given its (type, key) pair.
 *
 * <p>The built-in {@code SELF} source represents the local PLM node store and cannot
 * be edited from the UI ({@code builtin = true}).
 *
 * <p>{@code versioned} declares whether the source's objects carry a version axis
 * (SELF=true; immutable stores like dst=false). Used by admin validation to reject
 * link types declaring {@code VERSION_TO_VERSION} against a non-versioned source,
 * and by the frontend to constrain the link-creation dialog (no version picker
 * when the target source is immutable).
 */
public record SourceConfig(
    String id,
    String name,
    String description,
    String resolverInstanceId,
    String resolverAlgorithmCode,
    boolean builtin,
    boolean versioned,
    String color,
    String icon
) {}
