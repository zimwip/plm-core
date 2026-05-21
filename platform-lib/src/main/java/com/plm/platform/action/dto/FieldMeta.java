package com.plm.platform.action.dto;

/**
 * Static field descriptor for one field of an item type.
 * Loaded once per type (cached), not repeated per instance.
 * Instance-computed concerns (value, editable, required) live in {@link FieldValue}.
 *
 * @param name         stable key, matches {@link FieldValue#name()}
 * @param label        human label
 * @param dataType     semantic type (STRING, NUMBER, DATE, BOOLEAN, POSITION, …); null = unspecified
 * @param widget       rendering hint: text|multiline|number|datetime|code|link|image|badge
 * @param hint         optional inline help text
 * @param group        section/group name; null = top-level embedded field
 * @param displayOrder sort order within the group
 */
public record FieldMeta(
    String name,
    String label,
    String dataType,
    String widget,
    String hint,
    String group,
    int displayOrder
) {}
