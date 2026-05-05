package com.plm.shared.action;

import com.plm.platform.action.ActionContext;
import com.plm.platform.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * GLOBAL scope — no path IDs expected. For permission-only or system-level actions.
 */
@Component
public class GlobalScope implements ActionScope {

    @Override
    public String code() {
        return "GLOBAL";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of();
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        return new ActionContext(null, null, actionId, actionCode, null, userId, null, Map.of());
    }
}
