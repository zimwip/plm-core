package com.plm.domain.action;

import java.util.Map;

/**
 * Result returned by an ActionHandler.
 *
 * @param status  "OK" or "BLOCKED"
 * @param data    arbitrary key-value payload (versionId, txId, signatureId, …)
 */
public record ActionResult(String status, Map<String, Object> data) {

    public static ActionResult ok(Map<String, Object> data) {
        return new ActionResult("OK", data);
    }

    public static ActionResult ok(String key, Object value) {
        return new ActionResult("OK", Map.of(key, value));
    }
}
