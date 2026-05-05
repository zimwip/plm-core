package com.plm.node.link.internal.handler;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.NodeService;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionRouteDescriptor;
import com.plm.shared.action.ActionHandler;
import com.plm.platform.action.ActionResult;
import lombok.RequiredArgsConstructor;

import java.util.Map;
import java.util.Optional;

/**
 * Dispatch handler for the {@code create_link} action.
 *
 * Parameters:
 * <ul>
 *   <li>{@code linkTypeId} — required, identifies the link_type</li>
 *   <li>{@code targetSourceCode} — optional, defaults to the link_type's
 *       declared {@code targetSourceId} (usually {@code SELF})</li>
 *   <li>{@code targetType} — optional, defaults to the link_type's {@code targetType}</li>
 *   <li>{@code targetKey} — required, opaque key passed to the resolver
 *       (for SELF: {@code logical_id} or {@code logical_id@version})</li>
 *   <li>{@code linkLogicalId} — required user-facing link identifier</li>
 * </ul>
 *
 * V2V is no longer wired here — if the caller wants V2V they pass {@code @N}
 * inside {@code targetKey} and the SELF resolver handles it.
 */
@AlgorithmBean(code = "create_link", name = "CREATE_LINK Handler")
@RequiredArgsConstructor
public class CreateLinkActionHandler implements ActionHandler {

    private final NodeService nodeService;
    private final ConfigCache configCache;

    @Override
    public String actionCode() { return "create_link"; }

    @Override
    public Optional<ActionRouteDescriptor> route() {
        return Optional.of(ActionRouteDescriptor.post("/api/psm/actions/create_link/{id}").metadataOnly());
    }

    @Override
    public ActionResult execute(ActionContext ctx, Map<String, String> params) {
        String linkTypeId    = params.get("linkTypeId");
        String linkLogicalId = params.get("linkLogicalId");
        if (linkTypeId == null || linkTypeId.isBlank()) {
            throw new IllegalArgumentException("Parameter 'linkTypeId' is required");
        }
        LinkTypeConfig lt = configCache.getLinkType(linkTypeId)
            .orElseThrow(() -> new IllegalArgumentException("Unknown linkTypeId: " + linkTypeId));

        String targetSourceCode = params.getOrDefault("targetSourceCode", lt.targetSourceId());
        String targetType       = params.getOrDefault("targetType",       lt.targetType());
        String targetKey        = params.get("targetKey");
        if (targetKey == null || targetKey.isBlank()) {
            throw new IllegalArgumentException("Parameter 'targetKey' is required");
        }

        String linkId = nodeService.createLink(
            linkTypeId, ctx.nodeId(),
            targetSourceCode, targetType, targetKey,
            ctx.userId(), ctx.txId(), linkLogicalId);
        return ActionResult.ok("linkId", linkId);
    }
}
