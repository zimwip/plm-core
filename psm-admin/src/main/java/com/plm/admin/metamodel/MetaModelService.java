package com.plm.admin.metamodel;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.lifecycle.LifecycleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MetaModelService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final AttributeValidatorAdminService validatorAdminService;

    // ================================================================
    // NODE TYPE
    // ================================================================

    public List<Record> getAllNodeTypes() {
        return dsl.select().from("node_type").orderBy(DSL.field("name")).fetch();
    }

    @Transactional
    public String createNodeType(String code, String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy,
                                 String color, String icon, String parentNodeTypeId) {
        LifecycleService.validateCode(code);
        String scheme = (numberingScheme != null && !numberingScheme.isBlank()) ? numberingScheme : "ALPHA_NUMERIC";
        String policy = (versionPolicy != null && !versionPolicy.isBlank()) ? versionPolicy : "ITERATE";
        if (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) {
            assertNoCycle(null, parentNodeTypeId);
        }
        dsl.execute(
            "INSERT INTO node_type (ID, NAME, DESCRIPTION, LIFECYCLE_ID, NUMBERING_SCHEME, VERSION_POLICY, COLOR, ICON, PARENT_NODE_TYPE_ID, CREATED_AT) VALUES (?,?,?,?,?,?,?,?,?,?)",
            code, name, description, lifecycleId, scheme, policy,
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) ? parentNodeTypeId : null,
            LocalDateTime.now()
        );
        log.info("NodeType created: {} ({})", name, code);
        publishChange("CREATE", "NODE_TYPE", code);
        return code;
    }

    @Transactional
    public void updateNodeTypeParent(String nodeTypeId, String parentNodeTypeId) {
        if (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) {
            if (parentNodeTypeId.equals(nodeTypeId)) throw new IllegalArgumentException("A node type cannot inherit from itself");
            assertNoCycle(nodeTypeId, parentNodeTypeId);
            dsl.execute("UPDATE node_type SET parent_node_type_id = ? WHERE id = ?", parentNodeTypeId, nodeTypeId);
        } else {
            dsl.execute("UPDATE node_type SET parent_node_type_id = NULL WHERE id = ?", nodeTypeId);
        }
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeAppearance(String nodeTypeId, String color, String icon) {
        dsl.execute("UPDATE node_type SET color = ?, icon = ? WHERE id = ?",
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeNumberingScheme(String nodeTypeId, String numberingScheme) {
        dsl.execute("UPDATE node_type SET numbering_scheme = ? WHERE id = ?", numberingScheme, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeVersionPolicy(String nodeTypeId, String versionPolicy) {
        dsl.execute("UPDATE node_type SET version_policy = ? WHERE id = ?", versionPolicy, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeCollapseHistory(String nodeTypeId, boolean collapseHistory) {
        dsl.execute("UPDATE node_type SET collapse_history = ? WHERE id = ?", collapseHistory, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeLifecycle(String nodeTypeId, String lifecycleId) {
        dsl.execute("UPDATE node_type SET lifecycle_id = ? WHERE id = ?",
            lifecycleId != null && !lifecycleId.isBlank() ? lifecycleId : null, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void updateNodeTypeIdentity(String nodeTypeId, String label, String pattern) {
        dsl.execute("UPDATE node_type SET LOGICAL_ID_LABEL = ?, LOGICAL_ID_PATTERN = ? WHERE ID = ?",
            label, pattern, nodeTypeId);
        publishChange("UPDATE", "NODE_TYPE", nodeTypeId);
    }

    @Transactional
    public void deleteNodeType(String nodeTypeId) {
        int children = dsl.fetchCount(dsl.selectOne().from("node_type").where("parent_node_type_id = ?", nodeTypeId));
        if (children > 0) throw new IllegalStateException("Node type has " + children + " child type(s)");
        dsl.execute("DELETE FROM attribute_validation_rule WHERE attribute_definition_id IN (SELECT id FROM attribute_definition WHERE node_type_id = ?)", nodeTypeId);
        dsl.execute("DELETE FROM attribute_metadata WHERE attribute_definition_id IN (SELECT id FROM attribute_definition WHERE node_type_id = ?)", nodeTypeId);
        dsl.execute("DELETE FROM view_attribute_override WHERE attribute_def_id IN (SELECT id FROM attribute_definition WHERE node_type_id = ?)", nodeTypeId);
        dsl.execute("DELETE FROM attribute_definition WHERE node_type_id = ?", nodeTypeId);
        dsl.execute(
            "DELETE FROM link_type WHERE source_node_type_id = ? "
            + "OR (target_source_id = 'SELF' AND target_type = ?)",
            nodeTypeId, nodeTypeId);
        // authorization_policy lives in pno-api — cascade via NATS NODE_TYPE_DELETED handled by AuthorizationCascadeListener.
        dsl.execute("DELETE FROM attribute_view WHERE node_type_id = ?", nodeTypeId);
        dsl.execute("DELETE FROM node_type WHERE id = ?", nodeTypeId);
        publishChange("DELETE", "NODE_TYPE", nodeTypeId);
    }

    // ================================================================
    // ATTRIBUTE DEFINITION
    // ================================================================

    public List<Map<String, Object>> getAttributeDefinitions(String nodeTypeId) {
        List<String> chain = buildNodeTypeAncestorChain(nodeTypeId);

        Set<String> seenNames = new LinkedHashSet<>();
        List<Map<String, Object>> result = new ArrayList<>();

        List<Record> ownAttrs = dsl.select().from("attribute_definition")
            .where("node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("display_order"))
            .fetch();
        for (Record ad : ownAttrs) {
            seenNames.add(ad.get("name", String.class));
            Map<String, Object> m = new LinkedHashMap<>(ad.intoMap());
            m.put("inherited", false);
            m.put("inherited_from", null);
            result.add(m);
        }

        for (String ancestorId : chain) {
            if (ancestorId.equals(nodeTypeId)) continue;
            String ancestorName = dsl.select(DSL.field("name"))
                .from("node_type").where("id = ?", ancestorId)
                .fetchOne(DSL.field("name"), String.class);
            List<Record> ancestorAttrs = dsl.select().from("attribute_definition")
                .where("node_type_id = ?", ancestorId)
                .orderBy(DSL.field("display_order"))
                .fetch();
            for (Record ad : ancestorAttrs) {
                String adName = ad.get("name", String.class);
                if (!seenNames.add(adName)) continue;
                Map<String, Object> m = new LinkedHashMap<>(ad.intoMap());
                m.put("inherited", true);
                m.put("inherited_from", ancestorName);
                result.add(m);
            }
        }
        result.forEach(this::enrichAttributeMap);
        return result;
    }

    /**
     * Re-adds the {@code required} / {@code naming_regex} / {@code allowed_values} keys
     * the admin UI expects. They are no longer columns — required & regex come from the
     * validation rules / metadata, allowed values are reconstructed from the enum tables.
     */
    public void enrichAttributeMap(Map<String, Object> m) {
        String attrId = (String) m.get("id");
        if (attrId == null) return;
        m.put("required", validatorAdminService.isRequiredGlobal(attrId));
        m.put("naming_regex", validatorAdminService.getRegex(attrId));
        m.put("allowed_values", enumAllowedJson((String) m.get("enum_definition_id")));
    }

    /** ENUM value list as JSON {@code [{"value","label"}]} from the enum tables, or null. */
    String enumAllowedJson(String enumDefId) {
        if (enumDefId == null || enumDefId.isBlank()) return null;
        List<Record> rows = dsl.fetch(
            "SELECT value, label FROM enum_value WHERE enum_definition_id = ? ORDER BY display_order", enumDefId);
        if (rows.isEmpty()) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < rows.size(); i++) {
            if (i > 0) sb.append(",");
            String val = rows.get(i).get("value", String.class);
            String lbl = rows.get(i).get("label", String.class);
            sb.append("{\"value\":\"").append(val == null ? "" : val.replace("\"", "\\\"")).append("\"");
            if (lbl != null && !lbl.isBlank()) {
                sb.append(",\"label\":\"").append(lbl.replace("\"", "\\\"")).append("\"");
            }
            sb.append("}");
        }
        return sb.append("]").toString();
    }

    @Transactional
    public String createAttributeDefinition(String nodeTypeId, Map<String, Object> params) {
        String code = (String) params.get("code");
        LifecycleService.validateCode(code);
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        if (asName) {
            int existing = dsl.fetchCount(dsl.selectOne().from("attribute_definition")
                .where("node_type_id = ?", nodeTypeId).and("as_name = 1"));
            if (existing > 0) throw new IllegalArgumentException("A 'as_name' attribute already exists for this node type");
        }
        String enumDefId = (String) params.get("enumDefinitionId");
        dsl.execute("""
            INSERT INTO attribute_definition
              (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, DEFAULT_VALUE,
               WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP, AS_NAME,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            code, nodeTypeId, params.get("name"), params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            params.get("defaultValue"),
            params.getOrDefault("widgetType", "TEXT"), toInt(params.get("displayOrder"), 0),
            params.get("displaySection"), params.get("tooltip"), asName ? 1 : 0,
            enumDefId, LocalDateTime.now()
        );
        // required / regex are now pluggable validation rules, not columns.
        validatorAdminService.setRequiredGlobal(code, toIntFlag(params.get("required")) == 1);
        validatorAdminService.setRegex(code, (String) params.get("namingRegex"));
        publishChange("CREATE", "ATTRIBUTE_DEFINITION", code);
        return code;
    }

    @Transactional
    public void updateAttributeDefinition(String attrId, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        dsl.execute("""
            UPDATE attribute_definition SET
              LABEL = ?, DATA_TYPE = ?, DEFAULT_VALUE = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?, AS_NAME = ?,
              ENUM_DEFINITION_ID = ?
            WHERE ID = ?
            """,
            params.get("label"), params.getOrDefault("dataType", "STRING"),
            params.get("defaultValue"), params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0), params.get("displaySection"),
            params.get("tooltip"), asName ? 1 : 0, enumDefId, attrId
        );
        // required / regex are now pluggable validation rules, not columns.
        if (params.containsKey("required")) {
            validatorAdminService.setRequiredGlobal(attrId, toIntFlag(params.get("required")) == 1);
        }
        if (params.containsKey("namingRegex")) {
            validatorAdminService.setRegex(attrId, (String) params.get("namingRegex"));
        }
        publishChange("UPDATE", "ATTRIBUTE_DEFINITION", attrId);
    }

    @Transactional
    public void deleteAttribute(String attrId) {
        dsl.execute("DELETE FROM view_attribute_override WHERE attribute_def_id = ?", attrId);
        validatorAdminService.deleteAllForAttribute(attrId);
        dsl.execute("DELETE FROM attribute_definition WHERE id = ?", attrId);
        publishChange("DELETE", "ATTRIBUTE_DEFINITION", attrId);
    }

    // ================================================================
    // ATTRIBUTE STATE MATRIX (required / editable / visible per state)
    // Backed by attribute_validation_rule + attribute_metadata.
    // ================================================================

    /**
     * Effective required/editable/visible per (attribute, state), derived from the
     * validation rules and metadata. Returns one row per attribute × lifecycle state
     * of the node type's lifecycle, mirroring the legacy matrix shape for the UI.
     */
    public List<Map<String, Object>> getAttributeStateMatrix(String nodeTypeId) {
        List<Record> attrs = dsl.select().from("attribute_definition")
            .where("node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("display_order")).fetch();

        List<Record> states = dsl.fetch(
            "SELECT ls.id, ls.name, ls.display_order FROM lifecycle_state ls "
            + "JOIN node_type nt ON nt.lifecycle_id = ls.lifecycle_id "
            + "WHERE nt.id = ? ORDER BY ls.display_order", nodeTypeId);

        List<Record> rules = dsl.select().from("attribute_validation_rule")
            .where("(node_type_id = ? OR node_type_id IS NULL)", nodeTypeId).fetch();
        List<Record> hiddenMeta = dsl.select().from("attribute_metadata")
            .where("meta_key LIKE 'visibility.hidden.%'").fetch();

        List<Map<String, Object>> out = new ArrayList<>();
        for (Record ad : attrs) {
            String attrId = ad.get("id", String.class);
            boolean requiredAll = ruleExists(rules, attrId, null, AttributeValidatorAdminService.REQUIRED_INSTANCE);
            for (Record st : states) {
                String stateId = st.get("id", String.class);
                boolean required = requiredAll || ruleExists(rules, attrId, stateId, AttributeValidatorAdminService.REQUIRED_INSTANCE);
                boolean locked   = ruleExists(rules, attrId, stateId, AttributeValidatorAdminService.EDITABLE_INSTANCE);
                boolean hidden   = hiddenMeta.stream().anyMatch(m ->
                    attrId.equals(m.get("attribute_definition_id", String.class))
                    && ("visibility.hidden." + stateId).equals(m.get("meta_key", String.class)));
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("attribute_definition_id", attrId);
                row.put("name", ad.get("name", String.class));
                row.put("label", ad.get("label", String.class));
                row.put("display_order", ad.get("display_order", Integer.class));
                row.put("lifecycle_state_id", stateId);
                row.put("state_name", st.get("name", String.class));
                row.put("required", required);
                row.put("editable", !locked);
                row.put("visible", !hidden);
                out.add(row);
            }
        }
        return out;
    }

    private static boolean ruleExists(List<Record> rules, String attrId, String stateId, String instanceId) {
        return rules.stream().anyMatch(r ->
            attrId.equals(r.get("attribute_definition_id", String.class))
            && instanceId.equals(r.get("algorithm_instance_id", String.class))
            && java.util.Objects.equals(stateId, r.get("lifecycle_state_id", String.class)));
    }

    @Transactional
    public String setAttributeStateRule(String nodeTypeId, String attributeDefId, String stateId,
                                        boolean required, boolean editable, boolean visible) {
        String effectiveNodeTypeId = nodeTypeId;
        if (effectiveNodeTypeId == null || effectiveNodeTypeId.isBlank()) {
            effectiveNodeTypeId = dsl.select(DSL.field("node_type_id"))
                .from("attribute_definition").where("id = ?", attributeDefId)
                .fetchOne(DSL.field("node_type_id"), String.class);
        }
        validatorAdminService.setStateRule(effectiveNodeTypeId, attributeDefId, stateId, required, editable, visible);
        publishChange("UPDATE", "ATTR_VALIDATOR", attributeDefId);
        return attributeDefId + ":" + stateId;
    }

    // ================================================================
    // LINK TYPE
    // ================================================================

    public List<Record> getAllLinkTypes() {
        return dsl.select().from("link_type").orderBy(DSL.field("name")).fetch();
    }

    public List<Map<String, Object>> getLinkTypesByNodeType(String nodeTypeId) {
        List<String> chain = buildNodeTypeAncestorChain(nodeTypeId);

        Set<String> seenNames = new LinkedHashSet<>();
        List<Map<String, Object>> result = new ArrayList<>();

        List<Record> ownLinks = dsl.select().from("link_type")
            .where("source_node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("name"))
            .fetch();
        for (Record lt : ownLinks) {
            seenNames.add(lt.get("name", String.class));
            Map<String, Object> m = new LinkedHashMap<>(lt.intoMap());
            m.put("inherited", false);
            m.put("inherited_from", null);
            result.add(m);
        }

        for (String ancestorId : chain) {
            if (ancestorId.equals(nodeTypeId)) continue;
            String ancestorName = dsl.select(DSL.field("name"))
                .from("node_type").where("id = ?", ancestorId)
                .fetchOne(DSL.field("name"), String.class);
            List<Record> ancestorLinks = dsl.select().from("link_type")
                .where("source_node_type_id = ?", ancestorId)
                .orderBy(DSL.field("name"))
                .fetch();
            for (Record lt : ancestorLinks) {
                String ltName = lt.get("name", String.class);
                if (!seenNames.add(ltName)) continue;
                Map<String, Object> m = new LinkedHashMap<>(lt.intoMap());
                m.put("inherited", true);
                m.put("inherited_from", ancestorName);
                result.add(m);
            }
        }
        return result;
    }

    private List<String> buildNodeTypeAncestorChain(String nodeTypeId) {
        List<String> chain = new ArrayList<>();
        Set<String> visited = new LinkedHashSet<>();
        String current = nodeTypeId;
        int depth = 0;
        while (current != null && depth < 50) {
            if (!visited.add(current)) break;
            chain.add(current);
            current = dsl.select(DSL.field("parent_node_type_id"))
                .from("node_type").where("id = ?", current)
                .fetchOne(DSL.field("parent_node_type_id"), String.class);
            depth++;
        }
        return chain;
    }

    @Transactional
    public String createLinkType(String code, String name, String description,
                                 String sourceNodeTypeId,
                                 String targetSourceId, String targetType,
                                 String linkPolicy, int minCardinality, Integer maxCardinality,
                                 String linkLogicalIdLabel, String linkLogicalIdPattern,
                                 String color, String icon) {
        LifecycleService.validateCode(code);
        if (!linkPolicy.equals("VERSION_TO_MASTER") && !linkPolicy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }
        if (targetType == null || targetType.isBlank()) {
            throw new IllegalArgumentException("targetType is required");
        }
        String src = (targetSourceId == null || targetSourceId.isBlank()) ? "SELF" : targetSourceId;
        Record srcRow = dsl.select(DSL.field("is_versioned", Integer.class))
            .from("source").where("id = ?", src).fetchOne();
        if (srcRow == null) throw new IllegalArgumentException("Unknown source: " + src);
        boolean versioned = srcRow.get("is_versioned", Integer.class) != null
            && srcRow.get("is_versioned", Integer.class) != 0;
        if ("VERSION_TO_VERSION".equals(linkPolicy) && !versioned) {
            throw new IllegalArgumentException("linkPolicy VERSION_TO_VERSION requires a versioned source; "
                + src + " is not versioned");
        }
        dsl.execute("""
            INSERT INTO link_type (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID,
               TARGET_SOURCE_ID, TARGET_TYPE,
               LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY,
               LINK_LOGICAL_ID_LABEL, LINK_LOGICAL_ID_PATTERN, COLOR, ICON, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            code, name, description, sourceNodeTypeId, src, targetType,
            linkPolicy, minCardinality, maxCardinality,
            (linkLogicalIdLabel != null && !linkLogicalIdLabel.isBlank()) ? linkLogicalIdLabel : "Link ID",
            (linkLogicalIdPattern != null && !linkLogicalIdPattern.isBlank()) ? linkLogicalIdPattern : null,
            (color != null && !color.isBlank()) ? color : null,
            (icon != null && !icon.isBlank()) ? icon : null,
            LocalDateTime.now()
        );
        publishChange("CREATE", "LINK_TYPE", code);
        return code;
    }

    @Transactional
    public void updateLinkType(String linkTypeId, Map<String, Object> params) {
        String policy = (String) params.getOrDefault("linkPolicy", "VERSION_TO_MASTER");
        String label   = (String) params.get("linkLogicalIdLabel");
        String pattern = (String) params.get("linkLogicalIdPattern");
        String color = (String) params.get("color");
        String icon  = (String) params.get("icon");
        if ("VERSION_TO_VERSION".equals(policy)) {
            String src = dsl.select(DSL.field("target_source_id", String.class))
                .from("link_type").where("id = ?", linkTypeId)
                .fetchOne(DSL.field("target_source_id", String.class));
            if (src != null) {
                Integer versioned = dsl.select(DSL.field("is_versioned", Integer.class))
                    .from("source").where("id = ?", src)
                    .fetchOne(DSL.field("is_versioned", Integer.class));
                if (versioned == null || versioned == 0) {
                    throw new IllegalArgumentException("linkPolicy VERSION_TO_VERSION requires a versioned source; "
                        + src + " is not versioned");
                }
            }
        }
        String targetType   = (String) params.get("targetNodeTypeId");
        String targetSource = (String) params.get("targetSourceId");
        dsl.execute("""
            UPDATE link_type SET NAME = ?, DESCRIPTION = ?, LINK_POLICY = ?,
              MIN_CARDINALITY = ?, MAX_CARDINALITY = ?,
              LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ?, COLOR = ?, ICON = ?,
              TARGET_TYPE = ?, TARGET_SOURCE_ID = ?
            WHERE ID = ?
            """,
            params.get("name"), params.get("description"), policy,
            params.getOrDefault("minCardinality", 0), params.get("maxCardinality"),
            (label != null && !label.isBlank()) ? label : "Link ID",
            (pattern != null && !pattern.isBlank()) ? pattern : null,
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            (targetType != null && !targetType.isBlank()) ? targetType : null,
            (targetSource != null && !targetSource.isBlank()) ? targetSource : "SELF",
            linkTypeId
        );
        publishChange("UPDATE", "LINK_TYPE", linkTypeId);
    }

    @Transactional
    public void updateLinkTypeIdentity(String linkTypeId, String label, String pattern) {
        dsl.execute("UPDATE link_type SET LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ? WHERE ID = ?",
            (label != null && !label.isBlank()) ? label : "Link ID",
            (pattern != null && !pattern.isBlank()) ? pattern : null,
            linkTypeId);
        publishChange("UPDATE", "LINK_TYPE", linkTypeId);
    }

    @Transactional
    public void deleteLinkType(String linkTypeId) {
        dsl.execute("DELETE FROM link_type_attribute WHERE link_type_id = ?", linkTypeId);
        dsl.execute("DELETE FROM link_type_cascade WHERE link_type_id = ?", linkTypeId);
        dsl.execute("DELETE FROM link_type WHERE id = ?", linkTypeId);
        publishChange("DELETE", "LINK_TYPE", linkTypeId);
    }

    // ================================================================
    // LINK TYPE ATTRIBUTES
    // ================================================================

    public List<Record> getLinkTypeAttributes(String linkTypeId) {
        return dsl.select().from("link_type_attribute")
            .where("link_type_id = ?", linkTypeId)
            .orderBy(DSL.field("display_order")).fetch();
    }

    @Transactional
    public String createLinkTypeAttribute(String linkTypeId, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        String name = (String) params.get("name");
        dsl.execute("""
            INSERT INTO link_type_attribute
              (LINK_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            linkTypeId, name, params.get("label"),
            params.getOrDefault("dataType", "STRING"), toIntFlag(params.get("required")),
            params.get("defaultValue"), params.get("namingRegex"),
            params.getOrDefault("widgetType", "TEXT"), toInt(params.get("displayOrder"), 0),
            params.get("displaySection"), params.get("tooltip"), enumDefId, LocalDateTime.now()
        );
        publishChange("CREATE", "LINK_TYPE_ATTRIBUTE", linkTypeId);
        return name;
    }

    @Transactional
    public void updateLinkTypeAttribute(String linkTypeId, String name, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        dsl.execute("""
            UPDATE link_type_attribute SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?,
              ENUM_DEFINITION_ID = ?
            WHERE LINK_TYPE_ID = ? AND NAME = ?
            """,
            params.get("label"), params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")), params.get("defaultValue"),
            params.get("namingRegex"), params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0), params.get("displaySection"),
            params.get("tooltip"), enumDefId, linkTypeId, name
        );
        publishChange("UPDATE", "LINK_TYPE_ATTRIBUTE", linkTypeId);
    }

    @Transactional
    public void deleteLinkTypeAttribute(String linkTypeId, String name) {
        dsl.execute("DELETE FROM link_type_attribute WHERE link_type_id = ? AND name = ?", linkTypeId, name);
        publishChange("DELETE", "LINK_TYPE_ATTRIBUTE", linkTypeId);
    }

    // ================================================================
    // LINK TYPE CASCADES
    // ================================================================

    public List<Map<String, Object>> getLinkTypeCascades(String linkTypeId) {
        return dsl.select(
                DSL.field("ltc.link_type_id").as("link_type_id"),
                DSL.field("ltc.parent_transition_id").as("parent_transition_id"),
                DSL.field("pt.name").as("parent_transition_name"),
                DSL.field("ltc.child_from_state_id").as("child_from_state_id"),
                DSL.field("cfs.name").as("child_from_state_name"),
                DSL.field("ltc.child_transition_id").as("child_transition_id"),
                DSL.field("ct.name").as("child_transition_name")
            )
            .from("link_type_cascade ltc")
            .join("lifecycle_transition pt").on("pt.id = ltc.parent_transition_id")
            .join("lifecycle_state cfs").on("cfs.id = ltc.child_from_state_id")
            .join("lifecycle_transition ct").on("ct.id = ltc.child_transition_id")
            .where("ltc.link_type_id = ?", linkTypeId)
            .fetchMaps();
    }

    /** Cascades triggered by a given parent transition — joins link-type + child names for display. */
    public List<Map<String, Object>> getCascadesByParentTransition(String transitionId) {
        return dsl.select(
                DSL.field("ltc.link_type_id").as("link_type_id"),
                DSL.field("lt.name").as("link_type_name"),
                DSL.field("ltc.parent_transition_id").as("parent_transition_id"),
                DSL.field("ltc.child_from_state_id").as("child_from_state_id"),
                DSL.field("cfs.name").as("child_from_state_name"),
                DSL.field("ltc.child_transition_id").as("child_transition_id"),
                DSL.field("ct.name").as("child_transition_name")
            )
            .from("link_type_cascade ltc")
            .join("link_type lt").on("lt.id = ltc.link_type_id")
            .join("lifecycle_state cfs").on("cfs.id = ltc.child_from_state_id")
            .join("lifecycle_transition ct").on("ct.id = ltc.child_transition_id")
            .where("ltc.parent_transition_id = ?", transitionId)
            .fetchMaps();
    }

    @Transactional
    public void createLinkTypeCascade(String linkTypeId, String parentTransitionId,
                                      String childFromStateId, String childTransitionId) {
        validateCascadeRule(linkTypeId, parentTransitionId, childFromStateId, childTransitionId);
        dsl.execute(
            "INSERT INTO link_type_cascade (LINK_TYPE_ID, PARENT_TRANSITION_ID, CHILD_FROM_STATE_ID, CHILD_TRANSITION_ID) VALUES (?,?,?,?)",
            linkTypeId, parentTransitionId, childFromStateId, childTransitionId);
        publishChange("CREATE", "LINK_TYPE_CASCADE", linkTypeId);
    }

    /**
     * Ensures a cascade rule is coherent so it can actually fire at runtime:
     * <ul>
     *   <li>parent transition belongs to the SOURCE node type's lifecycle;</li>
     *   <li>child transition belongs to the TARGET node type's lifecycle;</li>
     *   <li>child_from_state matches the child transition's from_state (otherwise the rule scope
     *       can never overlap the transition and the cascade would silently never run).</li>
     * </ul>
     */
    private void validateCascadeRule(String linkTypeId, String parentTransitionId,
                                     String childFromStateId, String childTransitionId) {
        Record lt = dsl.fetchOne(
            "SELECT source_node_type_id, target_source_id, target_type FROM link_type WHERE id = ?",
            linkTypeId);
        if (lt == null) throw new IllegalArgumentException("Link type not found: " + linkTypeId);

        String sourceNodeTypeId = lt.get("source_node_type_id", String.class);
        String targetSourceId = lt.get("target_source_id", String.class);
        String targetNodeTypeId = lt.get("target_type", String.class);
        if (!"SELF".equals(targetSourceId)) {
            throw new IllegalArgumentException(
                "Cascade rules are only supported for SELF link types (target_source_id=SELF)");
        }

        String sourceLifecycleId = lifecycleOfNodeType(sourceNodeTypeId);
        String targetLifecycleId = lifecycleOfNodeType(targetNodeTypeId);

        Record parent = dsl.fetchOne(
            "SELECT lifecycle_id FROM lifecycle_transition WHERE id = ?", parentTransitionId);
        if (parent == null) throw new IllegalArgumentException("Parent transition not found: " + parentTransitionId);
        if (!java.util.Objects.equals(sourceLifecycleId, parent.get("lifecycle_id", String.class))) {
            throw new IllegalArgumentException(
                "Parent transition " + parentTransitionId + " does not belong to the source node type's lifecycle");
        }

        Record child = dsl.fetchOne(
            "SELECT lifecycle_id, from_state_id FROM lifecycle_transition WHERE id = ?", childTransitionId);
        if (child == null) throw new IllegalArgumentException("Child transition not found: " + childTransitionId);
        if (!java.util.Objects.equals(targetLifecycleId, child.get("lifecycle_id", String.class))) {
            throw new IllegalArgumentException(
                "Child transition " + childTransitionId + " does not belong to the target node type's lifecycle");
        }
        if (!java.util.Objects.equals(childFromStateId, child.get("from_state_id", String.class))) {
            throw new IllegalArgumentException(
                "child_from_state " + childFromStateId + " must equal the child transition's from_state ("
                    + child.get("from_state_id", String.class) + "), otherwise the cascade can never fire");
        }
    }

    private String lifecycleOfNodeType(String nodeTypeId) {
        if (nodeTypeId == null) return null;
        Record nt = dsl.fetchOne("SELECT lifecycle_id FROM node_type WHERE id = ?", nodeTypeId);
        if (nt == null) throw new IllegalArgumentException("Node type not found: " + nodeTypeId);
        return nt.get("lifecycle_id", String.class);
    }

    @Transactional
    public void deleteLinkTypeCascade(String linkTypeId, String parentTransitionId, String childFromStateId) {
        dsl.execute("DELETE FROM link_type_cascade WHERE link_type_id = ? AND parent_transition_id = ? AND child_from_state_id = ?",
            linkTypeId, parentTransitionId, childFromStateId);
        publishChange("DELETE", "LINK_TYPE_CASCADE", linkTypeId);
    }

    // ================================================================
    // Helpers
    // ================================================================

    private void assertNoCycle(String nodeTypeId, String parentNodeTypeId) {
        String current = parentNodeTypeId;
        int depth = 0;
        while (current != null && depth < 50) {
            if (current.equals(nodeTypeId)) {
                throw new IllegalArgumentException("Setting this parent would create a circular inheritance chain");
            }
            current = dsl.select(DSL.field("parent_node_type_id"))
                .from("node_type").where("id = ?", current)
                .fetchOne(DSL.field("parent_node_type_id"), String.class);
            depth++;
        }
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }

    public static int toIntFlag(Object v) {
        if (v instanceof Boolean b) return b ? 1 : 0;
        if (v instanceof Number n)  return n.intValue() != 0 ? 1 : 0;
        return 0;
    }

    public static int toInt(Object v, int def) {
        if (v instanceof Number n) return n.intValue();
        if (v instanceof String s && !s.isBlank()) {
            try { return Integer.parseInt(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return def;
    }
}
