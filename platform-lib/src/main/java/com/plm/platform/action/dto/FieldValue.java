package com.plm.platform.action.dto;

import java.util.Map;

/**
 * Per-instance value for one field. Paired with {@link FieldMeta} (keyed by {@link #name()})
 * from the item type descriptor to produce a complete rendered field.
 *
 * <p>Per-instance qualifiers (notably {@code editable} and {@code required}) live in
 * {@link #extras} — contributed at build time from pluggable attribute validators and
 * node context. There are no dedicated {@code editable}/{@code required} fields anymore.
 *
 * @param name   stable key — matches {@link FieldMeta#name()} in the type descriptor
 * @param value  serialised value (string, number, boolean, or array)
 * @param extras generic per-field extension — arbitrary key/values (e.g. {@code editable},
 *               {@code required}, regex hints, computed values). Never null.
 */
public record FieldValue(
    String name,
    Object value,
    Map<String, Object> extras
) {
    public FieldValue {
        if (extras == null) extras = Map.of();
    }

    public FieldValue(String name, Object value) {
        this(name, value, Map.of());
    }

    /**
     * Back-compat constructor: folds the former {@code editable}/{@code required}
     * fields into {@link #extras}.
     */
    public FieldValue(String name, Object value, boolean editable, boolean required) {
        this(name, value, Map.of("editable", editable, "required", required));
    }
}
