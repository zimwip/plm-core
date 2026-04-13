package com.plm.domain.action.handler;

import com.plm.domain.action.ActionContext;
import com.plm.domain.action.ActionHandler;
import com.plm.domain.action.ActionResult;
import com.plm.domain.service.NodeService;
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
        String linkId    = params.get("linkId");
        String logicalId = params.get("logicalId");
        if (linkId == null || linkId.isBlank()) {
            throw new IllegalArgumentException("Parameter 'linkId' is required");
        }
        if (logicalId != null && !logicalId.isBlank()) {
            nodeService.updateLinkLogicalId(linkId, logicalId, ctx.userId(), ctx.txId());
        }
        return ActionResult.ok("linkId", linkId);
    }
}
