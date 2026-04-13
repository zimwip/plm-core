package com.plm.domain.hook;

import java.util.List;

/**
 * Extension point called before a transaction commit is persisted.
 * All violations across all validators are collected before throwing.
 * A non-empty violation list aborts the commit.
 *
 * Register via: transactionService.registerPreCommitValidator(validator)
 */
public interface PreCommitValidator {
    /** Unique name used as registration key. */
    String name();

    /** Return violations; return empty list to pass. */
    List<CommitViolation> validate(CommitContext ctx);
}
