package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;

@AlgorithmBean(code = "ROLLBACK", name = "ROLLBACK Handler")
@RequiredArgsConstructor
public class RollbackActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "ROLLBACK"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        txService.rollbackTransaction(ctx.txId(), ctx.userId());
        return ActionResult.ok(Map.of("txId", ctx.txId(), "message", "Transaction rolled back"));
    }
}
