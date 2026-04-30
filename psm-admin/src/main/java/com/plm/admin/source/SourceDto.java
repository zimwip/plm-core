package com.plm.admin.source;

public record SourceDto(
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
