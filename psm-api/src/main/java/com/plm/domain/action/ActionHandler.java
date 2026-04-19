package com.plm.domain.action;

import java.util.Map;

/**
 * Contract for all action handlers — built-in and custom.
 *
 * Spring beans implementing this interface are auto-collected by ActionDispatcher.
 * Each bean must return a unique, stable action_code that matches its
 * action.action_code value in the database.
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

    /**
     * Returns optional display hints for the UI (color, icon, label override, etc.).
     * Called by ActionService when building the action list for a node.
     * Default: empty map (no overrides).
     *
     * @param nodeId        target node
     * @param nodeTypeId    node's type
     * @param transitionId  lifecycle transition (null for NODE-scope actions)
     * @return              map of hint keys to values (e.g. "displayColor" → "#4ade80")
     */
    default Map<String, Object> resolveDisplayHints(String nodeId, String nodeTypeId, String transitionId) {
        return Map.of();
    }
}
