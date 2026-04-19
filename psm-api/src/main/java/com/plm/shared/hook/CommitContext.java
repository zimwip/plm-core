package com.plm.shared.hook;

import java.util.List;

/**
 * Context passed to PreCommitValidator and AtCommitHook.
 * Describes all node versions being committed in this transaction.
 */
public record CommitContext(
    String txId,
    String userId,
    String comment,
    List<NodeVersionRef> versions
) {
    /**
     * Lightweight reference to a node version within the commit context.
     */
    public record NodeVersionRef(
        String nodeId,
        String versionId,
        String nodeTypeId,
        String lifecycleStateId,
        String revision,
        int    iteration
    ) {}
}
