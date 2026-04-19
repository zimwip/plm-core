package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.baseline.internal.BaselineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("baselineActionHandler")
@RequiredArgsConstructor
public class BaselineActionHandler implements ActionHandler {

    private final BaselineService baselineService;

    @Override
    public String actionCode() { return "BASELINE"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String baselineId = baselineService.createBaseline(
            ctx.nodeId(),
            params.get("name"),
            params.get("description"),
            ctx.userId());
        return ActionResult.ok("baselineId", baselineId);
    }
}
