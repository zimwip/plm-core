package com.plm.platform.action;

import com.plm.platform.authz.PolicyDeniedException;
import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionWrapperConfig;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Central action executor with middleware pipeline.
 *
 * Resolves the action handler and wrapper chain from ConfigCache + AlgorithmRegistry,
 * builds the execution pipeline, and runs it.
 *
 * Wired by {@link ActionFrameworkAutoConfiguration}.
 */
@Slf4j
public class ActionDispatcher {

    private final ConfigCache                   configCache;
    private final AlgorithmRegistry             algorithmRegistry;
    private final ActionScopeRegistry           scopeRegistry;
    private final ActionNodeContextPort         nodeContextPort;
    private final ActionParameterValidatorPort  paramValidator;

    public ActionDispatcher(ConfigCache configCache,
                            AlgorithmRegistry algorithmRegistry,
                            ActionScopeRegistry scopeRegistry,
                            ActionNodeContextPort nodeContextPort,
                            ActionParameterValidatorPort paramValidator) {
        this.configCache       = configCache;
        this.algorithmRegistry = algorithmRegistry;
        this.scopeRegistry     = scopeRegistry;
        this.nodeContextPort   = nodeContextPort;
        this.paramValidator    = paramValidator;
    }

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

        String actionId         = action.id();
        String handlerInstanceId = action.handlerInstanceId();
        String scopeCode        = action.scope();

        if (handlerInstanceId == null) {
            throw new IllegalStateException("Action " + actionCode + " has no handler (permission-only action)");
        }

        // Resolve scope and build base context from path IDs
        ActionScope scope = scopeRegistry.resolve(scopeCode);
        ActionContext ctx = scope.resolve(actionId, actionCode, userId, pathIds, rawParams);

        if (txIdHint != null && !txIdHint.isBlank() && ctx.txId() == null) {
            ctx = ctx.withTxId(txIdHint);
        }

        // Supplement nodeTypeId via port when nodeId is present and nodeTypeId not already set
        String nodeTypeId = ctx.nodeTypeId();
        if (nodeTypeId == null && ctx.nodeId() != null) {
            nodeTypeId = nodeContextPort.resolveFromNodeId(ctx.nodeId(), userId)
                .map(ActionNodeContextPort.NodeCtx::nodeTypeId)
                .orElse(null);
            if (nodeTypeId != null) {
                ctx = new ActionContext(
                    ctx.nodeId(), nodeTypeId, ctx.actionId(), ctx.actionCode(),
                    ctx.transitionId(), ctx.userId(), ctx.txId(), ctx.ids());
            }
        }

        Map<String, String> params = new HashMap<>(paramValidator.validate(actionId, nodeTypeId, rawParams));

        String handlerCode = resolveAlgorithmCode(handlerInstanceId);
        ActionHandler handler = algorithmRegistry.resolve(handlerCode, ActionHandler.class);

        List<ResolvedWrapper> wrappers = resolveWrappers(action);

        log.info("Dispatching action {} scope={} pathIds={} wrappers={} by user {}",
            actionCode, scopeCode, pathIds, wrappers.size(), userId);

        ActionWrapper.Chain chain = buildChain(wrappers, handler::execute);
        try {
            return chain.proceed(ctx, params);
        } catch (PolicyDeniedException e) {
            String msg = e.getMessage();
            if (msg != null && !msg.contains(actionCode)) {
                String permHint = "";
                int qi = msg.indexOf('\'');
                if (qi >= 0) {
                    int qe = msg.indexOf('\'', qi + 1);
                    if (qe > qi) permHint = msg.substring(qi + 1, qe);
                }
                throw new PolicyDeniedException(
                    "User " + userId + " cannot execute '" + actionCode
                    + "' — required permission '" + permHint + "' is missing");
            }
            throw e;
        }
    }

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
     * Builds a wrapper chain for HTTP-dispatched handlers (e.g., multipart routes).
     * The {@code httpTerminal} is called at the end of the chain instead of {@code handler.execute()},
     * allowing wrappers (TransactionWrapper, LockWrapper, etc.) to run even for routes that bypass
     * the standard {@link #dispatch} path.
     */
    public ActionWrapper.Chain wrapForHttp(String actionCode, ActionWrapper.Chain httpTerminal) {
        return configCache.getAction(actionCode)
            .map(action -> buildChain(resolveWrappers(action), httpTerminal))
            .orElse(httpTerminal);
    }

    private ActionWrapper.Chain buildChain(List<ResolvedWrapper> wrappers, ActionWrapper.Chain terminal) {
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
