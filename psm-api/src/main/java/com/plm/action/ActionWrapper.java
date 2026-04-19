package com.plm.action;

import com.plm.algorithm.AlgorithmType;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionResult;

import java.util.Map;

/**
 * Middleware in the action execution pipeline.
 *
 * Each wrapper receives the context, parameters, and a {@code next} callable
 * representing the rest of the chain. The wrapper can:
 * <ul>
 *   <li>Enrich the context (e.g., set txId)</li>
 *   <li>Short-circuit (e.g., permission denied)</li>
 *   <li>Wrap in try/catch (e.g., transaction commit/rollback)</li>
 * </ul>
 *
 * Wrappers are algorithm beans and are attached to actions via
 * {@code action_wrapper} configuration in the database.
 */
@AlgorithmType(id = "algtype-action-wrapper",
    name = "Action Wrapper",
    description = "Middleware wrapping action execution (transaction, lock, etc.)")
public interface ActionWrapper {

    /**
     * Wraps action execution.
     *
     * @param context   current action context (may be enriched by previous wrappers)
     * @param params    validated user-supplied parameters
     * @param chain     the rest of the pipeline — call {@code chain.proceed(context, params)}
     *                  to continue execution
     * @return          action result
     */
    ActionResult wrap(ActionContext context, Map<String, String> params, Chain chain);

    /**
     * Represents the rest of the wrapper chain + the final handler.
     */
    @FunctionalInterface
    interface Chain {
        ActionResult proceed(ActionContext context, Map<String, String> params);
    }
}
