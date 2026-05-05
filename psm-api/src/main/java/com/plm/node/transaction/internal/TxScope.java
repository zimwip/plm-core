package com.plm.node.transaction.internal;

import com.plm.platform.action.ActionContext;
import com.plm.shared.action.ActionScope;
import com.plm.platform.action.ScopeSegment;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * TX scope — expects a single txId path segment.
 */
@Component
public class TxScope implements ActionScope {

    @Override
    public String code() {
        return "TX";
    }

    @Override
    public List<ScopeSegment> segments() {
        return List.of(new ScopeSegment("txId", "Transaction identifier", true));
    }

    @Override
    public ActionContext resolve(String actionId, String actionCode, String userId,
                                 List<String> pathIds, Map<String, String> params) {
        if (pathIds.isEmpty()) {
            throw new IllegalArgumentException("TX scope requires a txId path segment");
        }
        String txId = pathIds.get(0);
        return new ActionContext(null, null, actionId, actionCode, null, userId, txId,
                Map.of("txId", txId));
    }
}
