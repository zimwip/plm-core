package com.plm.node.link.internal;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionNodeContextPort;
import com.plm.shared.action.ActionScope;
import com.plm.platform.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * LINK scope — expects a single linkId path segment.
 * Used for actions that target an existing link (delete_link, update_link).
 */
@Component
public class LinkScope implements ActionScope {

    @Override
    public String code() {
        return "LINK";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of(new ScopeSegment("linkId", "Target link identifier", true));
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        if (pathIds.isEmpty()) {
            throw new IllegalArgumentException("LINK scope requires a linkId path segment");
        }
        String linkId = pathIds.get(0);
        return new ActionContext(null, null, actionId, actionCode, null, userId, null,
                Map.of("linkId", linkId));
    }

    @Override
    public Optional<ActionNodeContextPort.NodeCtx> resolveNodeCtx(
            Map<String, String> ids, String userId, ActionNodeContextPort port) {
        String linkId = ids.get("linkId");
        return linkId == null ? Optional.empty() : port.resolveFromLinkId(linkId, userId);
    }
}
