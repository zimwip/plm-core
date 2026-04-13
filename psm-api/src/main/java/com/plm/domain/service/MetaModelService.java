package com.plm.domain.service;

import com.plm.infrastructure.security.PlmAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.plm.domain.model.Enums.NumberingScheme;
import com.plm.domain.model.Enums.VersionPolicy;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Gestion du méta-modèle PLM.
 *
 * Périmètre :
 *  - Lifecycle / State / Transition
 *  - NodeType / AttributeDefinition / AttributeStateRule
 *  - LinkType
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MetaModelService {

    private final DSLContext dsl;

    // ================================================================
    // LIFECYCLE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createLifecycle(String name, String description) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            id, name, description, LocalDateTime.now()
        );
        log.info("Lifecycle created: {}", name);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String addState(String lifecycleId, String name,
                           boolean isInitial, boolean isFrozen, boolean isReleased,
                           int displayOrder, String color) {
        if (isInitial) {
            int existing = dsl.fetchCount(
                dsl.selectOne().from("lifecycle_state")
                   .where("lifecycle_id = ?", lifecycleId)
                   .and("is_initial = 1")
            );
            if (existing > 0) {
                throw new IllegalStateException("Lifecycle already has an initial state");
            }
        }

        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?,?,?)",
            id, lifecycleId, name,
            isInitial  ? 1 : 0,
            isFrozen   ? 1 : 0,
            isReleased ? 1 : 0,
            displayOrder,
            color
        );
        log.info("State '{}' added to lifecycle {}", name, lifecycleId);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String addTransition(String lifecycleId, String name,
                                String fromStateId, String toStateId,
                                String guardExpr, String actionType,
                                String versionStrategy) {
        // Vérifier que les états appartiennent au lifecycle
        validateStateOwnership(lifecycleId, fromStateId, "fromState");
        validateStateOwnership(lifecycleId, toStateId,   "toState");

        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE, VERSION_STRATEGY) VALUES (?,?,?,?,?,?,?,?)",
            id, lifecycleId, name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE"
        );
        log.info("Transition '{}' added: {} → {}", name, fromStateId, toStateId);
        return id;
    }

    public List<Record> getAllLifecycles() {
        return dsl.select().from("lifecycle").orderBy(DSL.field("name")).fetch();
    }

    public Record getLifecycle(String lifecycleId) {
        return dsl.select().from("lifecycle").where("id = ?", lifecycleId).fetchOne();
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateState(String stateId, String name, boolean isInitial, boolean isFrozen,
                            boolean isReleased, int displayOrder, String color) {
        if (isInitial) {
            // Ensure no other state in the same lifecycle is already initial
            String lifecycleId = dsl.select().from("lifecycle_state")
                                    .where("id = ?", stateId)
                                    .fetchOne("lifecycle_id", String.class);
            int existing = dsl.fetchCount(
                dsl.selectOne().from("lifecycle_state")
                   .where("lifecycle_id = ?", lifecycleId)
                   .and("is_initial = 1")
                   .and("id != ?", stateId)
            );
            if (existing > 0) {
                throw new IllegalStateException("Another state is already marked as initial");
            }
        }
        dsl.execute(
            "UPDATE lifecycle_state SET NAME = ?, IS_INITIAL = ?, IS_FROZEN = ?, IS_RELEASED = ?, DISPLAY_ORDER = ?, COLOR = ? WHERE ID = ?",
            name,
            isInitial  ? 1 : 0,
            isFrozen   ? 1 : 0,
            isReleased ? 1 : 0,
            displayOrder,
            color,
            stateId
        );
        log.info("LifecycleState {} updated: name={}", stateId, name);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateTransition(String transitionId, String name, String fromStateId, String toStateId,
                                 String guardExpr, String actionType, String versionStrategy) {
        dsl.execute(
            "UPDATE lifecycle_transition SET NAME = ?, FROM_STATE_ID = ?, TO_STATE_ID = ?, GUARD_EXPR = ?, ACTION_TYPE = ?, VERSION_STRATEGY = ? WHERE ID = ?",
            name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE",
            transitionId
        );
        log.info("LifecycleTransition {} updated: name={}", transitionId, name);
    }

    public List<Record> getStates(String lifecycleId) {
        return dsl.select().from("lifecycle_state")
                  .where("lifecycle_id = ?", lifecycleId)
                  .orderBy(DSL.field("display_order"))
                  .fetch();
    }

    public List<Record> getTransitions(String lifecycleId) {
        return dsl.select().from("lifecycle_transition")
                  .where("lifecycle_id = ?", lifecycleId)
                  .fetch();
    }

    // ================================================================
    // NODE TYPE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId) {
        return createNodeType(name, description, lifecycleId, null, null);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme) {
        return createNodeType(name, description, lifecycleId, numberingScheme, null);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy) {
        return createNodeType(name, description, lifecycleId, numberingScheme, versionPolicy, null, null);
    }

    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy,
                                 String color, String icon) {
        String scheme = (numberingScheme != null && !numberingScheme.isBlank())
            ? numberingScheme
            : NumberingScheme.ALPHA_NUMERIC.name();
        String policy = (versionPolicy != null && !versionPolicy.isBlank())
            ? versionPolicy
            : VersionPolicy.ITERATE.name();
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_type (ID, NAME, DESCRIPTION, LIFECYCLE_ID, NUMBERING_SCHEME, VERSION_POLICY, COLOR, ICON, CREATED_AT) VALUES (?,?,?,?,?,?,?,?,?)",
            id, name, description, lifecycleId, scheme, policy,
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            LocalDateTime.now()
        );

        // Auto-register default-on built-in actions for the new node type
        List<Record> defaultActions = dsl.fetch(
            "SELECT id, display_category FROM action WHERE is_default = 1");
        int displayOrder = 100;
        for (Record action : defaultActions) {
            String actionId = action.get("id", String.class);
            String ntaId = "nta-" + actionId.replaceFirst("^act-", "") + "-" + id;
            dsl.execute(
                "INSERT INTO node_type_action (id, node_type_id, action_id, status, display_order) VALUES (?,?,?,?,?)",
                ntaId, id, actionId, "ENABLED", displayOrder);
            displayOrder += 100;
        }

        // Auto-register TRANSITION actions for all transitions in the lifecycle
        List<Record> transitions = dsl.fetch(
            "SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?", lifecycleId);
        for (Record tr : transitions) {
            String trId = tr.get("id", String.class);
            String ntaId = "nta-tr-" + trId + "-" + id;
            dsl.execute(
                "INSERT INTO node_type_action (id, node_type_id, action_id, status, transition_id, display_order) VALUES (?,?,?,?,?,?)",
                ntaId, id, "act-transition", "ENABLED", trId, 0);
        }

        log.info("NodeType created: {} scheme={}", name, scheme);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateNodeTypeNumberingScheme(String nodeTypeId, String numberingScheme) {
        NumberingScheme.valueOf(numberingScheme); // throws IllegalArgumentException if unknown
        dsl.execute(
            "UPDATE node_type SET numbering_scheme = ? WHERE id = ?",
            numberingScheme, nodeTypeId
        );
        log.info("NodeType {} numbering_scheme updated to {}", nodeTypeId, numberingScheme);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateNodeTypeVersionPolicy(String nodeTypeId, String versionPolicy) {
        VersionPolicy.valueOf(versionPolicy); // throws IllegalArgumentException if unknown
        dsl.execute(
            "UPDATE node_type SET version_policy = ? WHERE id = ?",
            versionPolicy, nodeTypeId
        );
        log.info("NodeType {} version_policy updated to {}", nodeTypeId, versionPolicy);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateNodeTypeAppearance(String nodeTypeId, String color, String icon) {
        dsl.execute(
            "UPDATE node_type SET color = ?, icon = ? WHERE id = ?",
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            nodeTypeId
        );
        log.info("NodeType {} appearance updated: color={} icon={}", nodeTypeId, color, icon);
    }

    @Transactional
    public void updateNodeTypeLifecycle(String nodeTypeId, String lifecycleId) {
        dsl.execute(
            "UPDATE node_type SET lifecycle_id = ? WHERE id = ?",
            lifecycleId != null && !lifecycleId.isBlank() ? lifecycleId : null,
            nodeTypeId
        );
        log.info("NodeType {} lifecycle_id updated to {}", nodeTypeId, lifecycleId);
    }

    public List<Record> getAllNodeTypes() {
        return dsl.select().from("node_type").orderBy(DSL.field("name")).fetch();
    }

    // ================================================================
    // ATTRIBUTE DEFINITION
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createAttributeDefinition(String nodeTypeId, Map<String, Object> params) {
        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO attribute_definition
              (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id,
            nodeTypeId,
            params.get("name"),
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            params.getOrDefault("required", 0),
            params.get("defaultValue"),
            params.get("namingRegex"),
            params.get("allowedValues"),
            params.getOrDefault("widgetType", "TEXT"),
            params.getOrDefault("displayOrder", 0),
            params.get("displaySection"),
            params.get("tooltip"),
            LocalDateTime.now()
        );
        log.info("AttributeDefinition '{}' created on nodeType {}", params.get("name"), nodeTypeId);
        return id;
    }

    public List<Record> getAttributeDefinitions(String nodeTypeId) {
        return dsl.select().from("attribute_definition")
                  .where("node_type_id = ?", nodeTypeId)
                  .orderBy(DSL.field("display_order"))
                  .fetch();
    }

    // ================================================================
    // ATTRIBUTE STATE RULE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String setAttributeStateRule(String attributeDefId, String stateId,
                                        boolean required, boolean editable, boolean visible) {
        // Upsert : supprime l'ancienne règle si elle existe
        dsl.execute(
            "DELETE FROM attribute_state_rule WHERE attribute_definition_id = ? AND lifecycle_state_id = ?",
            attributeDefId, stateId
        );

        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO attribute_state_rule (ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE, VISIBLE) VALUES (?,?,?,?,?,?)",
            id, attributeDefId, stateId,
            required ? 1 : 0,
            editable ? 1 : 0,
            visible  ? 1 : 0
        );
        log.info("AttributeStateRule set: attr={} state={} required={} editable={}", attributeDefId, stateId, required, editable);
        return id;
    }

    /**
     * Retourne la matrice complète attribut × état pour un nodeType.
     * Utile pour l'interface de configuration du méta-modèle.
     */
    public List<Record> getAttributeStateMatrix(String nodeTypeId) {
        return dsl.select()
            .from("attribute_definition ad")
            .leftJoin("attribute_state_rule asr").on("asr.attribute_definition_id = ad.id")
            .leftJoin("lifecycle_state ls").on("ls.id = asr.lifecycle_state_id")
            .where("ad.node_type_id = ?", nodeTypeId)
            .orderBy(DSL.field("ad.display_order"), DSL.field("ls.display_order"))
            .fetch();
    }

    // ================================================================
    // LINK TYPE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId, String targetNodeTypeId,
                                 String linkPolicy,
                                 int minCardinality, Integer maxCardinality,
                                 String linkLogicalIdLabel, String linkLogicalIdPattern) {
        return createLinkType(name, description, sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality, linkLogicalIdLabel, linkLogicalIdPattern, null);
    }

    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId, String targetNodeTypeId,
                                 String linkPolicy,
                                 int minCardinality, Integer maxCardinality,
                                 String linkLogicalIdLabel, String linkLogicalIdPattern,
                                 String color) {
        if (!linkPolicy.equals("VERSION_TO_MASTER") && !linkPolicy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }

        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO link_type
              (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID, TARGET_NODE_TYPE_ID,
               LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY,
               LINK_LOGICAL_ID_LABEL, LINK_LOGICAL_ID_PATTERN, COLOR, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id, name, description,
            sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality,
            (linkLogicalIdLabel != null && !linkLogicalIdLabel.isBlank()) ? linkLogicalIdLabel : "Link ID",
            (linkLogicalIdPattern != null && !linkLogicalIdPattern.isBlank()) ? linkLogicalIdPattern : null,
            (color != null && !color.isBlank()) ? color : null,
            LocalDateTime.now()
        );
        log.info("LinkType '{}' created: {} → {} policy={}", name, sourceNodeTypeId, targetNodeTypeId, linkPolicy);
        return id;
    }

    /** Backward-compatible overload for tests that don't supply identity fields. */
    @PlmAction("MANAGE_METAMODEL")
    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId, String targetNodeTypeId,
                                 String linkPolicy,
                                 int minCardinality, Integer maxCardinality) {
        return createLinkType(name, description, sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality, null, null);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateLinkTypeIdentity(String linkTypeId, String linkLogicalIdLabel, String linkLogicalIdPattern) {
        dsl.execute("""
            UPDATE link_type SET
              LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ?
            WHERE ID = ?
            """,
            (linkLogicalIdLabel != null && !linkLogicalIdLabel.isBlank()) ? linkLogicalIdLabel : "Link ID",
            (linkLogicalIdPattern != null && !linkLogicalIdPattern.isBlank()) ? linkLogicalIdPattern : null,
            linkTypeId
        );
        log.info("LinkType {} identity updated: label={} pattern={}", linkTypeId, linkLogicalIdLabel, linkLogicalIdPattern);
    }

    public List<Record> getAllLinkTypes() {
        return dsl.select().from("link_type").orderBy(DSL.field("name")).fetch();
    }

    public List<Record> getLinkTypesForSource(String sourceNodeTypeId) {
        return dsl.select().from("link_type")
                  .where("source_node_type_id = ?", sourceNodeTypeId)
                  .or("source_node_type_id IS NULL")
                  .fetch();
    }

    // ================================================================
    // ATTRIBUTE DEFINITION — UPDATE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateAttributeDefinition(String attrId, Map<String, Object> params) {
        dsl.execute("""
            UPDATE attribute_definition SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, ALLOWED_VALUES = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?
            WHERE ID = ?
            """,
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            Boolean.TRUE.equals(params.get("required")) ? 1 : 0,
            params.get("defaultValue"),
            params.get("namingRegex"),
            params.get("allowedValues"),
            params.getOrDefault("widgetType", "TEXT"),
            params.getOrDefault("displayOrder", 0),
            params.get("displaySection"),
            params.get("tooltip"),
            attrId
        );
        log.info("AttributeDefinition {} updated", attrId);
    }

    // ================================================================
    // LINK TYPE — UPDATE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateLinkType(String linkTypeId, Map<String, Object> params) {
        String policy = (String) params.getOrDefault("linkPolicy", "VERSION_TO_MASTER");
        if (!policy.equals("VERSION_TO_MASTER") && !policy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }
        String label   = (String) params.get("linkLogicalIdLabel");
        String pattern = (String) params.get("linkLogicalIdPattern");
        String color = (String) params.get("color");
        dsl.execute("""
            UPDATE link_type SET
              NAME = ?, DESCRIPTION = ?, LINK_POLICY = ?, MIN_CARDINALITY = ?, MAX_CARDINALITY = ?,
              LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ?, COLOR = ?
            WHERE ID = ?
            """,
            params.get("name"),
            params.get("description"),
            policy,
            params.getOrDefault("minCardinality", 0),
            params.get("maxCardinality"),
            (label != null && !label.isBlank()) ? label : "Link ID",
            (pattern != null && !pattern.isBlank()) ? pattern : null,
            (color != null && !color.isBlank()) ? color : null,
            linkTypeId
        );
        log.info("LinkType {} updated", linkTypeId);
    }

    // ================================================================
    // LINK TYPE ATTRIBUTES
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createLinkTypeAttribute(String linkTypeId, Map<String, Object> params) {
        String id = UUID.randomUUID().toString();
        int displayOrder = params.get("displayOrder") instanceof Number n
            ? n.intValue()
            : nextLinkTypeAttrOrder(linkTypeId);
        dsl.execute("""
            INSERT INTO link_type_attribute
              (ID, LINK_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id,
            linkTypeId,
            params.get("name"),
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            Boolean.TRUE.equals(params.get("required")) ? 1 : 0,
            params.get("defaultValue"),
            params.get("namingRegex"),
            params.get("allowedValues"),
            params.getOrDefault("widgetType", "TEXT"),
            displayOrder,
            params.get("displaySection"),
            params.get("tooltip"),
            LocalDateTime.now()
        );
        log.info("LinkTypeAttribute '{}' created on linkType {}", params.get("name"), linkTypeId);
        return id;
    }

    public List<Record> getLinkTypeAttributes(String linkTypeId) {
        return dsl.select().from("link_type_attribute")
                  .where("link_type_id = ?", linkTypeId)
                  .orderBy(DSL.field("display_order"))
                  .fetch();
    }

    private int nextLinkTypeAttrOrder(String linkTypeId) {
        Integer max = dsl.select(DSL.max(DSL.field("display_order", Integer.class)))
            .from("link_type_attribute").where("link_type_id = ?", linkTypeId)
            .fetchOne(0, Integer.class);
        return max != null ? max + 1 : 0;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateLinkTypeAttribute(String attrId, Map<String, Object> params) {
        dsl.execute("""
            UPDATE link_type_attribute SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, ALLOWED_VALUES = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?
            WHERE ID = ?
            """,
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            Boolean.TRUE.equals(params.get("required")) ? 1 : 0,
            params.get("defaultValue"),
            params.get("namingRegex"),
            params.get("allowedValues"),
            params.getOrDefault("widgetType", "TEXT"),
            params.getOrDefault("displayOrder", 0),
            params.get("displaySection"),
            params.get("tooltip"),
            attrId
        );
        log.info("LinkTypeAttribute {} updated", attrId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteLinkTypeAttribute(String attrId) {
        dsl.execute("DELETE FROM link_type_attribute WHERE id = ?", attrId);
        log.info("LinkTypeAttribute {} deleted", attrId);
    }

    // ================================================================
    // LINK TYPE CASCADE RULES
    // ================================================================

    public List<Map<String, Object>> getLinkTypeCascades(String linkTypeId) {
        return dsl.select(
                DSL.field("ltc.id").as("id"),
                DSL.field("ltc.link_type_id").as("link_type_id"),
                DSL.field("ltc.parent_transition_id").as("parent_transition_id"),
                DSL.field("pt.name").as("parent_transition_name"),
                DSL.field("ltc.child_from_state_id").as("child_from_state_id"),
                DSL.field("cfs.name").as("child_from_state_name"),
                DSL.field("cfs.color").as("child_from_state_color"),
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

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String createLinkTypeCascade(String linkTypeId, String parentTransitionId,
                                        String childFromStateId, String childTransitionId) {
        int exists = dsl.fetchCount(
            dsl.selectOne().from("link_type_cascade")
               .where("link_type_id = ?", linkTypeId)
               .and("parent_transition_id = ?", parentTransitionId)
               .and("child_from_state_id = ?", childFromStateId)
        );
        if (exists > 0) throw new IllegalStateException(
            "A cascade rule for this parent transition / child state combination already exists");
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO link_type_cascade (ID, LINK_TYPE_ID, PARENT_TRANSITION_ID, CHILD_FROM_STATE_ID, CHILD_TRANSITION_ID) VALUES (?,?,?,?,?)",
            id, linkTypeId, parentTransitionId, childFromStateId, childTransitionId
        );
        log.info("LinkTypeCascade created: linkType={} parentTx={} childFrom={} childTx={}",
            linkTypeId, parentTransitionId, childFromStateId, childTransitionId);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteLinkTypeCascade(String cascadeId) {
        dsl.execute("DELETE FROM link_type_cascade WHERE id = ?", cascadeId);
        log.info("LinkTypeCascade {} deleted", cascadeId);
    }

    // ================================================================
    // NODE TYPE — IDENTITY UPDATE
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void updateNodeTypeIdentity(String nodeTypeId, String label, String pattern) {
        dsl.execute(
            "UPDATE node_type SET LOGICAL_ID_LABEL = ?, LOGICAL_ID_PATTERN = ? WHERE ID = ?",
            label, pattern, nodeTypeId
        );
        log.info("NodeType {} identity updated: label={} pattern={}", nodeTypeId, label, pattern);
    }

    // ================================================================
    // DELETE OPERATIONS
    // ================================================================

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteLifecycle(String lifecycleId) {
        int used = dsl.fetchCount(
            dsl.selectOne().from("node_type").where("lifecycle_id = ?", lifecycleId)
        );
        if (used > 0) {
            throw new IllegalStateException("Lifecycle is referenced by " + used + " node type(s)");
        }
        // Cascade: attribute_state_rules and action permissions linked to this lifecycle
        dsl.execute(
            "DELETE FROM attribute_state_rule WHERE lifecycle_state_id IN " +
            "(SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId
        );
        // Remove TRANSITION permissions scoped to transitions of this lifecycle
        dsl.execute(
            "DELETE FROM action_permission " +
            "WHERE action_id = 'act-transition' " +
            "AND node_type_id IN (SELECT id FROM node_type WHERE lifecycle_id = ?) " +
            "AND transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)",
            lifecycleId, lifecycleId
        );
        dsl.execute(
            "DELETE FROM node_type_action WHERE transition_id IN " +
            "(SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId
        );
        dsl.execute("DELETE FROM lifecycle_transition WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_state WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle WHERE id = ?", lifecycleId);
        log.info("Lifecycle {} deleted", lifecycleId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteState(String stateId) {
        int inTransitions = dsl.fetchCount(
            dsl.selectOne().from("lifecycle_transition")
               .where("from_state_id = ?", stateId).or("to_state_id = ?", stateId)
        );
        if (inTransitions > 0) {
            throw new IllegalStateException("State is referenced by " + inTransitions + " transition(s) — delete them first");
        }
        int inVersions = dsl.fetchCount(
            dsl.selectOne().from("node_version").where("lifecycle_state_id = ?", stateId)
        );
        if (inVersions > 0) {
            throw new IllegalStateException("State is used by " + inVersions + " node version(s)");
        }
        dsl.execute("DELETE FROM attribute_state_rule WHERE lifecycle_state_id = ?", stateId);
        dsl.execute("DELETE FROM lifecycle_state WHERE id = ?", stateId);
        log.info("LifecycleState {} deleted", stateId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteTransition(String transitionId) {
        // Get from_state_id to locate the TRANSITION permission rows
        String fromStateId = dsl.select(DSL.field("from_state_id")).from("lifecycle_transition")
            .where("id = ?", transitionId)
            .fetchOne(DSL.field("from_state_id"), String.class);
        // Remove LIFECYCLE-scope permissions for this specific transition
        dsl.execute(
            "DELETE FROM action_permission WHERE action_id = 'act-transition' AND transition_id = ?",
            transitionId
        );
        dsl.execute("DELETE FROM node_type_action WHERE transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE id = ?", transitionId);
        log.info("LifecycleTransition {} deleted", transitionId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteNodeType(String nodeTypeId) {
        int used = dsl.fetchCount(
            dsl.selectOne().from("node").where("node_type_id = ?", nodeTypeId)
        );
        if (used > 0) {
            throw new IllegalStateException("Node type is referenced by " + used + " node(s)");
        }
        // Cascade attribute state rules, then attributes
        dsl.execute(
            "DELETE FROM attribute_state_rule WHERE attribute_definition_id IN " +
            "(SELECT id FROM attribute_definition WHERE node_type_id = ?)", nodeTypeId
        );
        dsl.execute("DELETE FROM attribute_definition WHERE node_type_id = ?", nodeTypeId);
        dsl.execute(
            "DELETE FROM link_type WHERE source_node_type_id = ? OR target_node_type_id = ?",
            nodeTypeId, nodeTypeId
        );
        // Cascade action permissions then node_type_action rows
        dsl.execute("DELETE FROM action_permission WHERE node_type_id = ?", nodeTypeId);
        dsl.execute("DELETE FROM node_type_action WHERE node_type_id = ?", nodeTypeId);
        dsl.execute("DELETE FROM node_type WHERE id = ?", nodeTypeId);
        log.info("NodeType {} deleted", nodeTypeId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteAttribute(String attrId) {
        int used = dsl.fetchCount(
            dsl.selectOne().from("node_version_attribute").where("attribute_def_id = ?", attrId)
        );
        if (used > 0) {
            throw new IllegalStateException("Attribute has " + used + " value(s) recorded on existing nodes");
        }
        dsl.execute("DELETE FROM attribute_state_rule WHERE attribute_definition_id = ?", attrId);
        dsl.execute("DELETE FROM attribute_definition WHERE id = ?", attrId);
        log.info("AttributeDefinition {} deleted", attrId);
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void deleteLinkType(String linkTypeId) {
        int used = dsl.fetchCount(
            dsl.selectOne().from("node_version_link").where("link_type_id = ?", linkTypeId)
        );
        if (used > 0) {
            throw new IllegalStateException("Link type is used by " + used + " existing link(s)");
        }
        dsl.execute("DELETE FROM link_type WHERE id = ?", linkTypeId);
        log.info("LinkType {} deleted", linkTypeId);
    }

    // ================================================================
    // ACTION REGISTRY
    // ================================================================

    public List<Record> getAllActions() {
        return dsl.select().from("action").orderBy(DSL.field("action_code")).fetch();
    }

    public List<Map<String, Object>> getActionsForNodeType(String nodeTypeId) {
        return dsl.fetch("""
            SELECT
                nta.id               AS nta_id,
                nta.status,
                nta.display_name_override,
                nta.display_order,
                nta.transition_id,
                na.id                AS action_id,
                na.action_code,
                na.action_kind,
                na.display_name,
                na.display_category,
                na.requires_tx,
                na.handler_ref,
                lt.name              AS transition_name
            FROM node_type_action nta
            JOIN action na ON na.id = nta.action_id
            LEFT JOIN lifecycle_transition lt ON lt.id = nta.transition_id
            WHERE nta.node_type_id = ?
            ORDER BY nta.display_order, na.display_category
            """, nodeTypeId).intoMaps();
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public String registerCustomAction(String nodeTypeId, String actionCode,
                                       String displayName, String handlerRef,
                                       String displayCategory, boolean requiresTx,
                                       String description) {
        // Create the global action entry if it doesn't exist yet
        String actionId = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);

        if (actionId == null) {
            actionId = UUID.randomUUID().toString();
            dsl.execute("""
                INSERT INTO action
                  (ID, ACTION_CODE, ACTION_KIND, DISPLAY_NAME, DESCRIPTION,
                   HANDLER_REF, DISPLAY_CATEGORY, REQUIRES_TX, IS_DEFAULT, CREATED_AT)
                VALUES (?,?,?,?,?,?,?,?,?,?)
                """,
                actionId, actionCode, "CUSTOM", displayName, description,
                handlerRef, displayCategory != null ? displayCategory : "PRIMARY",
                requiresTx ? 1 : 0, 0, LocalDateTime.now());
            log.info("Custom action registered: {} (handler={})", actionCode, handlerRef);
        }

        // Wire it to the node type
        String ntaId = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO node_type_action (ID, NODE_TYPE_ID, ACTION_ID, STATUS, DISPLAY_ORDER)
            VALUES (?,?,?,?,?)
            """, ntaId, nodeTypeId, actionId, "ENABLED", 999);
        log.info("Action {} enabled for nodeType {}", actionCode, nodeTypeId);
        return ntaId;
    }

    @PlmAction("MANAGE_METAMODEL")
    @Transactional
    public void setNodeTypeActionStatus(String nodeTypeActionId, String status) {
        if (!"ENABLED".equals(status) && !"DISABLED".equals(status))
            throw new IllegalArgumentException("status must be ENABLED or DISABLED");
        dsl.execute("UPDATE node_type_action SET STATUS = ? WHERE ID = ?", status, nodeTypeActionId);
    }

    /**
     * Adds a permission row granting {@code roleId} the right to execute the given
     * node_type_action in this project space. For LIFECYCLE-scope actions (transitions),
     * {@code transition_id} is taken from the NTA row — granting access to that specific
     * transition. For NODE-scope actions, {@code transition_id} is NULL.
     *
     * <p>{@code lifecycleStateId} is accepted for API backward compatibility but is ignored;
     * scope is now determined by the action's {@code scope} column.
     */
    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void setNodeTypeActionPermission(String nodeTypeActionId, String roleId,
                                             String lifecycleStateId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();

        var derived = resolveNtaForPermission(nodeTypeActionId);
        String nodeTypeId   = derived[0];
        String actionId     = derived[1];
        String transitionId = derived[2]; // null for NODE-scope, set for LIFECYCLE-scope

        // Upsert: delete existing row for (nodeType, action, role, transition, ps), then insert
        dsl.execute(
            "DELETE FROM action_permission WHERE node_type_id = ? AND action_id = ? AND role_id = ? " +
            "AND project_space_id = ? AND (transition_id = ? OR (transition_id IS NULL AND ? IS NULL))",
            nodeTypeId, actionId, roleId, psId, transitionId, transitionId);
        dsl.execute(
            "INSERT INTO action_permission (ID, ACTION_ID, PROJECT_SPACE_ID, ROLE_ID, NODE_TYPE_ID, TRANSITION_ID) VALUES (?,?,?,?,?,?)",
            UUID.randomUUID().toString(), actionId, psId, roleId, nodeTypeId, transitionId);
        log.info("ActionPermission set: nodeType={} action={} role={} transition={} ps={}",
            nodeTypeId, actionId, roleId, transitionId, psId);
    }

    /**
     * Removes the permission row for the given role on this node_type_action.
     *
     * <p>{@code lifecycleStateId} is accepted for API backward compatibility but is ignored.
     */
    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void removeNodeTypeActionPermission(String nodeTypeActionId, String roleId,
                                                String lifecycleStateId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();

        var derived = resolveNtaForPermission(nodeTypeActionId);
        String nodeTypeId   = derived[0];
        String actionId     = derived[1];
        String transitionId = derived[2];

        dsl.execute(
            "DELETE FROM action_permission WHERE node_type_id = ? AND action_id = ? AND role_id = ? " +
            "AND project_space_id = ? AND (transition_id = ? OR (transition_id IS NULL AND ? IS NULL))",
            nodeTypeId, actionId, roleId, psId, transitionId, transitionId);
    }

    public List<Map<String, Object>> getNodeTypeActionPermissions(String nodeTypeActionId) {
        String psId = com.plm.infrastructure.security.PlmProjectSpaceContext.require();

        var derived = resolveNtaForPermission(nodeTypeActionId);
        String nodeTypeId   = derived[0];
        String actionId     = derived[1];
        String transitionId = derived[2];

        // role_id is a plain VARCHAR reference to pno-api's pno_role — no JOIN needed
        if (transitionId != null) {
            return dsl.fetch("""
                SELECT id, role_id, transition_id
                FROM action_permission
                WHERE node_type_id = ? AND action_id = ? AND project_space_id = ? AND transition_id = ?
                ORDER BY role_id
                """, nodeTypeId, actionId, psId, transitionId).intoMaps();
        }
        return dsl.fetch("""
            SELECT id, role_id, transition_id
            FROM action_permission
            WHERE node_type_id = ? AND action_id = ? AND project_space_id = ? AND transition_id IS NULL
            ORDER BY role_id
            """, nodeTypeId, actionId, psId).intoMaps();
    }

    /**
     * Resolves node_type_id, action_id, and transition_id from a node_type_action ID.
     * Returns String[3] = { nodeTypeId, actionId, transitionId }.
     * transitionId is null for NODE-scope actions.
     */
    private String[] resolveNtaForPermission(String nodeTypeActionId) {
        var row = dsl.select(
                DSL.field("nta.node_type_id").as("node_type_id"),
                DSL.field("nta.action_id").as("action_id"),
                DSL.field("nta.transition_id").as("transition_id"))
            .from("node_type_action nta")
            .where("nta.id = ?", nodeTypeActionId)
            .fetchOne();
        if (row == null) throw new IllegalArgumentException("Unknown node_type_action: " + nodeTypeActionId);
        return new String[]{
            row.get("node_type_id",  String.class),
            row.get("action_id",     String.class),
            row.get("transition_id", String.class)   // null for NODE-scope
        };
    }

    @PlmAction("MANAGE_ROLES")
    @Transactional
    public void setNodeActionParamOverride(String nodeTypeActionId, String parameterId,
                                            String defaultValue, String allowedValues,
                                            Integer required) {
        dsl.execute(
            "DELETE FROM action_param_override WHERE node_type_action_id = ? AND parameter_id = ?",
            nodeTypeActionId, parameterId);
        dsl.execute("""
            INSERT INTO action_param_override
              (ID, NODE_TYPE_ACTION_ID, PARAMETER_ID, DEFAULT_VALUE, ALLOWED_VALUES, REQUIRED)
            VALUES (?,?,?,?,?,?)
            """, UUID.randomUUID().toString(), nodeTypeActionId, parameterId,
            defaultValue, allowedValues, required);
    }

    // ================================================================
    // Helpers
    // ================================================================

    private void validateStateOwnership(String lifecycleId, String stateId, String label) {
        String owner = dsl.select().from("lifecycle_state")
                          .where("id = ?", stateId)
                          .fetchOne("lifecycle_id", String.class);
        if (!lifecycleId.equals(owner)) {
            throw new IllegalArgumentException(label + " does not belong to lifecycle " + lifecycleId);
        }
    }
}
