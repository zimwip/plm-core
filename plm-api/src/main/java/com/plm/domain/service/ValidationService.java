package com.plm.domain.service;

import com.plm.domain.exception.PlmFunctionalException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Validation des attributs selon les règles du méta-modèle.
 *
 * Règles appliquées :
 *  1. AttributeStateRule → required/editable selon l'état cible
 *  2. naming_regex       → validation du format de valeur
 *  3. allowed_values     → validation enum
 *  4. Attributs non éditables dans l'état courant ne peuvent pas être modifiés
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationService {

    private final DSLContext dsl;

    /**
     * Valide les attributs pour un état cible donné.
     * Lance une ValidationException si des règles sont violées.
     */
    public void validateAttributesForState(
        String nodeId,
        String targetStateId,
        Map<String, String> newAttributes,
        Record currentVersion
    ) {
        List<String> errors = new ArrayList<>();

        // Récupère le node_type du noeud
        String nodeTypeId = dsl.select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);

        // Récupère toutes les définitions d'attributs pour ce type
        List<Record> attrDefs = dsl.select()
            .from("attribute_definition ad")
            .where("ad.node_type_id = ?", nodeTypeId)
            .fetch();

        // Récupère les valeurs actuelles de la version courante
        Map<String, String> currentValues = new java.util.HashMap<>();
        if (currentVersion != null) {
            String prevVersionId = currentVersion.get("id", String.class);
            dsl.select()
               .from("node_version_attribute")
               .where("node_version_id = ?", prevVersionId)
               .fetch()
               .forEach(r -> currentValues.put(
                   r.get("attribute_def_id", String.class),
                   r.get("value", String.class)
               ));
        }

        String currentStateId = currentVersion != null
            ? currentVersion.get("lifecycle_state_id", String.class)
            : null;

        for (Record attrDef : attrDefs) {
            String attrId    = attrDef.get("id", String.class);
            String attrName  = attrDef.get("name", String.class);
            String newValue  = newAttributes.get(attrId);
            String currValue = currentValues.get(attrId);
            String effectiveValue = newValue != null ? newValue : currValue;

            // -- Règle dans l'état courant : éditable ?
            if (currentStateId != null && newValue != null) {
                Record currentRule = getStateRule(attrId, currentStateId);
                if (currentRule != null) {
                    int editable = currentRule.get("editable", Integer.class);
                    if (editable == 0) {
                        errors.add("Attribute '" + attrName + "' is not editable in current state");
                        continue;
                    }
                }
            }

            // -- Règle dans l'état cible : required ?
            Record targetRule = getStateRule(attrId, targetStateId);
            boolean requiredByState = targetRule != null
                && targetRule.get("required", Integer.class) == 1;
            boolean requiredGlobal  = attrDef.get("required", Integer.class) == 1;

            if ((requiredByState || requiredGlobal)
                && (effectiveValue == null || effectiveValue.isBlank())) {
                errors.add("Attribute '" + attrName + "' is required for state transition");
            }

            // -- Validation naming regex
            String regex = attrDef.get("naming_regex", String.class);
            if (regex != null && effectiveValue != null && !effectiveValue.isBlank()) {
                if (!effectiveValue.matches(regex)) {
                    errors.add("Attribute '" + attrName + "' does not match naming rule: " + regex);
                }
            }

            // -- Validation enum
            String dataType = attrDef.get("data_type", String.class);
            String allowedValuesJson = attrDef.get("allowed_values", String.class);
            if ("ENUM".equals(dataType) && effectiveValue != null && allowedValuesJson != null) {
                if (!allowedValuesJson.contains("\"" + effectiveValue + "\"")) {
                    errors.add("Attribute '" + attrName + "' value '" + effectiveValue + "' is not allowed");
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException(errors);
        }
    }

    // -------------------------------------------------------
    // Collect-only methods (never throw — used at commit time)
    // -------------------------------------------------------

    /**
     * Collecte les violations de contenu pour un noeud dans un état donné.
     * Ne lance jamais d'exception — retourne la liste des violations.
     *
     * Vérifie : required (global + state rule), naming_regex, allowed_values.
     * Ignore les attributs invisibles dans cet état.
     * N'évalue PAS l'éditabilité (c'est fait au moment de la sauvegarde, pas du commit).
     */
    public List<String> collectContentViolations(String nodeId, String stateId,
                                                  Map<String, String> attrs) {
        List<String> violations = new ArrayList<>();

        String nodeTypeId = dsl.select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);

        if (nodeTypeId == null) return violations;

        List<Record> attrDefs = dsl.select()
            .from("attribute_definition ad")
            .where("ad.node_type_id = ?", nodeTypeId)
            .fetch();

        for (Record attr : attrDefs) {
            String attrId   = attr.get("id",   String.class);
            String attrName = attr.get("name",  String.class);

            Record rule = (stateId != null) ? getStateRule(attrId, stateId) : null;

            // Skip invisible attributes
            if (rule != null && rule.get("visible", Integer.class) == 0) continue;

            String value = attrs != null ? attrs.get(attrId) : null;

            boolean requiredByState = rule != null && rule.get("required", Integer.class) == 1;
            boolean requiredGlobal  = attr.get("required", Integer.class) == 1;

            if ((requiredByState || requiredGlobal) && (value == null || value.isBlank())) {
                violations.add("Attribute '" + attrName + "' is required");
            }

            // naming_regex
            String regex = attr.get("naming_regex", String.class);
            if (regex != null && value != null && !value.isBlank()) {
                if (!value.matches(regex)) {
                    violations.add("Attribute '" + attrName + "' does not match naming rule: " + regex);
                }
            }

            // enum allowed_values
            String dataType          = attr.get("data_type",      String.class);
            String allowedValuesJson = attr.get("allowed_values", String.class);
            if ("ENUM".equals(dataType) && value != null && !value.isBlank() && allowedValuesJson != null) {
                if (!allowedValuesJson.contains("\"" + value + "\"")) {
                    violations.add("Attribute '" + attrName + "' value '" + value + "' is not allowed");
                }
            }
        }

        return violations;
    }

    /**
     * Collecte les violations pour une version donnée en chargeant ses attributs depuis la base.
     */
    public List<String> collectVersionViolations(String nodeId, String versionId, String stateId) {
        Map<String, String> attrs = new HashMap<>();
        dsl.select()
           .from("node_version_attribute")
           .where("node_version_id = ?", versionId)
           .fetch()
           .forEach(r -> attrs.put(
               r.get("attribute_def_id", String.class),
               r.get("value", String.class)
           ));
        return collectContentViolations(nodeId, stateId, attrs);
    }

    private Record getStateRule(String attrId, String stateId) {
        return dsl.select()
            .from("attribute_state_rule")
            .where("attribute_definition_id = ?", attrId)
            .and("lifecycle_state_id = ?", stateId)
            .fetchOne();
    }

    // -------------------------------------------------------

    public static class ValidationException extends PlmFunctionalException {
        private final List<String> errors;

        public ValidationException(List<String> errors) {
            super(errors.size() + " validation error(s)", 422);
            this.errors = errors;
        }

        public List<String> getErrors() {
            return errors;
        }
    }
}
