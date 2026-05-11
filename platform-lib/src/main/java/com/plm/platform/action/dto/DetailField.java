package com.plm.platform.action.dto;

/**
 * One field in a {@link DetailDescriptor}. The frontend renders fields in
 * the order they are declared, using {@link #widget} as a hint.
 *
 * <p>Standard widgets recognised by the generic detail editor:
 * <ul>
 *   <li>{@code text}      — single-line text</li>
 *   <li>{@code multiline} — multi-line text area</li>
 *   <li>{@code number}    — numeric</li>
 *   <li>{@code datetime}  — ISO-8601 date/time, formatted client-side</li>
 *   <li>{@code code}      — monospace, collapsible</li>
 *   <li>{@code link}      — clickable URL</li>
 *   <li>{@code image}     — inline preview by URL</li>
 *   <li>{@code badge}     — short coloured label</li>
 * </ul>
 * Unknown widgets fall back to {@code text}.
 *
 * @param name     stable identifier — used as a key, never displayed
 * @param label    human label
 * @param value    serialised value (string, number, boolean, or array)
 * @param widget   rendering hint, see above
 * @param editable when true the editor exposes inline-edit controls
 *                 (the action pattern still drives the actual mutation)
 * @param hint     optional inline help text
 */
public record DetailField(
    String name,
    String label,
    Object value,
    String widget,
    boolean editable,
    String hint
) {
    public DetailField(String name, String label, Object value) {
        this(name, label, value, "text", false, null);
    }

    public DetailField(String name, String label, Object value, String widget) {
        this(name, label, value, widget, false, null);
    }
}
