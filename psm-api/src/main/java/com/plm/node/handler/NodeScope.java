package com.plm.node.handler;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionScope;
import com.plm.shared.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * NODE scope — expects a single nodeId path segment.
 */
@Component
public class NodeScope implements ActionScope {

    @Override
    public String code() {
        return "NODE";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of(new ScopeSegment("nodeId", "Target node identifier", true));
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        if (pathIds.isEmpty()) {
            throw new IllegalArgumentException("NODE scope requires a nodeId path segment");
        }
        String nodeId = pathIds.get(0);
        return new ActionContext(nodeId, null, actionId, actionCode, null, userId, null,
                Map.of("nodeId", nodeId));
    }
}
