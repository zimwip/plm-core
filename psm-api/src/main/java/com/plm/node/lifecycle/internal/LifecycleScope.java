package com.plm.node.lifecycle.internal;

import com.plm.shared.action.ActionContext;
import com.plm.shared.action.ActionScope;
import com.plm.shared.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * LIFECYCLE scope — expects nodeId + transitionId path segments.
 */
@Component
public class LifecycleScope implements ActionScope {

    @Override
    public String code() {
        return "LIFECYCLE";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of(
                new ScopeSegment("nodeId", "Target node identifier", true),
                new ScopeSegment("transitionId", "Lifecycle transition to apply", true));
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        if (pathIds.size() < 2) {
            throw new IllegalArgumentException(
                    "LIFECYCLE scope requires nodeId and transitionId path segments");
        }
        String nodeId = pathIds.get(0);
        String transitionId = pathIds.get(1);
        return new ActionContext(nodeId, null, actionId, actionCode, transitionId, userId, null,
                Map.of("nodeId", nodeId, "transitionId", transitionId));
    }
}
