package com.plm.shared.hook;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Result passed to PostCommitHook after a successful commit.
 * continuationTxId is non-null only if a partial commit created a new open transaction.
 */
public record CommitResult(
    String          txId,
    String          userId,
    List<String>    committedNodeIds,
    String          continuationTxId,
    LocalDateTime   committedAt
) {}
