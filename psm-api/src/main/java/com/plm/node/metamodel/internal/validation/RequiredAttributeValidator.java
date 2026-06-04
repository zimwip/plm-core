package com.plm.node.metamodel.internal.validation;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;
import java.util.Map;

/**
 * Required attribute validator — the value must not be empty.
 *
 * Attach an instance of this to a (node type, attribute, state) to make the
 * attribute mandatory via the pluggable validator mechanism, alongside (or
 * instead of) the state-rule {@code required} flag.
 */
@AlgorithmBean(code = "required_attribute_validator",
    name = "Required Attribute Validator",
    description = "Validates that an attribute value is present (not empty)")
public class RequiredAttributeValidator implements AttributeValidator {

    @Override
    public String code() { return "required_attribute_validator"; }

    @Override
    public List<GuardViolation> validate(AttributeValidationContext ctx) {
        if (ctx.value() != null && !ctx.value().isBlank()) return List.of();
        return List.of(new GuardViolation(
            "REQUIRED",
            "Attribute '" + ctx.attributeCode() + "' is required",
            GuardEffect.BLOCK,
            ctx.attributeCode()));
    }

    @Override
    public Map<String, Object> hint(AttributeHintContext ctx) {
        return Map.of("required", true, "description", "Value is required");
    }
}
