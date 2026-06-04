package com.plm.node.metamodel.internal.validation;

import java.util.Map;

/**
 * Context passed to an {@link AttributeValidator#hint} call to build UI hints and
 * node-context-dependent per-field contributions.
 *
 * <p>The node-context fields ({@code nodeId}, {@code value}, {@code allValues}) are
 * populated when building a concrete object's description, and are {@code null}/empty
 * for type-level (cacheable) hint resolution.
 *
 * @param nodeTypeId        the node's type
 * @param stateId           lifecycle state (null = all states)
 * @param attributeCode     attribute code
 * @param parameters        algorithm instance parameters
 * @param attributeMetadata entity_metadata slice for this attribute (metaKey -> value)
 * @param nodeId            the node being described (null at type level)
 * @param value             this attribute's current value (null at type level)
 * @param allValues         all current attribute values of the node (empty at type level)
 */
public record AttributeHintContext(
    String nodeTypeId,
    String stateId,
    String attributeCode,
    Map<String, String> parameters,
    Map<String, String> attributeMetadata,
    String nodeId,
    String value,
    Map<String, String> allValues
) {}
