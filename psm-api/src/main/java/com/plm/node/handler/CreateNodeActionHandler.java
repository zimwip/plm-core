package com.plm.node.handler;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Optional;

/**
 * CREATE_NODE action handler.
 *
 * <p>NODE_TYPE scope: receives nodeTypeId from ActionContext.
 * Only the identity fields {@code _logicalId} (required) and {@code _externalId}
 * (optional) are read from params — domain attributes are populated later via
 * {@code update_node} before checkin. Any other param is ignored here.
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
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/create_node/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String projectSpaceId = secCtx.requireProjectSpaceId();
        String nodeTypeId = ctx.nodeTypeId();

        String logicalId  = params.get("_logicalId");
        String externalId = params.get("_externalId");

        String nodeId = nodeService.createNode(
                projectSpaceId, nodeTypeId, ctx.userId(),
                logicalId, externalId);

        return ActionResult.ok(Map.of("nodeId", nodeId));
    }
}
