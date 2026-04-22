package com.plm.node.transaction.internal.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.List;
import java.util.Map;

@AlgorithmBean(code = "abort", name = "Abort Handler")
@RequiredArgsConstructor
public class AbortActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "abort"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        txService.releaseNodes(ctx.txId(), ctx.userId(), List.of(ctx.nodeId()));
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "message", "Node editing aborted"));
    }
}
