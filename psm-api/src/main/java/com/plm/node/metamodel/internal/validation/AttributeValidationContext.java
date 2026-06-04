package com.plm.node.metamodel.internal.validation;

import java.util.Map;

/**
 * Context passed to an {@link AttributeValidator} during evaluation.
 *
 * @param nodeId            the node being validated (may be null — not required by regex/enum)
 * @param nodeTypeId        the node's type
 * @param stateId           current lifecycle state ({@code _} / null = all states)
 * @param attributeCode     attribute code being validated
 * @param value             attribute value (may be null/blank)
 * @param allValues         all submitted attribute values (key = attribute code)
 * @param parameters        algorithm instance parameters
 * @param attributeMetadata entity_metadata slice for this attribute (metaKey -> value)
 */
public record AttributeValidationContext(
    String nodeId,
    String nodeTypeId,
    String stateId,
    String attributeCode,
    String value,
    Map<String, String> allValues,
    Map<String, String> parameters,
    Map<String, String> attributeMetadata
) {}
