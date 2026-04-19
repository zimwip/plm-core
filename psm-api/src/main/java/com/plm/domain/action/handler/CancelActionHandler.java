package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.PlmTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service("cancelActionHandler")
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
