package com.plm.platform.item.dto;

/**
 * How to reach an item's detail endpoint. The frontend substitutes
 * {@code {id}} in {@link #path} with the selected item's id (or the
 * itemKey-equivalent identifier the source publishes).
 *
 * <p>Mirrors {@link ListAction} for the single-item axis: list endpoints
 * return JSON arrays that the navigation panel renders, get endpoints
 * return a {@link com.plm.platform.detail.dto.DetailDescriptor} that the
 * editor renders directly.
 *
 * @param httpMethod       always {@code GET} today; reserved for future verbs
 * @param path             gateway-relative path, e.g. {@code /data/{id}/detail}
 * @param name             human-readable action name (aligned with PSM action schema)
 * @param description      human-readable description of what this action does
 * @param displayCategory  UI hint: {@code "PRIMARY"}, {@code "SECONDARY"}, or {@code "DANGEROUS"}
 * @param displayOrder     ordering hint within a category (lower = first)
 */
public record GetAction(
    String httpMethod,
    String path,
    String name,
    String description,
    String displayCategory,
    int displayOrder
) {}
