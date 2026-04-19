package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionHandler;
import com.plm.shared.action.ActionResult;
import com.plm.node.NodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("updateLinkActionHandler")
@RequiredArgsConstructor
public class UpdateLinkActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "UPDATE_LINK"; }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String linkId       = params.get("linkId");
        String targetNodeId = params.get("targetNodeId");
        String logicalId    = params.get("logicalId");
        if (linkId == null || linkId.isBlank()) {
            throw new IllegalArgumentException("Parameter 'linkId' is required");
        }
        nodeService.updateLink(linkId, targetNodeId, logicalId, ctx.userId(), ctx.txId());
        return ActionResult.ok("linkId", linkId);
    }
}
