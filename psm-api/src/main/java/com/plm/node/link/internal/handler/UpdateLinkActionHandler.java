package com.plm.node.link.internal.handler;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@AlgorithmBean(code = "update_link", name = "UPDATE_LINK Handler")
@RequiredArgsConstructor
public class UpdateLinkActionHandler implements ActionHandler {

    private final NodeService nodeService;

    @Override
    public String actionCode() { return "update_link"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/update_link/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String linkId    = params.get("linkId");
        if (linkId == null || linkId.isBlank()) {
            throw new IllegalArgumentException("Parameter 'linkId' is required");
        }
        String targetSourceCode = params.get("targetSourceCode");
        String targetType       = params.get("targetType");
        String targetKey        = params.get("targetKey");
        String logicalId        = params.get("logicalId");
        Map<String, String> linkAttributes = new LinkedHashMap<>();
        params.forEach((k, v) -> {
            if (k.startsWith("linkAttr_")) linkAttributes.put(k.substring(9), v);
        });
        nodeService.updateLink(linkId, targetSourceCode, targetType, targetKey,
            logicalId, linkAttributes.isEmpty() ? null : linkAttributes, ctx.userId(), ctx.txId());
        return ActionResult.ok("linkId", linkId);
    }
}
