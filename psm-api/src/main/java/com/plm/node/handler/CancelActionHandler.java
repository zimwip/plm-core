package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.List;
import java.util.Map;

@AlgorithmBean(code = "CANCEL", name = "CANCEL Handler")
@RequiredArgsConstructor
public class CancelActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "CANCEL"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        txService.releaseNodes(ctx.txId(), ctx.userId(), List.of(ctx.nodeId()));
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "message", "Node released from transaction"));
    }
}
