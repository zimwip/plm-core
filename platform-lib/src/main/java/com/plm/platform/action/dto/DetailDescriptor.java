package com.plm.platform.action.dto;

import com.plm.platform.item.dto.ItemTypeRef;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Per-instance view of one object. Contains only runtime data — values, actions,
 * and dynamic state. Static type schema (labels, widgets, display hints) is in
 * {@link ItemTypeDescriptor}, fetched once per type and cached.
 *
 * <p>The frontend derives the display header by looking up {@link ItemTypeDescriptor#titleField()}
 * in {@link #values()}, rather than reading a pre-computed title string.
 *
 * @param id       stable object identifier — required
 * @param itemType type identity — required; used to look up the {@link ItemTypeDescriptor}
 * @param values   per-instance field values (no labels or widget hints — those are in the type descriptor)
 * @param actions  buttons the user can invoke on this object
 * @param metadata dynamic instance state: lock, txStatus, lifecycle state, violations, etc.
 */
public record DetailDescriptor(
    String id,
    ItemTypeRef itemType,
    List<FieldValue> values,
    List<ActionDescriptor> actions,
    Map<String, Object> metadata
) {
    public DetailDescriptor {
        Objects.requireNonNull(id,       "DetailDescriptor.id must not be null");
        Objects.requireNonNull(itemType, "DetailDescriptor.itemType must not be null");
        if (values == null) values = List.of();
        if (actions == null) actions = List.of();
    }
}
