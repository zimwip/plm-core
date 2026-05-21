package com.plm.platform.action.dto;

import com.plm.platform.item.dto.ItemTypeRef;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Static type schema for one item type. Fetched once at application start (or on
 * first use) and cached until a CONFIG_CHANGED event invalidates it.
 * Changes only when an administrator modifies the type configuration.
 *
 * <p>Per-instance runtime data lives in {@link DetailDescriptor}. Type-level
 * display concerns (icon, color, which field is the title) live here.
 *
 * <p>All services expose this via {@code GET /api/{serviceCode}/item-type/{key}}
 * where {@code key = itemKey ?? itemCode}.
 *
 * @param itemType       type identity
 * @param displayName    human name for the type
 * @param icon           lucide icon hint
 * @param color          accent colour
 * @param titleField     name of the {@link FieldValue} to use as the item header
 * @param subtitleField  name of the {@link FieldValue} for the muted sub-header (nullable)
 * @param fields         ordered static field definitions
 * @param staticMetadata service-specific type constants (e.g. logicalIdLabel, lifecycleId,
 *                       per-field enrichments keyed by field name)
 */
public record ItemTypeDescriptor(
    ItemTypeRef itemType,
    String displayName,
    String icon,
    String color,
    String titleField,
    String subtitleField,
    List<FieldMeta> fields,
    Map<String, Object> staticMetadata
) {
    public ItemTypeDescriptor {
        Objects.requireNonNull(itemType, "ItemTypeDescriptor.itemType must not be null");
        if (fields == null) fields = List.of();
        if (staticMetadata == null) staticMetadata = Map.of();
    }
}
