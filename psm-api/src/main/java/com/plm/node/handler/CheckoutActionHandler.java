package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.NodeService;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("checkoutActionHandler")
@RequiredArgsConstructor
public class CheckoutActionHandler implements ActionHandler {

    private final NodeService            nodeService;
    private final PlmTransactionService  txService;

    @Override
    public String actionCode() { return "CHECKOUT"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        // checkout() acquires the lock, finds/creates a transaction, and creates the OPEN version.
        String versionId = nodeService.checkout(ctx.nodeId(), ctx.userId(), ctx.txId());

        // Read back the txId — checkout() may have created one automatically.
        String txId = txService.findOpenTransaction(ctx.userId());
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "txId", txId != null ? txId : "", "versionId", versionId));
    }
}
