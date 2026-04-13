package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service("checkinActionHandler")
@RequiredArgsConstructor
public class CheckinActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "CHECKIN"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        if (ctx.txId() == null) {
            throw new IllegalStateException("CHECKIN requires an open transaction (X-PLM-Tx header)");
        }

        // Commit only the current node — other nodes in the tx (if any) are moved
        // to a new continuation transaction automatically.
        String continuationTxId = txService.commitTransaction(
            ctx.txId(), ctx.userId(), "checked-in", List.of(ctx.nodeId()));

        Map<String, Object> data = new java.util.LinkedHashMap<>();
        data.put("nodeId",            ctx.nodeId());
        data.put("committedTxId",     ctx.txId());
        data.put("continuationTxId",  continuationTxId);  // null when no other nodes were deferred
        return ActionResult.ok(data);
    }
}
