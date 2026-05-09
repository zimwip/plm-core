package com.cad.algorithm;

public record ImportJobContext(
        String jobId,
        String projectSpaceId,
        String userId,
        String importContextCode,
        String psmTxId,
        String rootNodeId,
        boolean splitMode
) {}
