package com.plm.platform.action;

import java.util.Map;

/**
 * Result returned by an ActionHandler.
 *
 * @param status  "OK" or "BLOCKED"
 * @param data    payload — either a Map&lt;String,Object&gt; or a typed DTO record
 */
public record ActionResult(String status, Object data) {

    public static ActionResult ok(Object data) {
        return new ActionResult("OK", data);
    }

    public static ActionResult ok(String key, Object value) {
        return new ActionResult("OK", Map.of(key, value));
    }
}
