package com.plm.action.internal;

import com.plm.action.ActionWrapper;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.shared.action.ActionResult;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Central action executor with middleware pipeline.
 *
 * Resolves the action handler and wrapper chain from the algorithm registry,
 * builds the execution pipeline, and runs it.
 *
 * No direct knowledge of transactions, locks, or node services — all
 * cross-cutting concerns are handled by wrappers (algorithm beans).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionDispatcher {

    private final DSLContext               dsl;
    private final ActionParameterValidator paramValidator;
    private final AlgorithmRegistry        algorithmRegistry;

    /**
     * Dispatches an action by its {@code action.action_code}.
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

        String actionId = action.get("id", String.class);
        String handlerInstanceId = action.get("handler_instance_id", String.class);

        if (handlerInstanceId == null) {
            throw new IllegalStateException("Action " + actionCode + " has no handler (permission-only action)");
        }

        String nodeTypeId = null;
        if (nodeId != null) {
            nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
                .where("id = ?", nodeId)
                .fetchOne(DSL.field("node_type_id"), String.class);
        }

        Map<String, String> params = new HashMap<>(paramValidator.validate(actionId, nodeTypeId, rawParams));

        // Resolve handler via algorithm_instance FK → algorithm.code → AlgorithmRegistry
        String handlerCode = dsl.select(DSL.field("a.code"))
            .from("algorithm_instance ai")
            .join("algorithm a").on("a.id = ai.algorithm_id")
            .where("ai.id = ?", handlerInstanceId)
            .fetchOne(DSL.field("a.code"), String.class);
        ActionHandler handler = algorithmRegistry.resolve(handlerCode, ActionHandler.class);

        // Build wrapper chain from attached algorithm instances
        List<ResolvedWrapper> wrappers = resolveWrappers(actionId);

        ActionContext ctx = new ActionContext(
            nodeId, nodeTypeId, actionId, actionCode, transitionId, userId, txId);

        log.info("Dispatching action {} on node {} transition={} wrappers={} by user {}",
            actionCode, nodeId, transitionId, wrappers.size(), userId);

        // Build chain: wrappers[0] → wrappers[1] → ... → handler
        ActionWrapper.Chain chain = buildChain(wrappers, handler);
        return chain.proceed(ctx, params);
    }

    /**
     * Resolves ordered wrappers with their instance parameters.
     */
    private List<ResolvedWrapper> resolveWrappers(String actionId) {
        var attachments = dsl.fetch("""
            SELECT a.code AS algorithm_code, aw.execution_order, ai.id AS instance_id
            FROM action_wrapper aw
            JOIN algorithm_instance ai ON ai.id = aw.algorithm_instance_id
            JOIN algorithm a           ON a.id = ai.algorithm_id
            WHERE aw.action_id = ?
            ORDER BY aw.execution_order
            """, actionId);

        List<ResolvedWrapper> wrappers = new ArrayList<>();
        for (var r : attachments) {
            String code = r.get("algorithm_code", String.class);
            String instanceId = r.get("instance_id", String.class);
            ActionWrapper wrapper = algorithmRegistry.resolve(code, ActionWrapper.class);
            Map<String, String> instanceParams = loadInstanceParams(instanceId);
            wrappers.add(new ResolvedWrapper(wrapper, instanceParams));
        }
        return wrappers;
    }

    /**
     * Loads algorithm_instance_param_value for a given instance.
     */
    private Map<String, String> loadInstanceParams(String instanceId) {
        Map<String, String> params = new HashMap<>();
        dsl.fetch("""
            SELECT ap.param_name, pv.value
            FROM algorithm_instance_param_value pv
            JOIN algorithm_parameter ap ON ap.id = pv.algorithm_parameter_id
            WHERE pv.algorithm_instance_id = ?
            """, instanceId)
            .forEach(r -> params.put(
                r.get("param_name", String.class),
                r.get("value", String.class)));
        return params;
    }

    /**
     * Builds a chain of wrappers ending with the handler.
     */
    private ActionWrapper.Chain buildChain(List<ResolvedWrapper> wrappers, ActionHandler handler) {
        // Terminal chain: just call the handler
        ActionWrapper.Chain terminal = handler::execute;

        // Wrap from last to first
        ActionWrapper.Chain chain = terminal;
        for (int i = wrappers.size() - 1; i >= 0; i--) {
            ResolvedWrapper rw = wrappers.get(i);
            ActionWrapper.Chain next = chain;
            chain = (ctx, params) -> rw.wrapper.wrap(ctx, params, rw.instanceParams, next);
        }
        return chain;
    }

    private record ResolvedWrapper(ActionWrapper wrapper, Map<String, String> instanceParams) {}
}
