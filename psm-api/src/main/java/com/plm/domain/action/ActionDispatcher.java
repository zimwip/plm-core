package com.plm.domain.action;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.annotation.PostConstruct;

/**
 * Central action executor.
 *
 * Responsibilities:
 *  1. Resolve the node_type_action and action rows.
 *  2. Enforce action-level permissions via ActionPermissionService.
 *  3. Validate parameters via ActionParameterValidator.
 *  4. Route to the correct ActionHandler bean.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionDispatcher {

    private final DSLContext               dsl;
    private final ApplicationContext       appContext;
    private final ActionParameterValidator paramValidator;

    /** Handler map keyed by action_code, populated at startup. */
    private final Map<String, ActionHandler> handlersByCode = new ConcurrentHashMap<>();

    @PostConstruct
    void init() {
        appContext.getBeansOfType(ActionHandler.class).values()
            .forEach(h -> {
                handlersByCode.put(h.actionCode(), h);
                log.info("Registered action handler: {}", h.actionCode());
            });
    }

    /**
     * Dispatches an action by its node_type_action.id.
     *
     * @param nodeTypeActionId  the node_type_action.id (from the UI payload)
     * @param nodeId            target node
     * @param currentStateId    current lifecycle state (for permission check)
     * @param userId            executing user
     * @param txId              open PLM transaction (may be null)
     * @param rawParams         user-supplied parameters
     */
    public ActionResult dispatch(
        String nodeTypeActionId,
        String nodeId,
        String currentStateId,
        String userId,
        String txId,
        Map<String, String> rawParams
    ) {
        // Load node_type_action + action
        Record nta = dsl.select().from("node_type_action nta")
            .join("action na").on("na.id = nta.action_id")
            .where("nta.id = ?", nodeTypeActionId)
            .fetchOne();
        if (nta == null) throw new IllegalArgumentException("Unknown action: " + nodeTypeActionId);

        String actionId    = nta.get("action_id",     String.class);
        String actionCode  = nta.get("action_code",   String.class);
        String actionKind  = nta.get("action_kind",   String.class);
        String handlerRef  = nta.get("handler_ref",   String.class);
        String transitionId= nta.get("transition_id", String.class);
        String nodeTypeId  = nta.get("node_type_id",  String.class);

        // Permission check enforced at service layer via @PlmAction AOP.

        // 2. Parameter validation
        Map<String, String> params = paramValidator.validate(actionId, nodeTypeActionId, rawParams);

        // 3. Handler resolution
        ActionHandler handler = handlersByCode.get(actionCode);
        if (handler == null && "CUSTOM".equals(actionKind)) {
            handler = appContext.getBean(handlerRef, ActionHandler.class);
        }
        if (handler == null) {
            throw new IllegalStateException("No handler registered for action code: " + actionCode);
        }

        ActionContext ctx = new ActionContext(
            nodeId, nodeTypeId, nodeTypeActionId, transitionId, userId, txId);

        log.info("Dispatching action {} ({}) on node {} by user {}", actionCode, nodeTypeActionId, nodeId, userId);
        return handler.execute(ctx, params);
    }
}
