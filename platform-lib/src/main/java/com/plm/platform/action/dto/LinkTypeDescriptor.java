package com.plm.platform.action.dto;

import java.util.List;
import java.util.Map;

/**
 * Static schema for one link type. Fetched once per type (cached by linkTypeId),
 * invalidated on METAMODEL_CHANGED. Changes only when an administrator modifies
 * the link type configuration.
 *
 * <p>Per-instance data (linkId, linkLogicalId, attributeValues, target identity)
 * lives in the link list response. Type-level display concerns (icon, color, policy,
 * attribute definitions) live here.
 *
 * <p>Served via {@code GET /api/psm/link-type/{linkTypeId}}.
 *
 * @param id             linkTypeId (stable key)
 * @param name           human display name
 * @param icon           lucide icon hint
 * @param color          accent colour
 * @param linkPolicy     VERSION_TO_MASTER | VERSION_TO_VERSION
 * @param minCardinality minimum number of links per source node
 * @param maxCardinality maximum number of links per source node (null = unlimited)
 * @param attributes     ordered attribute definitions (reuses {@link FieldMeta})
 * @param staticMetadata type constants: linkLogicalIdLabel, linkLogicalIdPattern
 */
public record LinkTypeDescriptor(
    String id,
    String name,
    String icon,
    String color,
    String linkPolicy,
    int minCardinality,
    Integer maxCardinality,
    List<FieldMeta> attributes,
    Map<String, Object> staticMetadata
) {
    public LinkTypeDescriptor {
        if (attributes     == null) attributes     = List.of();
        if (staticMetadata == null) staticMetadata = Map.of();
    }
}
