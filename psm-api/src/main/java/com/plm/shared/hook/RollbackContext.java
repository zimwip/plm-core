package com.plm.shared.hook;

import java.util.List;

/**
 * Context passed to PostRollbackHook after a transaction has been rolled back.
 * Links are collected before the deletion cascade so hooks can act on them.
 */
public record RollbackContext(
    String txId,
    String userId,
    List<RolledBackLink> links
) {
    public record RolledBackLink(
        String linkId,
        String linkTypeId,
        String sourceNodeId,
        String sourceVersionId,
        String targetSourceCode,
        String targetType,
        String targetKey
    ) {}
}
