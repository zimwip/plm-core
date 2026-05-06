package com.plm.node.version.internal.handler;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "read_node", name = "READ_NODE Handler",
    description = "Returns the full server-driven UI description of a node")
@RequiredArgsConstructor
public class ReadNodeActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "read_node"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/read_node/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        Map<String, Object> desc = nodeService.buildObjectDescription(
            ctx.nodeId(), ctx.userId(), ctx.txId());
        return ActionResult.ok(desc);
    }
}
