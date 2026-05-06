package com.plm.node.transaction.internal;

import com.plm.action.ActionWrapper;
import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * Lock acquisition wrapper for ISOLATED actions.
 *
 * Acquires a lock on the target node before the action executes,
 * and releases it after (regardless of success/failure).
 * Only activates when the context has a nodeId.
 */
@Slf4j
@AlgorithmBean(code = "wrapper-lock",
    name = "Lock Wrapper",
    description = "Acquires/releases pessimistic lock around action execution")
@RequiredArgsConstructor
public class LockWrapper implements ActionWrapper {

    private final LockService lockService;

    @Override
    public ActionResult wrap(ActionContext context, Map<String, String> params,
                             Map<String, String> instanceParams, Chain chain) {
        String nodeId = context.nodeId();
        if (nodeId == null) {
            return chain.proceed(context, params);
        }

        lockService.tryLock(nodeId, context.userId());
        try {
            return chain.proceed(context, params);
        } finally {
            try { lockService.unlock(nodeId); }
            catch (Exception e) {
                log.warn("Failed to unlock node {} after action: {}", nodeId, e.getMessage());
            }
        }
    }
}
