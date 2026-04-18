package com.plm.domain.action;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Central action executor.
 *
 * Responsibilities:
 *  1. Resolve the {@code action} row from its code.
 *  2. Resolve the node's type for context (overrides, handler lookup).
 *  3. Validate parameters via ActionParameterValidator.
 *  4. Route to the correct ActionHandler via ActionHandlerRegistry (or Spring bean for CUSTOM).
 *
 * Permission enforcement happens upstream (service-layer {@code @PlmAction} AOP).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionDispatcher {

    private final DSLContext               dsl;
    private final ApplicationContext       appContext;
    private final ActionParameterValidator paramValidator;
    private final ActionHandlerRegistry    handlerRegistry;

    /**
     * Dispatches an action by its {@code action.action_code}.
     *
     * @param actionCode      the {@code action.action_code} (from the UI payload's
     *                        {@code actionCode} field)
     * @param transitionId    required for LIFECYCLE-scope actions, ignored otherwise
     * @param nodeId          target node
     * @param currentStateId  current lifecycle state (for permission check)
     * @param userId          executing user
     * @param txId            open PLM transaction (may be null)
     * @param rawParams       user-supplied parameters
     */
    public ActionResult dispatch(
        String actionCode,
        String transitionId,
        String nodeId,
        String currentStateId,
        String userId,
        String txId,
        Map<String, String> rawParams
    ) {
        Record action = dsl.select().from("action")
            .where("action_code = ?", actionCode)
            .fetchOne();
        if (action == null) throw new IllegalArgumentException("Unknown action: " + actionCode);

        String actionId    = action.get("id",           String.class);
        String actionKind  = action.get("action_kind",  String.class);
        String handlerRef  = action.get("handler_ref",  String.class);

        String nodeTypeId = dsl.select(org.jooq.impl.DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId)
            .fetchOne(org.jooq.impl.DSL.field("node_type_id"), String.class);

        Map<String, String> params = paramValidator.validate(actionId, nodeTypeId, rawParams);

        ActionHandler handler;
        if (handlerRegistry.hasHandler(actionCode)) {
            handler = handlerRegistry.getHandler(actionCode);
        } else if ("CUSTOM".equals(actionKind) && handlerRef != null && !handlerRef.isBlank()) {
            handler = appContext.getBean(handlerRef, ActionHandler.class);
        } else {
            throw new IllegalStateException("No handler registered for action code: " + actionCode);
        }

        ActionContext ctx = new ActionContext(
            nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, txId);

        log.info("Dispatching action {} on node {} transition={} by user {}",
            actionCode, nodeId, transitionId, userId);
        return handler.execute(ctx, params);
    }
}
