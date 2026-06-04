package com.plm.node.metamodel.internal.validation;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;
import java.util.Map;

/**
 * Editable attribute validator — marks an attribute as locked (not editable) in the
 * lifecycle state(s) it is attached to.
 *
 * <p>This is a <b>hint-only</b> validator: its presence for a (node type, attribute,
 * state) means "locked in that state", surfaced as the {@code editable:false} UI hint
 * and consulted via {@link AttributeValidatorService#isEditable}. The actual write
 * enforcement (rejecting a change to a locked attribute) stays in {@code ValidationService},
 * which alone knows which attributes the caller is changing and the node's current state —
 * so {@link #validate} returns no violations here to avoid double/incorrect blocking.
 */
@AlgorithmBean(code = "editable_attribute_validator",
    name = "Editable Attribute Validator",
    description = "Locks an attribute (not editable) in the lifecycle states it is attached to")
public class EditableAttributeValidator implements AttributeValidator {

    @Override
    public String code() { return "editable_attribute_validator"; }

    @Override
    public List<GuardViolation> validate(AttributeValidationContext ctx) {
        // Editability enforcement is performed by ValidationService (it has the
        // changed-keys + current-state context). Hint-only here.
        return List.of();
    }

    @Override
    public Map<String, Object> hint(AttributeHintContext ctx) {
        return Map.of("editable", false, "description", "Not editable in this state");
    }
}
