package com.plm.node.metamodel.internal;

import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.shared.exception.PlmFunctionalException;
import com.plm.shared.model.ResolvedAttribute;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Two-tier attribute validation.
 *
 * <p><b>Identifier policy</b> — the attribute <em>code</em> ({@code attr.id},
 * e.g. {@code ad-ssi-zone}) is the canonical identifier across the entire chain
 * (DB column {@code attribute_def_id}, request payload keys, violation
 * {@code attrCode}). The attribute <em>label</em> (e.g. {@code "Install Zone"})
 * is for human display only and appears in {@code Violation.message} text. The
 * camelCase {@code attr.name} is never used to identify or display attributes
 * — it is a metamodel internal that does not surface in the protocol.
 *
 * <p><b>Hard tier — {@link #assertWritable}</b>: schema membership and
 * value-shape against {@code data_type}. Always blocks: prevents inconsistent
 * data from reaching the DB. Called pre-write by {@code NodeService}.
 *
 * <p><b>Soft tier — {@link #collectViolations} / {@link #assertNoViolations}</b>:
 * required, naming regex, enum allowed values, lifecycle editability, logical-id
 * pattern. Single engine; non-blocking by default (returned as feedback by
 * update), thrown by lifecycle transitions and enforced at commit by
 * {@code PlmTransactionService}'s built-in PreCommitValidator.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ValidationService {

    private final DSLContext dsl;
    private final ConfigCache configCache;
    private final MetaModelCachePort metaModelCache;

    // ====================================================================
    // HARD TIER — schema + value shape (always throws)
    // ====================================================================

    public void assertWritable(String nodeTypeId, Map<String, String> submitted, String nodeId) {
        if (submitted == null || submitted.isEmpty()) return;

        Map<String, ResolvedAttribute> known = resolveWritableScope(nodeTypeId, nodeId).stream()
            .collect(java.util.stream.Collectors.toMap(ResolvedAttribute::id, a -> a, (a, b) -> a));

        List<Violation> hard = new ArrayList<>();

        for (Map.Entry<String, String> e : submitted.entrySet()) {
            String attrCode = e.getKey();
            String value    = e.getValue();
            ResolvedAttribute attr = known.get(attrCode);

            if (attr == null) {
                String globalLabel = lookupAttributeLabelGlobally(attrCode);
                String display     = globalLabel != null ? globalLabel : attrCode;
                hard.add(new Violation(
                    "UNKNOWN_ATTRIBUTE", attrCode, globalLabel,
                    "Attribute '" + display + "' is not part of the data model"));
                continue;
            }

            if (value == null || value.isBlank()) continue;
            String shapeError = checkValueShape(attr.dataType(), value);
            if (shapeError != null) {
                hard.add(new Violation(
                    "INVALID_VALUE_TYPE", attrCode, displayLabel(attr),
                    "Attribute '" + displayLabel(attr) + "' " + shapeError));
            }
        }

        if (!hard.isEmpty()) throw new ValidationException(hard);
    }

    /** Display string for messages: {@code label} > {@code code}. The Java {@code name} is never used. */
    private static String displayLabel(ResolvedAttribute a) {
        if (a.label() != null && !a.label().isBlank()) return a.label();
        return a.id();
    }

    /**
     * Best-effort scan of all node types and domains to find an attribute by code
     * and return its declared {@code label}. Used only on the unknown-attribute
     * error path so messages can carry the human-readable label when the attr
     * exists somewhere in the model but is not bound to the current scope.
     */
    private String lookupAttributeLabelGlobally(String attrCode) {
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            if (nt.attributes() == null) continue;
            for (var a : nt.attributes()) {
                if (attrCode.equals(a.id())) {
                    return (a.label() != null && !a.label().isBlank()) ? a.label() : null;
                }
            }
        }
        for (var d : configCache.getAllDomains()) {
            for (var a : configCache.getDomainAttributes(d.id())) {
                if (attrCode.equals(a.id())) {
                    return (a.label() != null && !a.label().isBlank()) ? a.label() : null;
                }
            }
        }
        return null;
    }

    /**
     * @return null if value parses against the declared type, else a
     *         human-readable suffix ("must be a number", etc.). Permissive by
     *         default — STRING/ENUM/null types accept any non-blank value at
     *         this tier (ENUM membership is a soft check).
     */
    private static String checkValueShape(String dataType, String value) {
        if (dataType == null) return null;
        switch (dataType) {
            case "NUMBER":
            case "DOUBLE":
            case "DECIMAL":
                try { Double.parseDouble(value); return null; }
                catch (NumberFormatException e) { return "must be a number"; }
            case "INTEGER":
            case "LONG":
                try { Long.parseLong(value); return null; }
                catch (NumberFormatException e) { return "must be an integer"; }
            case "BOOLEAN":
                if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) return null;
                return "must be a boolean (true/false)";
            case "DATE":
                try { java.time.LocalDate.parse(value); return null; }
                catch (DateTimeParseException e) { return "must be an ISO date (YYYY-MM-DD)"; }
            case "DATETIME":
            case "TIMESTAMP":
                try { java.time.LocalDateTime.parse(value); return null; }
                catch (DateTimeParseException e) { return "must be an ISO date-time"; }
            default:
                return null;
        }
    }

    // ====================================================================
    // SOFT TIER — required / regex / enum / editability / logical-id
    // ====================================================================

    /**
     * Collect violations of soft constraints. Never throws.
     *
     * @param nodeTypeId       node type to resolve attributes against
     * @param targetStateId    nullable — drives state-rule {@code required}/{@code visible}
     * @param values           effective values to validate (key = attribute code)
     * @param currentStateId   nullable — when non-null, attributes being changed
     *                         that are not editable in this state become violations
     * @param currentVersionId nullable — used to load domain attrs attached to that version
     * @param logicalId        nullable — when non-null with a node type pattern, validates the pattern
     * @param changedKeys      nullable — when non-null with currentStateId, narrows the
     *                         editability check to attrs the caller is changing
     */
    public List<Violation> collectViolations(String nodeTypeId,
                                              String targetStateId,
                                              Map<String, String> values,
                                              String currentStateId,
                                              String currentVersionId,
                                              String logicalId,
                                              Set<String> changedKeys) {
        List<Violation> out = new ArrayList<>();
        if (nodeTypeId == null) return out;

        var ntConfig = configCache.getNodeType(nodeTypeId);
        if (ntConfig.isPresent() && logicalId != null && !logicalId.isBlank()) {
            String pattern = ntConfig.get().logicalIdPattern();
            String label   = ntConfig.get().logicalIdLabel();
            if (label == null || label.isBlank()) label = "Identifier";
            if (pattern != null && !pattern.isBlank() && !logicalId.matches(pattern)) {
                out.add(new Violation(
                    "LOGICAL_ID_PATTERN", null, label,
                    "'" + label + "' value '" + logicalId
                        + "' does not match pattern: " + pattern));
            }
        }

        for (ResolvedAttribute attr : resolveAttributes(nodeTypeId, currentVersionId)) {
            String attrCode = attr.id();
            String label    = displayLabel(attr);
            String value    = values != null ? values.get(attrCode) : null;

            MetaModelCachePort.StateRuleInfo targetRule = (targetStateId != null)
                ? metaModelCache.getStateRuleInfo(nodeTypeId, attrCode, targetStateId)
                : null;

            if (targetRule != null && !targetRule.visible()) continue;

            if (currentStateId != null && changedKeys != null && changedKeys.contains(attrCode)) {
                MetaModelCachePort.StateRuleInfo currentRule =
                    metaModelCache.getStateRuleInfo(nodeTypeId, attrCode, currentStateId);
                if (currentRule != null && !currentRule.editable()) {
                    out.add(new Violation(
                        "NOT_EDITABLE", attrCode, label,
                        "Attribute '" + label + "' is not editable in current state"));
                    continue;
                }
            }

            boolean requiredByState = targetRule != null && targetRule.required();
            boolean requiredGlobal  = attr.required();
            if ((requiredByState || requiredGlobal) && (value == null || value.isBlank())) {
                out.add(new Violation(
                    "REQUIRED", attrCode, label,
                    "Attribute '" + label + "' is required"));
                continue;
            }

            if (value == null || value.isBlank()) continue;

            String regex = attr.namingRegex();
            if (regex != null && !value.matches(regex)) {
                out.add(new Violation(
                    "NAMING_REGEX", attrCode, label,
                    "Attribute '" + label + "' does not match naming rule: " + regex));
            }

            if ("ENUM".equals(attr.dataType()) && attr.allowedValues() != null
                    && !attr.allowedValues().contains("\"" + value + "\"")) {
                out.add(new Violation(
                    "ENUM_NOT_ALLOWED", attrCode, label,
                    "Attribute '" + label + "' value '" + value + "' is not allowed"));
            }
        }

        return out;
    }

    /** Throws if {@link #collectViolations} returns any violation. */
    public void assertNoViolations(String nodeTypeId,
                                    String targetStateId,
                                    Map<String, String> values,
                                    String currentStateId,
                                    String currentVersionId,
                                    String logicalId,
                                    Set<String> changedKeys) {
        List<Violation> v = collectViolations(
            nodeTypeId, targetStateId, values, currentStateId, currentVersionId, logicalId, changedKeys);
        if (!v.isEmpty()) throw new ValidationException(v);
    }

    // ====================================================================
    // Convenience: load values from DB then collect
    // ====================================================================

    public List<Violation> collectVersionViolations(String nodeId, String versionId) {
        String stateId = dsl.select().from("node_version")
            .where("id = ?", versionId)
            .fetchOne("lifecycle_state_id", String.class);
        return collectVersionViolations(nodeId, versionId, stateId);
    }

    public List<Violation> collectVersionViolations(String nodeId, String versionId, String stateId) {
        Record nodeRec = dsl.fetchOne("SELECT node_type_id, logical_id FROM node WHERE id = ?", nodeId);
        if (nodeRec == null) return List.of();

        String nodeTypeId = nodeRec.get("node_type_id", String.class);
        String logicalId  = nodeRec.get("logical_id", String.class);

        Map<String, String> attrs = new HashMap<>();
        dsl.select().from("node_version_attribute")
           .where("node_version_id = ?", versionId)
           .fetch()
           .forEach(r -> attrs.put(
               r.get("attribute_def_id", String.class),
               r.get("value", String.class)));

        return collectViolations(nodeTypeId, stateId, attrs, null, versionId, logicalId, null);
    }

    // ====================================================================
    // Internals
    // ====================================================================

    /** Resolve own + inherited + domain attributes for a node type / specific version. */
    private List<ResolvedAttribute> resolveAttributes(String nodeTypeId, String currentVersionId) {
        List<ResolvedAttribute> out = new ArrayList<>();
        var resolvedType = metaModelCache.get(nodeTypeId);
        if (resolvedType != null) out.addAll(resolvedType.attributes());

        if (currentVersionId != null) {
            dsl.select().from("node_version_domain")
               .where("node_version_id = ?", currentVersionId)
               .fetch()
               .forEach(r -> out.addAll(metaModelCache.getDomainAttributes(
                   r.get("domain_id", String.class))));
        }
        return out;
    }

    /**
     * Writable scope for {@link #assertWritable}: own + inherited attrs of the node
     * type, plus domain attrs from <em>any domain attached to any version of the
     * node</em> (committed or OPEN). The OPEN version may carry a freshly-attached
     * domain whose attributes the caller is about to write — those must be admitted
     * even though the last committed version did not yet include the domain.
     */
    private List<ResolvedAttribute> resolveWritableScope(String nodeTypeId, String nodeId) {
        List<ResolvedAttribute> out = new ArrayList<>();
        var resolvedType = metaModelCache.get(nodeTypeId);
        if (resolvedType != null) out.addAll(resolvedType.attributes());

        if (nodeId != null) {
            java.util.Set<String> domainIds = new java.util.LinkedHashSet<>();
            dsl.fetch(
                "SELECT DISTINCT nvd.domain_id FROM node_version_domain nvd "
                + "JOIN node_version nv ON nv.id = nvd.node_version_id "
                + "WHERE nv.node_id = ?",
                nodeId
            ).forEach(r -> domainIds.add(r.get("domain_id", String.class)));
            for (String domId : domainIds) {
                out.addAll(metaModelCache.getDomainAttributes(domId));
            }
        }
        return out;
    }

    // ====================================================================
    // Types
    // ====================================================================

    /**
     * Structured validation failure.
     *
     * @param code      violation kind: {@code UNKNOWN_ATTRIBUTE}, {@code INVALID_VALUE_TYPE},
     *                  {@code REQUIRED}, {@code NAMING_REGEX}, {@code ENUM_NOT_ALLOWED},
     *                  {@code NOT_EDITABLE}, {@code LOGICAL_ID_PATTERN}.
     * @param attrCode  attribute code (slug, e.g. {@code ad-ssi-zone}). Same identifier
     *                  used in DB and request payloads. Null for the logical-id pattern.
     * @param attrLabel attribute label for display (e.g. {@code "Install Zone"}). May
     *                  be null when the attribute is unknown and the code did not match
     *                  any known attribute_definition.
     * @param message   pre-formatted user-facing message; uses {@code attrLabel} when
     *                  available and falls back to {@code attrCode} only for truly
     *                  unknown codes.
     */
    public record Violation(String code, String attrCode, String attrLabel, String message) {
        @Override public String toString() { return message; }
    }

    public static class ValidationException extends PlmFunctionalException {
        private final List<Violation> errors;

        public ValidationException(List<Violation> errors) {
            super(errors.size() + " validation error(s)", 422);
            this.errors = errors;
        }

        public List<Violation> getErrors() { return errors; }
    }
}
