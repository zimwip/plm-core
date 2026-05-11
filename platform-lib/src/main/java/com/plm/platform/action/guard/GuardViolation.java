package com.plm.platform.action.guard;

import java.util.Map;

/**
 * Structured result from a guard evaluation failure.
 *
 * @param code       algorithm code, e.g. "not_frozen", "all_required_filled"
 * @param message    human-readable violation message
 * @param effect     HIDE or BLOCK (from the guard attachment, not the guard itself)
 * @param fieldRef   optional attribute/field reference (e.g. "title" for missing required field)
 * @param details    extra context for the UI (field names, counts, etc.)
 */
public record GuardViolation(
    String code,
    String message,
    GuardEffect effect,
    String fieldRef,
    Map<String, Object> details
) {
    public GuardViolation(String code, String message, GuardEffect effect) {
        this(code, message, effect, null, Map.of());
    }

    public GuardViolation(String code, String message, GuardEffect effect, String fieldRef) {
        this(code, message, effect, fieldRef, Map.of());
    }
}
