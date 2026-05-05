package com.plm.node.transaction.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "rollback", name = "Rollback Handler")
@RequiredArgsConstructor
public class RollbackActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "rollback"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/rollback/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        txService.rollbackTransaction(ctx.txId(), ctx.userId());
        return ActionResult.ok(Map.of("txId", ctx.txId(), "message", "Transaction rolled back"));
    }
}
