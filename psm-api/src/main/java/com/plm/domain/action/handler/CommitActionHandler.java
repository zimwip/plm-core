package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

@Service("commitActionHandler")
@RequiredArgsConstructor
public class CommitActionHandler implements ActionHandler {

    private final PlmTransactionService txService;

    @Override
    public String actionCode() { return "COMMIT"; }

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
