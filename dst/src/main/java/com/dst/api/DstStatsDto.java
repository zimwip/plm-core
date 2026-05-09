package com.dst.api;

import java.util.List;

public record DstStatsDto(
    long totalFiles,
    long totalSizeBytes,
    String storageRoot,
    String maxFileSize,
    List<ProjectSpaceStat> perProjectSpace,
    List<ContentTypeStat> perContentType
) {
    public record ProjectSpaceStat(String projectSpaceId, long fileCount, long totalSizeBytes) {}
    public record ContentTypeStat(String contentType, long fileCount) {}
}
