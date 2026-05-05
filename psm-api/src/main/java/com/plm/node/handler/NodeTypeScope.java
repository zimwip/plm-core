package com.plm.node.handler;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ActionNodeContextPort;
import com.plm.shared.action.ActionScope;
import com.plm.platform.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * NODE_TYPE scope — expects a single nodeTypeId path segment.
 * Used for actions that target a node type rather than an existing node
 * (e.g. CREATE_NODE).
 */
@Component
public class NodeTypeScope implements ActionScope {

    @Override
    public String code() {
        return "NODE_TYPE";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of(new ScopeSegment("nodeTypeId", "Target node type identifier", true));
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        if (pathIds.isEmpty()) {
            throw new IllegalArgumentException("NODE_TYPE scope requires a nodeTypeId path segment");
        }
        String nodeTypeId = pathIds.get(0);
        return new ActionContext(null, nodeTypeId, actionId, actionCode, null, userId, null,
                Map.of("nodeTypeId", nodeTypeId));
    }

    @Override
    public Optional<ActionNodeContextPort.NodeCtx> resolveNodeCtx(
            Map<String, String> ids, String userId, ActionNodeContextPort port) {
        String nodeTypeId = ids.get("nodeTypeId");
        if (nodeTypeId == null) return Optional.empty();
        return Optional.of(new ActionNodeContextPort.NodeCtx(null, nodeTypeId, null, false, false));
    }
}
