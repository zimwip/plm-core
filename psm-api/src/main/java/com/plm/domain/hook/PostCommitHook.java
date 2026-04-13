package com.plm.domain.hook;

/**
 * Extension point called after a transaction has been successfully committed.
 * Exceptions are caught and logged — they never cause the commit to fail.
 *
 * Register via: transactionService.registerPostCommitHook(hook)
 */
public interface PostCommitHook {
    /** Unique name used as registration key. */
    String name();

    /** Called after commit. Exceptions are swallowed (logged at WARN). */
    void afterCommit(CommitResult result);
}
