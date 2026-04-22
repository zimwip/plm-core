package com.plm.node.handler;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

/**
 * CREATE_NODE action handler.
 *
 * <p>NODE_TYPE scope: receives nodeTypeId from ActionContext.
 * Parameters follow the same convention as UpdateNodeActionHandler:
 * {@code _logicalId} and {@code _externalId} are internal params,
 * everything else is treated as node attributes.
 */
@AlgorithmBean(code = "create_node", name = "Create Node Handler")
@RequiredArgsConstructor
public class CreateNodeActionHandler implements ActionHandler {

    private final NodeService       nodeService;
    private final SecurityContextPort secCtx;

    @Override
    public String actionCode() {
        return "create_node";
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String projectSpaceId = secCtx.requireProjectSpaceId();
        String nodeTypeId = ctx.nodeTypeId();

        // Pull internal params, rest = attributes
        Map<String, String> attributes = new HashMap<>(params);
        String logicalId  = attributes.remove("_logicalId");
        String externalId = attributes.remove("_externalId");

        String nodeId = nodeService.createNode(
                projectSpaceId, nodeTypeId, ctx.userId(),
                attributes, logicalId, externalId);

        return ActionResult.ok(Map.of("nodeId", nodeId));
    }
}
