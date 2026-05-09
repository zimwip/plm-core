package com.plm.cad;

import java.util.Map;

public record NodeValidationResult(
    boolean valid,
    String rejectReason,
    String suggestedNodeTypeId,
    Map<String, String> enrichedAttributes
) {
    public static NodeValidationResult accept(String suggestedNodeTypeId, Map<String, String> attributes) {
        return new NodeValidationResult(true, null, suggestedNodeTypeId, attributes);
    }

    public static NodeValidationResult reject(String reason) {
        return new NodeValidationResult(false, reason, null, Map.of());
    }
}
