package com.plm.platform.action.dto;

import java.util.List;

/**
 * One input rendered in the form an {@link ActionDescriptor} exposes.
 *
 * @param name            request key
 * @param label           form label
 * @param widget          rendering hint: {@code text}, {@code multiline},
 *                        {@code number}, {@code boolean}, {@code select},
 *                        {@code file}. Unknown → {@code text}.
 * @param required        fail submit if missing
 * @param defaultValue    optional default
 * @param options         choice list for {@code select} widgets
 * @param hint            inline help
 * @param validationRegex optional client-side validation regex
 */
public record ActionParameter(
    String name,
    String label,
    String widget,
    boolean required,
    Object defaultValue,
    List<Choice> options,
    String hint,
    String validationRegex
) {
    public ActionParameter {
        if (widget == null || widget.isBlank()) widget = "text";
        if (options == null) options = List.of();
    }

    public ActionParameter(String name, String label, String widget, boolean required,
                           Object defaultValue, List<Choice> options, String hint) {
        this(name, label, widget, required, defaultValue, options, hint, null);
    }

    public record Choice(String value, String label) {}
}
