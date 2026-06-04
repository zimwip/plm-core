package com.plm.node.metamodel.internal.validation;

import com.plm.platform.algorithm.AlgorithmType;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;
import java.util.Map;

/**
 * Attribute validator — evaluates a single attribute value at the cross of
 * node type, attribute and lifecycle state. Pluggable algorithm type that
 * mirrors {@code LifecycleGuard}: regex / enum / future custom rules become
 * {@code @AlgorithmBean} implementations attached via {@code entity_metadata}.
 */
@AlgorithmType(id = "algtype-attribute-validator",
    name = "Attribute Validator",
    description = "Validates an attribute value at the cross of node type, attribute and lifecycle state")
public interface AttributeValidator {

    String code();

    /** Returns violations for the given context. Empty list = OK. */
    List<GuardViolation> validate(AttributeValidationContext ctx);

    /** UI hint metadata (e.g. {@code regex}, {@code allowedValues}). Default: none. */
    default Map<String, Object> hint(AttributeHintContext ctx) {
        return Map.of();
    }
}
