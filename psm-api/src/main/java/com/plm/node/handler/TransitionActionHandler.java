package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.lifecycle.internal.LifecycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("transitionActionHandler")
@RequiredArgsConstructor
public class TransitionActionHandler implements ActionHandler {

    private final LifecycleService lifecycleService;

    @Override
    public String actionCode() { return "TRANSITION"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        if (ctx.transitionId() == null)
            throw new IllegalStateException("TRANSITION action requires a transitionId in context");
        String versionId = lifecycleService.applyTransition(
            ctx.nodeId(), ctx.transitionId(), ctx.userId(), ctx.txId());
        return ActionResult.ok(Map.of("versionId", versionId, "txId", ctx.txId()));
    }

    @Override
    public Map<String, Object> resolveDisplayHints(String nodeId, String nodeTypeId, String transitionId) {
        String color = lifecycleService.getTransitionTargetStateColor(transitionId);
        return color != null ? Map.of("displayColor", color) : Map.of();
    }
}
