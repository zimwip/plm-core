package com.cad.algorithm;

import java.util.Map;

public record ImportDecision(
        Action action,
        String nodeTypeId,        // for CREATE
        String targetNodeId,      // for UPDATE (existing PSM node UUID)
        String logicalId,         // derived PSM logicalId
        Map<String, String> attributes,
        String rejectReason
) {
    public enum Action { REJECT, CREATE, UPDATE, SKIP }

    public static ImportDecision create(String nodeTypeId, String logicalId, Map<String, String> attrs) {
        return new ImportDecision(Action.CREATE, nodeTypeId, null, logicalId, attrs, null);
    }

    public static ImportDecision update(String targetNodeId, Map<String, String> attrs) {
        return new ImportDecision(Action.UPDATE, null, targetNodeId, null, attrs, null);
    }

    public static ImportDecision skip() {
        return new ImportDecision(Action.SKIP, null, null, null, Map.of(), null);
    }

    public static ImportDecision reject(String reason) {
        return new ImportDecision(Action.REJECT, null, null, null, Map.of(), reason);
    }
}
