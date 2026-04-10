package com.plm.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    @Transactional
    public String addState(String lifecycleId, String name,
                           boolean isInitial, boolean isFrozen, boolean isReleased,
                           int displayOrder) {
        // Un seul état initial par lifecycle
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
            "INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, IS_FROZEN, IS_RELEASED, DISPLAY_ORDER) VALUES (?,?,?,?,?,?,?)",
            id, lifecycleId, name,
            isInitial  ? 1 : 0,
            isFrozen   ? 1 : 0,
            isReleased ? 1 : 0,
            displayOrder
        );
        log.info("State '{}' added to lifecycle {}", name, lifecycleId);
        return id;
    }

    @Transactional
    public String addTransition(String lifecycleId, String name,
                                String fromStateId, String toStateId,
                                String guardExpr, String actionType) {
        // Vérifier que les états appartiennent au lifecycle
        validateStateOwnership(lifecycleId, fromStateId, "fromState");
        validateStateOwnership(lifecycleId, toStateId,   "toState");

        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE) VALUES (?,?,?,?,?,?,?)",
            id, lifecycleId, name, fromStateId, toStateId, guardExpr, actionType
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

    @Transactional
    public String createNodeType(String name, String description, String lifecycleId) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_type (ID, NAME, DESCRIPTION, LIFECYCLE_ID, CREATED_AT) VALUES (?,?,?,?,?)",
            id, name, description, lifecycleId, LocalDateTime.now()
        );
        log.info("NodeType created: {}", name);
        return id;
    }

    public List<Record> getAllNodeTypes() {
        return dsl.select().from("node_type").orderBy(DSL.field("name")).fetch();
    }

    // ================================================================
    // ATTRIBUTE DEFINITION
    // ================================================================

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

    @Transactional
    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId, String targetNodeTypeId,
                                 String linkPolicy,
                                 int minCardinality, Integer maxCardinality) {
        if (!linkPolicy.equals("VERSION_TO_MASTER") && !linkPolicy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }

        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO link_type
              (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID, TARGET_NODE_TYPE_ID,
               LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?)
            """,
            id, name, description,
            sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality,
            LocalDateTime.now()
        );
        log.info("LinkType '{}' created: {} → {} policy={}", name, sourceNodeTypeId, targetNodeTypeId, linkPolicy);
        return id;
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
