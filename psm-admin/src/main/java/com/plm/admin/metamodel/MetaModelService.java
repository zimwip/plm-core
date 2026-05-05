package com.plm.admin.metamodel;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.metadata.MetadataService;
import com.plm.admin.security.PlmAdminSecurityContext;
import com.plm.admin.shared.MapKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for the PLM metamodel: node types, attributes,
 * attribute state rules, link types, and link type attributes.
 *
 * Every write operation publishes a {@link ConfigChangedEvent} so that
 * registered psm-data instances are notified of the change.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MetaModelService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final MetadataService metadataService;

    // ================================================================
    // NODE TYPE
    // ================================================================

    public List<Record> getAllNodeTypes() {
        return dsl.select().from("node_type").orderBy(DSL.field("name")).fetch();
    }

    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy,
                                 String color, String icon, String parentNodeTypeId) {
        String scheme = (numberingScheme != null && !numberingScheme.isBlank()) ? numberingScheme : "ALPHA_NUMERIC";
        String policy = (versionPolicy != null && !versionPolicy.isBlank()) ? versionPolicy : "ITERATE";
        if (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) {
            assertNoCycle(null, parentNodeTypeId);
        }
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_type (ID, NAME, DESCRIPTION, LIFECYCLE_ID, NUMBERING_SCHEME, VERSION_POLICY, COLOR, ICON, PARENT_NODE_TYPE_ID, CREATED_AT) VALUES (?,?,?,?,?,?,?,?,?,?)",
            id, name, description, lifecycleId, scheme, policy,
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) ? parentNodeTypeId : null,
            LocalDateTime.now()
        );
        // Parent-grant copy removed in Phase D4 — grants live in pno-api now.
        log.info("NodeType created: {} scheme={}", name, scheme);
        publishChange("CREATE", "NODE_TYPE", id);
        return id;
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
        dsl.execute("DELETE FROM attribute_state_rule WHERE attribute_definition_id IN (SELECT id FROM attribute_definition WHERE node_type_id = ?)", nodeTypeId);
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

    public List<Record> getAttributeDefinitions(String nodeTypeId) {
        return dsl.select().from("attribute_definition")
            .where("node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("display_order"))
            .fetch();
    }

    @Transactional
    public String createAttributeDefinition(String nodeTypeId, Map<String, Object> params) {
        String id = UUID.randomUUID().toString();
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        if (asName) {
            int existing = dsl.fetchCount(dsl.selectOne().from("attribute_definition")
                .where("node_type_id = ?", nodeTypeId).and("as_name = 1"));
            if (existing > 0) throw new IllegalArgumentException("A 'as_name' attribute already exists for this node type");
        }
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            INSERT INTO attribute_definition
              (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP, AS_NAME,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id, nodeTypeId, params.get("name"), params.get("label"),
            params.getOrDefault("dataType", "STRING"), toIntFlag(params.get("required")),
            params.get("defaultValue"), params.get("namingRegex"), allowedValues,
            params.getOrDefault("widgetType", "TEXT"), toInt(params.get("displayOrder"), 0),
            params.get("displaySection"), params.get("tooltip"), asName ? 1 : 0,
            enumDefId, LocalDateTime.now()
        );
        publishChange("CREATE", "ATTRIBUTE_DEFINITION", id);
        return id;
    }

    @Transactional
    public void updateAttributeDefinition(String attrId, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        dsl.execute("""
            UPDATE attribute_definition SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, ALLOWED_VALUES = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?, AS_NAME = ?,
              ENUM_DEFINITION_ID = ?
            WHERE ID = ?
            """,
            params.get("label"), params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")), params.get("defaultValue"),
            params.get("namingRegex"), allowedValues, params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0), params.get("displaySection"),
            params.get("tooltip"), asName ? 1 : 0, enumDefId, attrId
        );
        publishChange("UPDATE", "ATTRIBUTE_DEFINITION", attrId);
    }

    @Transactional
    public void deleteAttribute(String attrId) {
        dsl.execute("DELETE FROM view_attribute_override WHERE attribute_def_id = ?", attrId);
        dsl.execute("DELETE FROM attribute_state_rule WHERE attribute_definition_id = ?", attrId);
        dsl.execute("DELETE FROM attribute_definition WHERE id = ?", attrId);
        publishChange("DELETE", "ATTRIBUTE_DEFINITION", attrId);
    }

    // ================================================================
    // ATTRIBUTE STATE RULE
    // ================================================================

    public List<Record> getAttributeStateMatrix(String nodeTypeId) {
        return dsl.select()
            .from("attribute_definition ad")
            .leftJoin("attribute_state_rule asr").on("asr.attribute_definition_id = ad.id")
            .leftJoin("lifecycle_state ls").on("ls.id = asr.lifecycle_state_id")
            .where("ad.node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("ad.display_order"), DSL.field("ls.display_order"))
            .fetch();
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
        dsl.execute(
            "DELETE FROM attribute_state_rule WHERE node_type_id = ? AND attribute_definition_id = ? AND lifecycle_state_id = ?",
            effectiveNodeTypeId, attributeDefId, stateId);
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO attribute_state_rule (ID, NODE_TYPE_ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE, VISIBLE) VALUES (?,?,?,?,?,?,?)",
            id, effectiveNodeTypeId, attributeDefId, stateId,
            required ? 1 : 0, editable ? 1 : 0, visible ? 1 : 0);
        publishChange("UPDATE", "ATTRIBUTE_STATE_RULE", id);
        return id;
    }

    // ================================================================
    // LINK TYPE
    // ================================================================

    public List<Record> getAllLinkTypes() {
        return dsl.select().from("link_type").orderBy(DSL.field("name")).fetch();
    }

    public List<Record> getLinkTypesByNodeType(String nodeTypeId) {
        return dsl.select().from("link_type")
            .where("source_node_type_id = ? "
                 + "OR (target_source_id = 'SELF' AND target_type = ?)",
                   nodeTypeId, nodeTypeId)
            .orderBy(DSL.field("name"))
            .fetch();
    }

    @Transactional
    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId,
                                 String targetSourceId, String targetType,
                                 String linkPolicy, int minCardinality, Integer maxCardinality,
                                 String linkLogicalIdLabel, String linkLogicalIdPattern,
                                 String color, String icon) {
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
        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO link_type (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID,
               TARGET_SOURCE_ID, TARGET_TYPE,
               LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY,
               LINK_LOGICAL_ID_LABEL, LINK_LOGICAL_ID_PATTERN, COLOR, ICON, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id, name, description, sourceNodeTypeId, src, targetType,
            linkPolicy, minCardinality, maxCardinality,
            (linkLogicalIdLabel != null && !linkLogicalIdLabel.isBlank()) ? linkLogicalIdLabel : "Link ID",
            (linkLogicalIdPattern != null && !linkLogicalIdPattern.isBlank()) ? linkLogicalIdPattern : null,
            (color != null && !color.isBlank()) ? color : null,
            (icon != null && !icon.isBlank()) ? icon : null,
            LocalDateTime.now()
        );
        publishChange("CREATE", "LINK_TYPE", id);
        return id;
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
        dsl.execute("""
            UPDATE link_type SET NAME = ?, DESCRIPTION = ?, LINK_POLICY = ?,
              MIN_CARDINALITY = ?, MAX_CARDINALITY = ?,
              LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ?, COLOR = ?, ICON = ?
            WHERE ID = ?
            """,
            params.get("name"), params.get("description"), policy,
            params.getOrDefault("minCardinality", 0), params.get("maxCardinality"),
            (label != null && !label.isBlank()) ? label : "Link ID",
            (pattern != null && !pattern.isBlank()) ? pattern : null,
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
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
        String id = UUID.randomUUID().toString();
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            INSERT INTO link_type_attribute
              (ID, LINK_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id, linkTypeId, params.get("name"), params.get("label"),
            params.getOrDefault("dataType", "STRING"), toIntFlag(params.get("required")),
            params.get("defaultValue"), params.get("namingRegex"), allowedValues,
            params.getOrDefault("widgetType", "TEXT"), toInt(params.get("displayOrder"), 0),
            params.get("displaySection"), params.get("tooltip"), enumDefId, LocalDateTime.now()
        );
        publishChange("CREATE", "LINK_TYPE_ATTRIBUTE", id);
        return id;
    }

    @Transactional
    public void updateLinkTypeAttribute(String attrId, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            UPDATE link_type_attribute SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, ALLOWED_VALUES = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?,
              ENUM_DEFINITION_ID = ?
            WHERE ID = ?
            """,
            params.get("label"), params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")), params.get("defaultValue"),
            params.get("namingRegex"), allowedValues, params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0), params.get("displaySection"),
            params.get("tooltip"), enumDefId, attrId
        );
        publishChange("UPDATE", "LINK_TYPE_ATTRIBUTE", attrId);
    }

    @Transactional
    public void deleteLinkTypeAttribute(String attrId) {
        dsl.execute("DELETE FROM link_type_attribute WHERE id = ?", attrId);
        publishChange("DELETE", "LINK_TYPE_ATTRIBUTE", attrId);
    }

    // ================================================================
    // LINK TYPE CASCADES
    // ================================================================

    public List<Map<String, Object>> getLinkTypeCascades(String linkTypeId) {
        return dsl.select(
                DSL.field("ltc.id").as("id"),
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

    @Transactional
    public String createLinkTypeCascade(String linkTypeId, String parentTransitionId,
                                        String childFromStateId, String childTransitionId) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO link_type_cascade (ID, LINK_TYPE_ID, PARENT_TRANSITION_ID, CHILD_FROM_STATE_ID, CHILD_TRANSITION_ID) VALUES (?,?,?,?,?)",
            id, linkTypeId, parentTransitionId, childFromStateId, childTransitionId);
        publishChange("CREATE", "LINK_TYPE_CASCADE", id);
        return id;
    }

    @Transactional
    public void deleteLinkTypeCascade(String cascadeId) {
        dsl.execute("DELETE FROM link_type_cascade WHERE id = ?", cascadeId);
        publishChange("DELETE", "LINK_TYPE_CASCADE", cascadeId);
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

    // copyAuthorizationPolicies removed in Phase D4 — authorization_policy is owned by pno-api.
    // On nodetype create, pno-api's AuthorizationCascadeListener is notified via NATS and may
    // copy parent grants if desired. For now, newly-created child nodetypes start without grants
    // and must be configured explicitly via /api/pno/nodetypes/{nt}/permissions/{code}.

    private String resolveAllowedValues(String enumDefId, String explicitAllowedValues) {
        if (enumDefId != null && !enumDefId.isBlank()) {
            var rows = dsl.select(DSL.field("value"), DSL.field("label"))
                .from("enum_value").where("enum_definition_id = ?", enumDefId)
                .orderBy(DSL.field("display_order")).fetch();
            if (!rows.isEmpty()) {
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < rows.size(); i++) {
                    if (i > 0) sb.append(",");
                    String val = rows.get(i).get("value", String.class);
                    String lbl = rows.get(i).get("label", String.class);
                    sb.append("{\"value\":\"").append(val.replace("\"", "\\\"")).append("\"");
                    if (lbl != null && !lbl.isBlank()) {
                        sb.append(",\"label\":\"").append(lbl.replace("\"", "\\\"")).append("\"");
                    }
                    sb.append("}");
                }
                sb.append("]");
                return sb.toString();
            }
        }
        return explicitAllowedValues;
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
