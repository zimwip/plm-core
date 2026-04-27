package com.plm.action.internal;

import com.plm.action.ActionScopeRegistry;
import com.plm.action.ActionWrapper;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionWrapperConfig;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.shared.action.ActionResult;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionScope;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
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
    private final ConfigCache              configCache;
    private final ActionParameterValidator paramValidator;
    private final AlgorithmRegistry        algorithmRegistry;
    private final ActionScopeRegistry      scopeRegistry;

    /**
     * Dispatches an action using scope-driven ID resolution.
     *
     * @param actionCode the action code (e.g. "CHECKOUT", "COMMIT")
     * @param pathIds    positional IDs from the URL path, interpreted by the action's scope
     * @param userId     the user triggering the action
     * @param txIdHint   optional txId from X-PLM-Tx header (overrides scope-resolved txId)
     * @param rawParams  user-supplied parameters from request body
     */
    public ActionResult dispatch(
        String actionCode,
        List<String> pathIds,
        String userId,
        String txIdHint,
        Map<String, String> rawParams
    ) {
        ActionConfig action = configCache.getAction(actionCode)
            .orElseThrow(() -> new IllegalArgumentException("Unknown action: " + actionCode));

        String actionId = action.id();
        String handlerInstanceId = action.handlerInstanceId();
        String scopeCode = action.scope();

        if (handlerInstanceId == null) {
            throw new IllegalStateException("Action " + actionCode + " has no handler (permission-only action)");
        }

        // Resolve scope and build base context from path IDs
        ActionScope scope = scopeRegistry.resolve(scopeCode);
        ActionContext ctx = scope.resolve(actionId, actionCode, userId, pathIds, rawParams);

        // Apply txId hint from header if present
        if (txIdHint != null && !txIdHint.isBlank() && ctx.txId() == null) {
            ctx = ctx.withTxId(txIdHint);
        }

        // Supplement nodeTypeId from DB when nodeId is present and nodeTypeId not already set
        String nodeTypeId = ctx.nodeTypeId();
        if (nodeTypeId == null && ctx.nodeId() != null) {
            nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
                .where("id = ?", ctx.nodeId())
                .fetchOne(DSL.field("node_type_id"), String.class);
            ctx = new ActionContext(
                ctx.nodeId(), nodeTypeId, ctx.actionId(), ctx.actionCode(),
                ctx.transitionId(), ctx.userId(), ctx.txId(), ctx.ids());
        }

        Map<String, String> params = new HashMap<>(paramValidator.validate(actionId, nodeTypeId, rawParams));

        // Resolve handler via ConfigCache: instance → algorithmId → algorithm code → AlgorithmRegistry
        String handlerCode = resolveAlgorithmCode(handlerInstanceId);
        ActionHandler handler = algorithmRegistry.resolve(handlerCode, ActionHandler.class);

        // Build wrapper chain from attached algorithm instances
        List<ResolvedWrapper> wrappers = resolveWrappers(action);

        log.info("Dispatching action {} scope={} pathIds={} wrappers={} by user {}",
            actionCode, scopeCode, pathIds, wrappers.size(), userId);

        // Build chain: wrappers[0] → wrappers[1] → ... → handler
        ActionWrapper.Chain chain = buildChain(wrappers, handler);
        try {
            return chain.proceed(ctx, params);
        } catch (com.plm.shared.exception.AccessDeniedException e) {
            String msg = e.getMessage();
            if (msg != null && !msg.contains(actionCode)) {
                String permHint = "";
                int qi = msg.indexOf('\'');
                if (qi >= 0) {
                    int qe = msg.indexOf('\'', qi + 1);
                    if (qe > qi) permHint = msg.substring(qi + 1, qe);
                }
                throw new com.plm.shared.exception.AccessDeniedException(
                    "User " + userId + " cannot execute '" + actionCode
                    + "' — required permission '" + permHint + "' is missing");
            }
            throw e;
        }
    }

    /**
     * Resolves ordered wrappers with their instance parameters from ConfigCache.
     */
    private List<ResolvedWrapper> resolveWrappers(ActionConfig action) {
        List<ActionWrapperConfig> wrapperConfigs = action.wrappers();
        if (wrapperConfigs == null || wrapperConfigs.isEmpty()) return List.of();

        List<ResolvedWrapper> wrappers = new ArrayList<>();
        for (ActionWrapperConfig aw : wrapperConfigs) {
            String instanceId = aw.algorithmInstanceId();
            String code = resolveAlgorithmCode(instanceId);
            ActionWrapper wrapper = algorithmRegistry.resolve(code, ActionWrapper.class);
            Map<String, String> instanceParams = configCache.getInstance(instanceId)
                .map(AlgorithmInstanceConfig::paramValues)
                .orElse(Map.of());
            wrappers.add(new ResolvedWrapper(wrapper, instanceParams));
        }
        return wrappers;
    }

    /**
     * Resolves the algorithm code for a given algorithm instance id via ConfigCache.
     */
    private String resolveAlgorithmCode(String instanceId) {
        AlgorithmInstanceConfig instance = configCache.getInstance(instanceId)
            .orElseThrow(() -> new IllegalStateException(
                "Algorithm instance not found in config cache: " + instanceId));
        String algorithmId = instance.algorithmId();
        return configCache.getAllAlgorithms().stream()
            .filter(a -> a.id().equals(algorithmId))
            .map(AlgorithmConfig::code)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException(
                "Algorithm not found for id: " + algorithmId));
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
