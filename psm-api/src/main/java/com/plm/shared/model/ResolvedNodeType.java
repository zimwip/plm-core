package com.plm.shared.model;

import java.util.List;

/**
 * Fully resolved node type, including merged attributes from the inheritance chain.
 * Built by MetaModelCache.
 *
 * @param ancestorChain ordered list starting with this type's id, followed by
 *                      parent, grandparent, etc.
 * @param attributes    merged attribute list: own attributes first (inherited=false),
 *                      then inherited from parents (inherited=true), sorted by display_order.
 *                      Child attributes shadow parent attributes with the same name.
 */
public record ResolvedNodeType(
    String id,
    String name,
    String description,
    String lifecycleId,
    String logicalIdLabel,
    String logicalIdPattern,
    String numberingScheme,
    String versionPolicy,
    boolean collapseHistory,
    String color,
    String icon,
    String parentNodeTypeId,
    List<String> ancestorChain,
    List<ResolvedAttribute> attributes
) {}
