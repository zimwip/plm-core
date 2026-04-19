package com.plm.action.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Validates user-supplied action parameters against the schema defined in
 * action_parameter, applying action_param_override when a
 * node_type_action context is provided.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ActionParameterValidator {

    private final DSLContext  dsl;
    private final ObjectMapper mapper;

    /**
     * Validates params and returns the (possibly defaulted) map.
     * Throws {@link ValidationException} with all violations if anything is wrong.
     *
     * @param actionId    the {@code action.id}
     * @param nodeTypeId  the target node's type (for override resolution), may be null
     * @param rawParams   user-supplied parameters (may be null)
     */
    public Map<String, String> validate(String actionId, String nodeTypeId,
                                        Map<String, String> rawParams) {
        Map<String, String> params = rawParams != null ? new java.util.HashMap<>(rawParams) : new java.util.HashMap<>();

        List<Record> schema = dsl.select().from("action_parameter")
            .where("action_id = ?", actionId)
            .orderBy(org.jooq.impl.DSL.field("display_order"))
            .fetch();

        Map<String, Record> overridesByParamId = new java.util.HashMap<>();
        if (nodeTypeId != null) {
            dsl.select().from("action_param_override")
                .where("node_type_id = ?", nodeTypeId)
                .and("action_id = ?", actionId)
                .fetch()
                .forEach(ov -> overridesByParamId.put(ov.get("parameter_id", String.class), ov));
        }

        List<String> violations = new ArrayList<>();

        for (Record param : schema) {
            String name     = param.get("param_name",  String.class);
            String label    = param.get("param_label", String.class);
            String type     = param.get("data_type",   String.class);
            String regex    = param.get("validation_regex", String.class);
            String minV     = param.get("min_value",   String.class);
            String maxV     = param.get("max_value",   String.class);

            String effectiveRequired      = null;
            String effectiveDefault       = param.get("default_value",  String.class);
            String effectiveAllowedValues = param.get("allowed_values", String.class);
            int    baseRequired           = param.get("required", Integer.class);

            Record ov = overridesByParamId.get(param.get("id", String.class));
            if (ov != null) {
                if (ov.get("required",       Integer.class) != null) effectiveRequired      = String.valueOf(ov.get("required", Integer.class));
                if (ov.get("default_value",  String.class) != null)  effectiveDefault       = ov.get("default_value",  String.class);
                if (ov.get("allowed_values", String.class) != null)  effectiveAllowedValues = ov.get("allowed_values", String.class);
            }

            boolean required = effectiveRequired != null ? "1".equals(effectiveRequired) : baseRequired == 1;

            // Apply default if param absent
            String value = params.get(name);
            if ((value == null || value.isBlank()) && effectiveDefault != null) {
                params.put(name, effectiveDefault);
                value = effectiveDefault;
            }

            // Required check
            if (required && (value == null || value.isBlank())) {
                violations.add("'" + label + "' is required");
                continue;
            }

            if (value == null || value.isBlank()) continue; // optional and absent — skip further checks

            // ENUM validation
            if ("ENUM".equals(type) && effectiveAllowedValues != null) {
                try {
                    List<String> allowed = mapper.readValue(effectiveAllowedValues, new TypeReference<>() {});
                    if (!allowed.contains(value)) {
                        violations.add("'" + label + "' must be one of: " + allowed);
                    }
                } catch (Exception e) {
                    log.warn("Could not parse allowed_values for param {}: {}", name, effectiveAllowedValues);
                }
            }

            // STRING regex validation
            if ("STRING".equals(type) && regex != null && !regex.isBlank() && !value.matches(regex)) {
                violations.add("'" + label + "' does not match pattern: " + regex);
            }

            // NUMBER range validation
            if ("NUMBER".equals(type)) {
                try {
                    double num = Double.parseDouble(value);
                    if (minV != null && num < Double.parseDouble(minV))
                        violations.add("'" + label + "' must be ≥ " + minV);
                    if (maxV != null && num > Double.parseDouble(maxV))
                        violations.add("'" + label + "' must be ≤ " + maxV);
                } catch (NumberFormatException e) {
                    violations.add("'" + label + "' must be a number");
                }
            }
        }

        if (!violations.isEmpty()) throw new ValidationException(violations);
        return params;
    }

    public static class ValidationException extends com.plm.shared.exception.PlmFunctionalException {
        private final List<String> violations;
        public ValidationException(List<String> violations) {
            super("Action parameter validation failed: " + violations, 422);
            this.violations = violations;
        }
        public List<String> getViolations() { return violations; }
    }
}
