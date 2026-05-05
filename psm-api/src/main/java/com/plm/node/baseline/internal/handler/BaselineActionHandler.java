package com.plm.node.baseline.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.baseline.internal.BaselineService;
import lombok.RequiredArgsConstructor;
import com.plm.algorithm.AlgorithmBean;

import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "baseline", name = "BASELINE Handler")
@RequiredArgsConstructor
public class BaselineActionHandler implements ActionHandler {

    private final BaselineService baselineService;

    @Override
    public String actionCode() { return "baseline"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/baseline/{id}").metadataOnly());
    }

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
