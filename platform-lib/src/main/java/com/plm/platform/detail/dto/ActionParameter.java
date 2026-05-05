package com.plm.platform.detail.dto;

import java.util.List;

/**
 * One input rendered in the form an {@link ActionDescriptor} exposes.
 *
 * @param name        request key
 * @param label       form label
 * @param widget      rendering hint: {@code text}, {@code multiline},
 *                    {@code number}, {@code boolean}, {@code select},
 *                    {@code file}. Unknown → {@code text}.
 * @param required    fail submit if missing
 * @param defaultValue optional default
 * @param options     choice list for {@code select} widgets
 * @param hint        inline help
 */
public record ActionParameter(
    String name,
    String label,
    String widget,
    boolean required,
    Object defaultValue,
    List<Choice> options,
    String hint
) {
    public ActionParameter {
        if (widget == null || widget.isBlank()) widget = "text";
        if (options == null) options = List.of();
    }

    public record Choice(String value, String label) {}
}
