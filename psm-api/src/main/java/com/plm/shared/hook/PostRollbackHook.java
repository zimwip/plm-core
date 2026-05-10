package com.plm.shared.hook;

/**
 * Extension point called after a transaction has been rolled back and all
 * versions/links physically deleted. Exceptions are caught and logged — they
 * never affect the rollback outcome.
 *
 * Register via: transactionService.registerPostRollbackHook(hook)
 */
public interface PostRollbackHook {
    /** Unique name used as registration key. */
    String name();

    /** Called after rollback. Exceptions are swallowed (logged at WARN). */
    void afterRollback(RollbackContext ctx);
}
