package com.plm.domain.hook;

/**
 * Extension point called after validation passes but before the commit is persisted.
 * Throwing from onCommit aborts the entire commit (transaction rolls back).
 *
 * Register via: transactionService.registerAtCommitHook(hook)
 */
public interface AtCommitHook {
    /** Unique name used as registration key. */
    String name();

    /** Called in commit order. Throw to abort the commit. */
    void onCommit(CommitContext ctx);
}
