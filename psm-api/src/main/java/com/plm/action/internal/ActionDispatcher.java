package com.plm.action.internal;

import com.plm.action.ActionWrapper;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.shared.action.ActionHandlerRegistry;
import com.plm.shared.action.ActionResult;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Central action executor with middleware pipeline.
 *
 * Responsibilities:
 *  1. Resolve the {@code action} row from its code.
 *  2. Build a wrapper chain from attached algorithm instances.
 *  3. Validate parameters via ActionParameterValidator.
 *  4. Execute the chain: wrappers → handler.
 *
 * Transaction/lock management is no longer handled here — it's delegated
 * to {@link com.plm.node.transaction.internal.TransactionWrapper} and
 * {@link com.plm.node.transaction.internal.LockWrapper} via the wrapper chain.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionDispatcher {

    private final DSLContext               dsl;
    private final ApplicationContext       appContext;
    private final ActionParameterValidator paramValidator;
    private final ActionHandlerRegistry    handlerRegistry;
    private final AlgorithmRegistry        algorithmRegistry;

    /**
     * Dispatches an action by its {@code action.action_code}.
     *
     * @param actionCode      the {@code action.action_code}
     * @param transitionId    required for LIFECYCLE-scope actions, ignored otherwise
     * @param nodeId          target node (null for TX-scope actions)
     * @param currentStateId  current lifecycle state
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
        String txMode      = action.get("tx_mode",      String.class);

        String nodeTypeId = null;
        if (nodeId != null) {
            nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
                .where("id = ?", nodeId)
                .fetchOne(DSL.field("node_type_id"), String.class);
        }

        Map<String, String> params = new HashMap<>(paramValidator.validate(actionId, nodeTypeId, rawParams));
        // Inject tx_mode as wrapper parameter so TransactionWrapper can read it
        params.put("_wrapper_tx_mode", txMode != null ? txMode : "NONE");

        ActionHandler handler;
        if (handlerRegistry.hasHandler(actionCode)) {
            handler = handlerRegistry.getHandler(actionCode);
        } else if ("CUSTOM".equals(actionKind) && handlerRef != null && !handlerRef.isBlank()) {
            handler = appContext.getBean(handlerRef, ActionHandler.class);
        } else {
            throw new IllegalStateException("No handler registered for action code: " + actionCode);
        }

        // Build wrapper chain from algorithm instances attached to this action
        List<ActionWrapper> wrappers = resolveWrappers(actionId);

        ActionContext ctx = new ActionContext(
            nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, txId);

        log.info("Dispatching action {} on node {} transition={} txMode={} wrappers={} by user {}",
            actionCode, nodeId, transitionId, txMode, wrappers.size(), userId);

        // Build chain: wrappers[0] → wrappers[1] → ... → handler
        ActionWrapper.Chain chain = buildChain(wrappers, handler);
        return chain.proceed(ctx, params);
    }

    /**
     * Resolves ordered wrappers attached to an action via algorithm instances.
     * Falls back to default wrappers based on tx_mode if none configured.
     */
    private List<ActionWrapper> resolveWrappers(String actionId) {
        // Query wrapper algorithm instances attached to this action
        var attachments = dsl.select(
                DSL.field("a.code"),
                DSL.field("aw.execution_order"))
            .from("action_wrapper aw")
            .join("algorithm_instance ai").on("ai.id = aw.algorithm_instance_id")
            .join("algorithm a").on("a.id = ai.algorithm_id")
            .where("aw.action_id = ?", actionId)
            .orderBy(DSL.field("aw.execution_order"))
            .fetch();

        if (attachments.isEmpty()) {
            // Default chain: transaction wrapper (reads tx_mode from params)
            return List.of(
                algorithmRegistry.resolve("wrapper-transaction", ActionWrapper.class)
            );
        }

        List<ActionWrapper> wrappers = new ArrayList<>();
        for (var r : attachments) {
            String code = r.get("code", String.class);
            wrappers.add(algorithmRegistry.resolve(code, ActionWrapper.class));
        }
        return wrappers;
    }

    /**
     * Builds a chain of wrappers ending with the handler.
     */
    private ActionWrapper.Chain buildChain(List<ActionWrapper> wrappers, ActionHandler handler) {
        // Terminal chain: just call the handler
        ActionWrapper.Chain terminal = handler::execute;

        // Wrap from last to first
        ActionWrapper.Chain chain = terminal;
        for (int i = wrappers.size() - 1; i >= 0; i--) {
            ActionWrapper wrapper = wrappers.get(i);
            ActionWrapper.Chain next = chain;
            chain = (ctx, params) -> wrapper.wrap(ctx, params, next);
        }
        return chain;
    }
}
