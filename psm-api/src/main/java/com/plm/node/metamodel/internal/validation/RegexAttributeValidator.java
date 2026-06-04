package com.plm.node.metamodel.internal.validation;

import com.plm.platform.algorithm.AlgorithmBean;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;

import java.util.List;
import java.util.Map;

/**
 * Regex attribute validator. The pattern is read from the attribute's
 * entity_metadata under the key given by the {@code metadataKey} instance
 * parameter (default {@code validation.regex}).
 */
@AlgorithmBean(code = "regex_attribute_validator",
    name = "Regex Attribute Validator",
    description = "Validates an attribute value against a regex pattern from attribute metadata")
public class RegexAttributeValidator implements AttributeValidator {

    @Override
    public String code() { return "regex_attribute_validator"; }

    @Override
    public List<GuardViolation> validate(AttributeValidationContext ctx) {
        // Blank is an emptiness concern (Required validator), not a pattern one.
        if (ctx.value() == null || ctx.value().isBlank()) return List.of();

        String key   = ctx.parameters().getOrDefault("metadataKey", "validation.regex");
        String regex = ctx.attributeMetadata().get(key);
        if (regex == null || regex.isBlank()) return List.of();

        if (!ctx.value().matches(regex)) {
            return List.of(new GuardViolation(
                "NAMING_REGEX",
                "Attribute '" + ctx.attributeCode() + "' does not match rule: " + regex,
                GuardEffect.BLOCK,
                ctx.attributeCode()));
        }
        return List.of();
    }

    @Override
    public Map<String, Object> hint(AttributeHintContext ctx) {
        String key   = ctx.parameters().getOrDefault("metadataKey", "validation.regex");
        String regex = ctx.attributeMetadata().get(key);
        if (regex == null || regex.isBlank()) return Map.of();
        return Map.of("regex", regex, "description", "Must match pattern: " + regex);
    }
}
