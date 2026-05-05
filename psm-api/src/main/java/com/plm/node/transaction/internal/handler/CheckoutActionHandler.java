package com.plm.node.transaction.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.NodeService;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "checkout", name = "CHECKOUT Handler")
@RequiredArgsConstructor
public class CheckoutActionHandler implements ActionHandler {

    private final NodeService            nodeService;
    private final PlmTransactionService  txService;

    @Override
    public String actionCode() { return "checkout"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/checkout/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        // checkout() acquires the lock, finds/creates a transaction, and creates the OPEN version.
        String versionId = nodeService.checkout(ctx.nodeId(), ctx.userId(), ctx.txId());

        // Read back the txId — checkout() may have created one automatically.
        String txId = txService.findOpenTransaction(ctx.userId());
        return ActionResult.ok(Map.of("nodeId", ctx.nodeId(), "txId", txId != null ? txId : "", "versionId", versionId));
    }
}
