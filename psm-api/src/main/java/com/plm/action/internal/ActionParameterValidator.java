package com.plm.action.internal;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.plm.platform.action.ActionParameterValidatorPort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.ActionConfig;
import com.plm.platform.config.dto.ActionParameterConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActionParameterValidator implements ActionParameterValidatorPort {

    private final ConfigCache  configCache;
    private final ObjectMapper mapper;

    public Map<String, String> validate(String actionId, String nodeTypeId,
                                        Map<String, String> rawParams) {
        Map<String, String> params = rawParams != null ? new HashMap<>(rawParams) : new HashMap<>();

        ActionConfig action = configCache.getActionById(actionId).orElse(null);
        List<ActionParameterConfig> schema = action != null && action.parameters() != null
            ? action.parameters() : List.of();

        List<String> violations = new ArrayList<>();

        for (ActionParameterConfig param : schema) {
            String name     = param.paramName();
            String label    = param.paramLabel();
            String type     = param.dataType();
            String regex    = param.validationRegex();
            String minV     = param.minValue();
            String maxV     = param.maxValue();

            String effectiveDefault       = param.defaultValue();
            String effectiveAllowedValues = param.allowedValues();
            boolean required              = param.required();

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
                        violations.add("'" + label + "' must be >= " + minV);
                    if (maxV != null && num > Double.parseDouble(maxV))
                        violations.add("'" + label + "' must be <= " + maxV);
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
