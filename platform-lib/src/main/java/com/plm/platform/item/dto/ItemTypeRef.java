package com.plm.platform.item.dto;

import java.util.Objects;

/**
 * Stable type identity for any PLM item.
 *
 * <p>Mirrors the {@link ItemDescriptor} identity tuple {@code (serviceCode,
 * itemCode, itemKey)} so that a {@link com.plm.platform.action.dto.DetailDescriptor}
 * can self-describe which type it represents — needed by generic navigation
 * and basket components that must route an item back to its descriptor without
 * relying on call-site context.
 *
 * @param serviceCode  owner service ({@code psm}, {@code dst}, ...)  — required
 * @param itemCode     namespace within the service ({@code node}, {@code data-object}) — required
 * @param itemKey      optional sub-key; same as {@link ItemDescriptor#itemKey()} —
 *                     e.g. the nodeType id for PSM nodes; {@code null} when the
 *                     service has no sub-types
 */
public record ItemTypeRef(String serviceCode, String itemCode, String itemKey) {
    public ItemTypeRef {
        Objects.requireNonNull(serviceCode, "ItemTypeRef.serviceCode must not be null");
        Objects.requireNonNull(itemCode,    "ItemTypeRef.itemCode must not be null");
    }
}
