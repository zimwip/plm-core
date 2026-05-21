package com.plm.platform.action.dto;

/**
 * Per-instance value for one field. Paired with {@link FieldMeta} (keyed by {@link #name()})
 * from the item type descriptor to produce a complete rendered field.
 *
 * @param name     stable key — matches {@link FieldMeta#name()} in the type descriptor
 * @param value    serialised value (string, number, boolean, or array)
 * @param editable inline-edit controls enabled (depends on lock, tx state, permissions)
 * @param required value must be present before commit (computed per instance from state/role rules)
 */
public record FieldValue(
    String name,
    Object value,
    boolean editable,
    boolean required
) {}
