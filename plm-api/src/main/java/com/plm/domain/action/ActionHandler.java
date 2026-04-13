package com.plm.domain.action;

import java.util.Map;

/**
 * Contract for all action handlers — built-in and custom.
 *
 * Spring beans implementing this interface are auto-collected by ActionDispatcher.
 * Each bean must return a unique, stable action_code that matches its
 * node_action.action_code value in the database.
 */
public interface ActionHandler {

    /** Stable action code this handler serves (e.g. "SIGN", "CHECKOUT"). */
    String actionCode();

    /**
     * Execute the action.
     *
     * @param context  resolved execution context (nodeId, userId, txId, …)
     * @param params   validated user-supplied parameters
     * @return         result payload included in the HTTP response
     */
    ActionResult execute(ActionContext context, Map<String, String> params);
}
