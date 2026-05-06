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

@AlgorithmBean(code = "checkin", name = "CHECKIN Handler")
@RequiredArgsConstructor
public class CheckinActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "checkin"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/checkin/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        if (ctx.txId() == null) {
            throw new IllegalStateException("CHECKIN requires an open transaction (X-PLM-Tx header)");
        }

        // Commit only the current node — other nodes in the tx (if any) are moved
        // to a new continuation transaction automatically.
        String comment = params != null ? params.getOrDefault("comment", params.get("_description")) : null;
        if (comment == null || comment.isBlank()) comment = "checked-in";
        String continuationTxId = txService.commitTransaction(
            ctx.txId(), ctx.userId(), comment, List.of(ctx.nodeId()));

        Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("nodeId",            ctx.nodeId());
        data.put("committedTxId",     ctx.txId());
        data.put("continuationTxId",  continuationTxId);  // null when no other nodes were deferred
        return ActionResult.ok(data);
    }
}
