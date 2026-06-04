package com.plm.admin.metamodel;

import com.plm.admin.config.ConfigChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin gateway for attribute validation rules and per-attribute metadata.
 *
 * <p>Validation is driven by pluggable {@code AttributeValidator} algorithms. Two
 * dedicated psa tables hold the configuration (published to psm-api via the config
 * snapshot, then serialised into the generic {@code entityMetadata} transport keys
 * that psm-api already parses):
 * <ul>
 *   <li>{@code attribute_validation_rule(node_type_id, attribute_definition_id,
 *       lifecycle_state_id, algorithm_instance_id, effect)} — validator attachments.
 *       {@code node_type_id = NULL} means "every node type" (domain attrs);
 *       {@code lifecycle_state_id = NULL} means "all states".</li>
 *   <li>{@code attribute_metadata(attribute_definition_id, meta_key, meta_value)} —
 *       e.g. {@code validation.regex}, {@code visibility.hidden.<stateId>}.</li>
 * </ul>
 *
 * <p>Algorithm instance ids are the deterministic ones created by psm-api
 * auto-registration ({@code ainst-psm-c-<safe-code>}); they are soft references.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AttributeValidatorAdminService {

    public static final String REQUIRED_INSTANCE = "ainst-psm-c-required-attribute-validator";
    public static final String EDITABLE_INSTANCE = "ainst-psm-c-editable-attribute-validator";
    public static final String REGEX_INSTANCE    = "ainst-psm-c-regex-attribute-validator";
    public static final String REGEX_KEY         = "validation.regex";

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    // ── Validator rules ───────────────────────────────────────────

    /** Attach a validator instance (idempotent — replaces any matching rule). */
    public void attach(String nodeTypeId, String attrDefId, String stateId, String instanceId, String effect) {
        deleteRule(nodeTypeId, attrDefId, stateId, instanceId);
        dsl.execute(
            "INSERT INTO attribute_validation_rule (id, node_type_id, attribute_definition_id, lifecycle_state_id, algorithm_instance_id, effect) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID().toString(), nodeTypeId, attrDefId, stateId, instanceId,
            (effect == null || effect.isBlank()) ? "BLOCK" : effect);
        publish("UPDATE", "ATTR_VALIDATOR", attrDefId);
    }

    public void detach(String nodeTypeId, String attrDefId, String stateId, String instanceId) {
        deleteRule(nodeTypeId, attrDefId, stateId, instanceId);
        publish("DELETE", "ATTR_VALIDATOR", attrDefId);
    }

    /**
     * Null-safe delete of a single (nodeType, attr, state, instance) rule. NULL columns
     * are matched with literal {@code IS NULL} predicates — a bound {@code ? IS NULL}
     * has no inferable type in PostgreSQL and fails as bad grammar.
     */
    private void deleteRule(String nodeTypeId, String attrDefId, String stateId, String instanceId) {
        StringBuilder sql = new StringBuilder(
            "DELETE FROM attribute_validation_rule WHERE attribute_definition_id = ? AND algorithm_instance_id = ?");
        List<Object> binds = new ArrayList<>(List.of(attrDefId, instanceId));
        if (nodeTypeId == null) sql.append(" AND node_type_id IS NULL");
        else { sql.append(" AND node_type_id = ?"); binds.add(nodeTypeId); }
        if (stateId == null) sql.append(" AND lifecycle_state_id IS NULL");
        else { sql.append(" AND lifecycle_state_id = ?"); binds.add(stateId); }
        dsl.execute(sql.toString(), binds.toArray());
    }

    /** meta_key -> effect for all validator rules on an attribute (state-agnostic view). */
    public List<Record> rules(String attrDefId) {
        return dsl.select().from("attribute_validation_rule")
            .where("attribute_definition_id = ?", attrDefId).fetch();
    }

    /**
     * Validator attachments for (nodeType, attr) in the legacy UI encoding
     * {@code <stateId|*>__<instanceId> -> effect}, so the settings UI keeps working.
     * Includes wildcard (node_type_id IS NULL) rules.
     */
    public Map<String, String> list(String nodeTypeId, String attrDefId) {
        Map<String, String> out = new LinkedHashMap<>();
        dsl.select().from("attribute_validation_rule")
            .where("attribute_definition_id = ?", attrDefId)
            .and("(node_type_id = ? OR node_type_id IS NULL)", nodeTypeId)
            .fetch()
            .forEach(r -> {
                String state = r.get("lifecycle_state_id", String.class);
                String key = (state == null ? "*" : state) + "__" + r.get("algorithm_instance_id", String.class);
                out.put(key, r.get("effect", String.class));
            });
        return out;
    }

    // ── Convenience: required / editable / visible per the admin matrix ──

    /**
     * All-states required: a present rule => required in every state. Owning node type
     * is resolved from the attribute (NULL for domain attrs => wildcard).
     */
    public void setRequiredGlobal(String attrDefId, boolean required) {
        String nodeTypeId = dsl.select().from("attribute_definition")
            .where("id = ?", attrDefId).fetchOne("node_type_id", String.class);
        if (required) attach(nodeTypeId, attrDefId, null, REQUIRED_INSTANCE, "BLOCK");
        else          detach(nodeTypeId, attrDefId, null, REQUIRED_INSTANCE);
    }

    /** Per-state required/editable/visible (replaces the old attribute_state_rule row). */
    public void setStateRule(String nodeTypeId, String attrDefId, String stateId,
                             boolean required, boolean editable, boolean visible) {
        if (required) attach(nodeTypeId, attrDefId, stateId, REQUIRED_INSTANCE, "BLOCK");
        else          detach(nodeTypeId, attrDefId, stateId, REQUIRED_INSTANCE);

        // Presence of an editable rule means "locked" in that state.
        if (!editable) attach(nodeTypeId, attrDefId, stateId, EDITABLE_INSTANCE, "BLOCK");
        else           detach(nodeTypeId, attrDefId, stateId, EDITABLE_INSTANCE);

        setHidden(attrDefId, stateId, !visible);
    }

    // ── Per-attribute metadata ────────────────────────────────────

    public Map<String, String> metadata(String attrDefId) {
        Map<String, String> out = new LinkedHashMap<>();
        dsl.select().from("attribute_metadata")
            .where("attribute_definition_id = ?", attrDefId).fetch()
            .forEach(r -> out.put(r.get("meta_key", String.class), r.get("meta_value", String.class)));
        return out;
    }

    public void setMetadata(String attrDefId, String key, String value) {
        dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id = ? AND meta_key = ?", attrDefId, key);
        dsl.execute("INSERT INTO attribute_metadata (attribute_definition_id, meta_key, meta_value) VALUES (?,?,?)",
            attrDefId, key, value == null ? "" : value);
        publish("UPDATE", "ATTRIBUTE_DEFINITION", attrDefId);
    }

    public void removeMetadata(String attrDefId, String key) {
        dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id = ? AND meta_key = ?", attrDefId, key);
        publish("UPDATE", "ATTRIBUTE_DEFINITION", attrDefId);
    }

    public String getRegex(String attrDefId) {
        return metadata(attrDefId).get(REGEX_KEY);
    }

    /** True when an all-states required rule is attached to the attribute. */
    public boolean isRequiredGlobal(String attrDefId) {
        return dsl.fetchCount(dsl.selectOne().from("attribute_validation_rule")
            .where("attribute_definition_id = ? AND algorithm_instance_id = ? AND lifecycle_state_id IS NULL",
                attrDefId, REQUIRED_INSTANCE)) > 0;
    }

    /**
     * Sets/clears the regex pattern (metadata) and the matching regex validator rule.
     * The owning node type is resolved from the attribute (NULL for domain attrs =>
     * wildcard rule applying to every node type).
     */
    public void setRegex(String attrDefId, String regex) {
        String nodeTypeId = dsl.select().from("attribute_definition")
            .where("id = ?", attrDefId).fetchOne("node_type_id", String.class);
        if (regex == null || regex.isBlank()) {
            dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id = ? AND meta_key = ?", attrDefId, REGEX_KEY);
            detach(nodeTypeId, attrDefId, null, REGEX_INSTANCE);
        } else {
            setMetadata(attrDefId, REGEX_KEY, regex);
            attach(nodeTypeId, attrDefId, null, REGEX_INSTANCE, "BLOCK");
        }
    }

    public void setHidden(String attrDefId, String stateId, boolean hidden) {
        String key = "visibility.hidden." + stateId;
        if (hidden) setMetadata(attrDefId, key, "true");
        else        removeMetadata(attrDefId, key);
    }

    // ── Cascade cleanup ───────────────────────────────────────────

    public void deleteAllForAttribute(String attrDefId) {
        dsl.execute("DELETE FROM attribute_validation_rule WHERE attribute_definition_id = ?", attrDefId);
        dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id = ?", attrDefId);
    }

    public void deleteAllForState(String stateId) {
        dsl.execute("DELETE FROM attribute_validation_rule WHERE lifecycle_state_id = ?", stateId);
        dsl.execute("DELETE FROM attribute_metadata WHERE meta_key = ?", "visibility.hidden." + stateId);
    }

    private void publish(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
