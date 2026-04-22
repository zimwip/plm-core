package com.plm.node.signature.internal.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.signature.internal.SignatureService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;

@AlgorithmBean(code = "sign", name = "SIGN Handler")
@RequiredArgsConstructor
public class SignActionHandler implements ActionHandler {

    private final SignatureService signatureService;

    @Override
    public String actionCode() { return "sign"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String sigId = signatureService.sign(
            ctx.nodeId(), ctx.userId(),
            params.get("meaning"),
            params.get("comment"));
        return ActionResult.ok("signatureId", sigId);
    }
}
