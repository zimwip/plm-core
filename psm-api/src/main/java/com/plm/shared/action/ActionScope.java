package com.plm.shared.action;

import java.util.List;
import java.util.Map;

/**
 * Defines the shape and resolution logic for an action scope.
 *
 * Each scope describes the ordered path-segment IDs it expects
 * and knows how to build an {@link ActionContext} from them.
 *
 * Implementations are Spring beans discovered via {@code List<ActionScope>}
 * injection — any module can register its own scope without import coupling.
 */
public interface ActionScope {

    /** Unique scope code matching {@code action.scope} column (e.g. "NODE", "TX"). */
    String code();

    /** Ordered list of expected path-segment IDs for this scope. */
    List<ScopeSegment> segments();

    /**
     * Builds an {@link ActionContext} from the raw path IDs.
     *
     * @param actionId   the {@code action.id} being executed
     * @param actionCode the {@code action.action_code}
     * @param userId     the user triggering the action
     * @param pathIds    positional IDs extracted from the URL path
     * @param params     validated user-supplied parameters
     * @return a fully-populated ActionContext for this scope
     * @throws IllegalArgumentException if required IDs are missing
     */
    ActionContext resolve(String actionId, String actionCode, String userId,
                          List<String> pathIds, Map<String, String> params);
}
