package com.plm.node.metamodel.internal;

import com.plm.shared.exception.PlmFunctionalException;
import com.plm.shared.model.ResolvedAttribute;
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
    private final MetaModelCache metaModelCache;

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

        // Resolved attributes (own + inherited) from cache + domain attributes
        var resolvedType = metaModelCache.get(nodeTypeId);
        List<ResolvedAttribute> attrDefs = new ArrayList<>(resolvedType != null
            ? resolvedType.attributes()
            : List.of());
        // Add domain attributes if node version is known
        if (currentVersion != null) {
            String cvId = currentVersion.get("id", String.class);
            dsl.select().from("node_version_domain").where("node_version_id = ?", cvId)
               .fetch().forEach(r -> attrDefs.addAll(
                   metaModelCache.getDomainAttributes(r.get("domain_id", String.class))));
        }

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

        for (ResolvedAttribute attrDef : attrDefs) {
            String attrId    = attrDef.id();
            String attrName  = attrDef.name();
            String newValue  = newAttributes.get(attrId);
            String currValue = currentValues.get(attrId);
            String effectiveValue = newValue != null ? newValue : currValue;

            // -- Règle dans l'état courant : éditable ?
            if (currentStateId != null && newValue != null) {
                Record currentRule = metaModelCache.getStateRule(nodeTypeId, attrId, currentStateId);
                if (currentRule != null) {
                    int editable = currentRule.get("editable", Integer.class);
                    if (editable == 0) {
                        errors.add("Attribute '" + attrName + "' is not editable in current state");
                        continue;
                    }
                }
            }

            // -- Règle dans l'état cible : required ?
            Record targetRule = metaModelCache.getStateRule(nodeTypeId, attrId, targetStateId);
            boolean requiredByState = targetRule != null
                && targetRule.get("required", Integer.class) == 1;
            boolean requiredGlobal  = attrDef.required();

            if ((requiredByState || requiredGlobal)
                && (effectiveValue == null || effectiveValue.isBlank())) {
                errors.add("Attribute '" + attrName + "' is required for state transition");
            }

            // -- Validation naming regex
            String regex = attrDef.namingRegex();
            if (regex != null && effectiveValue != null && !effectiveValue.isBlank()) {
                if (!effectiveValue.matches(regex)) {
                    errors.add("Attribute '" + attrName + "' does not match naming rule: " + regex);
                }
            }

            // -- Validation enum
            String dataType = attrDef.dataType();
            String allowedValuesJson = attrDef.allowedValues();
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

        // Fetch node + node_type in one query to get identity fields
        Record nodeInfo = dsl.fetchOne("""
            SELECT n.node_type_id, n.logical_id,
                   nt.logical_id_pattern, nt.logical_id_label
            FROM node n
            JOIN node_type nt ON nt.id = n.node_type_id
            WHERE n.id = ?
            """, nodeId);

        if (nodeInfo == null) return violations;

        String nodeTypeId = nodeInfo.get("node_type_id", String.class);

        // --- Identity validation: logical_id vs logical_id_pattern ---
        String logicalId        = nodeInfo.get("logical_id",         String.class);
        String logicalIdPattern = nodeInfo.get("logical_id_pattern", String.class);
        String logicalIdLabel   = nodeInfo.get("logical_id_label",   String.class);
        if (logicalIdLabel == null || logicalIdLabel.isBlank()) logicalIdLabel = "Identifier";

        if (logicalIdPattern != null && !logicalIdPattern.isBlank()
                && logicalId != null && !logicalId.isBlank()
                && !logicalId.matches(logicalIdPattern)) {
            violations.add("'" + logicalIdLabel + "' value '" + logicalId
                           + "' does not match pattern: " + logicalIdPattern);
        }

        // Use cache for effective attributes (own + inherited) + domain attributes
        var resolvedType = metaModelCache.get(nodeTypeId);
        List<ResolvedAttribute> attrDefs = new ArrayList<>(resolvedType != null
            ? resolvedType.attributes()
            : List.of());

        for (ResolvedAttribute attr : attrDefs) {
            String attrId   = attr.id();
            String attrName = attr.name();

            Record rule = (stateId != null)
                ? metaModelCache.getStateRule(nodeTypeId, attrId, stateId)
                : null;

            // Skip invisible attributes
            if (rule != null && rule.get("visible", Integer.class) == 0) continue;

            String value = attrs != null ? attrs.get(attrId) : null;

            boolean requiredByState = rule != null && rule.get("required", Integer.class) == 1;
            boolean requiredGlobal  = attr.required();

            if ((requiredByState || requiredGlobal) && (value == null || value.isBlank())) {
                violations.add("Attribute '" + attrName + "' is required");
            }

            // naming_regex
            String regex = attr.namingRegex();
            if (regex != null && value != null && !value.isBlank()) {
                if (!value.matches(regex)) {
                    violations.add("Attribute '" + attrName + "' does not match naming rule: " + regex);
                }
            }

            // enum allowed_values
            String dataType          = attr.dataType();
            String allowedValuesJson = attr.allowedValues();
            if ("ENUM".equals(dataType) && value != null && !value.isBlank() && allowedValuesJson != null) {
                if (!allowedValuesJson.contains("\"" + value + "\"")) {
                    violations.add("Attribute '" + attrName + "' value '" + value + "' is not allowed");
                }
            }
        }

        return violations;
    }

    /**
     * Collecte les violations pour une version donnée — résout automatiquement l'état.
     */
    public List<String> collectVersionViolations(String nodeId, String versionId) {
        String stateId = dsl.select().from("node_version")
            .where("id = ?", versionId)
            .fetchOne("lifecycle_state_id", String.class);
        return collectVersionViolations(nodeId, versionId, stateId);
    }

    /**
     * Collecte les violations pour une version donnée en chargeant ses attributs depuis la base.
     * Also loads domain attributes for the version.
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
        List<String> violations = collectContentViolations(nodeId, stateId, attrs);

        // Also validate domain attributes
        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        List<ResolvedAttribute> domainAttrDefs = new ArrayList<>();
        dsl.select().from("node_version_domain").where("node_version_id = ?", versionId)
           .fetch().forEach(r -> domainAttrDefs.addAll(
               metaModelCache.getDomainAttributes(r.get("domain_id", String.class))));

        for (ResolvedAttribute attr : domainAttrDefs) {
            org.jooq.Record rule = (stateId != null)
                ? metaModelCache.getStateRule(nodeTypeId, attr.id(), stateId)
                : null;
            if (rule != null && rule.get("visible", Integer.class) == 0) continue;
            String value = attrs.get(attr.id());
            boolean requiredByState = rule != null && rule.get("required", Integer.class) == 1;
            boolean requiredGlobal = attr.required();
            if ((requiredByState || requiredGlobal) && (value == null || value.isBlank())) {
                violations.add("Attribute '" + attr.name() + "' is required");
            }
        }
        return violations;
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
