package com.plm.node.transaction.internal.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.transaction.internal.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.LinkedHashMap;
import java.util.Map;

@AlgorithmBean(code = "commit", name = "COMMIT Handler")
@RequiredArgsConstructor
public class CommitActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "commit"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String comment = params.getOrDefault("comment", "committed");
        String continuationTxId = txService.commitTransaction(
            ctx.txId(), ctx.userId(), comment, null);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("txId", ctx.txId());
        if (continuationTxId != null) result.put("continuationTxId", continuationTxId);
        result.put("message", "Transaction committed");
        return ActionResult.ok(result);
    }
}
