package com.plm.node.version.internal.handler;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import lombok.RequiredArgsConstructor;

import java.util.Map;

@AlgorithmBean(code = "read_node", name = "READ_NODE Handler",
    description = "Returns the full server-driven UI description of a node")
@RequiredArgsConstructor
public class ReadNodeActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "read_node"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        Map<String, Object> desc = nodeService.buildObjectDescription(
            ctx.nodeId(), ctx.userId(), ctx.txId());
        return ActionResult.ok(desc);
    }
}
