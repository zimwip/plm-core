package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.SignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("signActionHandler")
@RequiredArgsConstructor
public class SignActionHandler implements ActionHandler {

    private final SignatureService signatureService;

    @Override
    public String actionCode() { return "SIGN"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String sigId = signatureService.sign(
            ctx.nodeId(), ctx.userId(), ctx.txId(),
            params.get("meaning"),
            params.get("comment"));
        return ActionResult.ok("signatureId", sigId);
    }
}
