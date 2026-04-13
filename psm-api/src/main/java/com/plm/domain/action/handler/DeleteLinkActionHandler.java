package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.NodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service("deleteLinkActionHandler")
@RequiredArgsConstructor
public class DeleteLinkActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "DELETE_LINK"; }

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
