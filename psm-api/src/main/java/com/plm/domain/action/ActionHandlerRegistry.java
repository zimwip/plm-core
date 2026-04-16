package com.plm.domain.action;

/**
 * Registry of all available {@link ActionHandler} beans, keyed by action code.
 *
 * Implementations are expected to validate at startup that every action_handler_ref
 * referenced in the database has a corresponding registered bean.
 */
public interface ActionHandlerRegistry {

    /**
     * Returns the handler for the given action code, or throws
     * {@link IllegalStateException} if no handler is registered.
     */
    ActionHandler getHandler(String actionCode);

    /** Returns true if a handler is registered for the given action code. */
    boolean hasHandler(String actionCode);
}
