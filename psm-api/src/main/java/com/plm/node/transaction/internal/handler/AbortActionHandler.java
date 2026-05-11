package com.plm.node.transaction.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.platform.algorithm.AlgorithmBean;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "abort", name = "Abort Handler")
@RequiredArgsConstructor
public class AbortActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "abort"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/actions/abort/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        txService.releaseNodes(ctx.txId(), ctx.userId(), List.of(ctx.nodeId()));
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "message", "Node editing aborted"));
    }
}
