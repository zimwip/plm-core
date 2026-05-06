package com.plm.node.link.internal.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import com.plm.node.NodeService;
import lombok.RequiredArgsConstructor;
import com.plm.platform.algorithm.AlgorithmBean;

import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "delete_link", name = "DELETE_LINK Handler")
@RequiredArgsConstructor
public class DeleteLinkActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "delete_link"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/delete_link/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String linkId = params.get("linkId");
        if (linkId == null || linkId.isBlank()) {
            throw new IllegalArgumentException("Parameter 'linkId' is required");
        }
        nodeService.deleteLink(linkId, ctx.userId(), ctx.txId());
        return ActionResult.ok("linkId", linkId);
    }
}
