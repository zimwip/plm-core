package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.BaselineService;
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
