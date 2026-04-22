package com.plm.node.metamodel.internal;

import com.plm.shared.authorization.PolicyPort;
import com.plm.node.metamodel.internal.ActionRegistrationService;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.metadata.MetadataService;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.security.SecurityContextPort;
import com.plm.shared.event.PlmEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.plm.shared.model.Enums.NumberingScheme;
import com.plm.shared.model.Enums.VersionPolicy;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

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

    private final DSLContext                dsl;
    private final PolicyPort   policyService;
    private final MetaModelCache            metaModelCache;
    private final PlmEventPublisher         eventPublisher;
    private final ActionRegistrationService actionRegistrationService;
    private final SecurityContextPort       secCtx;
    private final MetadataService           metadataService;

    // ================================================================
    // LIFECYCLE
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createLifecycle(String name, String description) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            id, name, description, LocalDateTime.now()
        );
        log.info("Lifecycle created: {}", name);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String addState(String lifecycleId, String name,
                           boolean isInitial, Map<String, String> metadata,
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
            "INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?)",
            id, lifecycleId, name,
            isInitial  ? 1 : 0,
            displayOrder,
            color
        );
        if (metadata != null && !metadata.isEmpty()) {
            metadataService.setAll("LIFECYCLE_STATE", id, metadata);
        }
        log.info("State '{}' added to lifecycle {}", name, lifecycleId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
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
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    public List<Record> getAllLifecycles() {
        return dsl.select().from("lifecycle").orderBy(DSL.field("name")).fetch();
    }

    public Record getLifecycle(String lifecycleId) {
        return dsl.select().from("lifecycle").where("id = ?", lifecycleId).fetchOne();
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateState(String stateId, String name, boolean isInitial,
                            Map<String, String> metadata, int displayOrder, String color) {
        if (isInitial) {
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
            "UPDATE lifecycle_state SET NAME = ?, IS_INITIAL = ?, DISPLAY_ORDER = ?, COLOR = ? WHERE ID = ?",
            name,
            isInitial  ? 1 : 0,
            displayOrder,
            color,
            stateId
        );
        if (metadata != null) {
            metadataService.setAll("LIFECYCLE_STATE", stateId, metadata);
        }
        log.info("LifecycleState {} updated: name={}", stateId, name);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
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
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    public List<Record> getStates(String lifecycleId) {
        return dsl.select().from("lifecycle_state")
                  .where("lifecycle_id = ?", lifecycleId)
                  .orderBy(DSL.field("display_order"))
                  .fetch();
    }

    public List<Map<String, Object>> getTransitions(String lifecycleId) {
        List<Record> transitions = dsl.select().from("lifecycle_transition")
            .where("lifecycle_id = ?", lifecycleId)
            .fetch();

        // Fetch all signature requirements for this lifecycle's transitions in one query.
        // Explicit column aliases avoid ambiguity on "id" (present in both joined tables).
        var sigReqs = dsl.select(
                DSL.field("sr.id").as("sr_id"),
                DSL.field("sr.lifecycle_transition_id").as("lifecycle_transition_id"),
                DSL.field("sr.role_required").as("role_required"),
                DSL.field("sr.display_order").as("display_order"))
            .from("signature_requirement sr")
            .join("lifecycle_transition lt").on("lt.id = sr.lifecycle_transition_id")
            .where("lt.lifecycle_id = ?", lifecycleId)
            .orderBy(DSL.field("sr.display_order"))
            .fetch();

        // Group by transition id
        Map<String, List<Map<String, Object>>> reqsByTransition = sigReqs.stream()
            .collect(Collectors.groupingBy(
                r -> r.get("lifecycle_transition_id", String.class),
                Collectors.mapping(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id",           r.get("sr_id",        String.class));
                    m.put("roleRequired", r.get("role_required", String.class));
                    m.put("displayOrder", r.get("display_order", Integer.class));
                    return m;
                }, Collectors.toList())
            ));

        return transitions.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>(t.intoMap());
            m.put("signatureRequirements",
                reqsByTransition.getOrDefault(t.get("id", String.class), List.of()));
            return m;
        }).collect(Collectors.toList());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String addSignatureRequirement(String transitionId, String roleId, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO signature_requirement (ID, LIFECYCLE_TRANSITION_ID, ROLE_REQUIRED, DISPLAY_ORDER) VALUES (?,?,?,?)",
            id, transitionId, roleId, displayOrder);
        log.info("SignatureRequirement added: transition={} role={}", transitionId, roleId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void removeSignatureRequirement(String reqId) {
        dsl.execute("DELETE FROM signature_requirement WHERE id = ?", reqId);
        log.info("SignatureRequirement {} deleted", reqId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // NODE TYPE
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId) {
        return createNodeType(name, description, lifecycleId, null, null);
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme) {
        return createNodeType(name, description, lifecycleId, numberingScheme, null);
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy) {
        return createNodeType(name, description, lifecycleId, numberingScheme, versionPolicy, null, null);
    }

    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy,
                                 String color, String icon) {
        return createNodeType(name, description, lifecycleId, numberingScheme, versionPolicy, color, icon, null);
    }

    @Transactional
    public String createNodeType(String name, String description, String lifecycleId,
                                 String numberingScheme, String versionPolicy,
                                 String color, String icon, String parentNodeTypeId) {
        String scheme = (numberingScheme != null && !numberingScheme.isBlank())
            ? numberingScheme
            : NumberingScheme.ALPHA_NUMERIC.name();
        String policy = (versionPolicy != null && !versionPolicy.isBlank())
            ? versionPolicy
            : VersionPolicy.ITERATE.name();

        // Validate parent exists and no cycle would be created
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

        // Inherit access rights from parent: authorization_policy rows alone define which
        // actions are wired for this type. Copy the parent's rows so the child starts
        // with the same access rights. New types without a parent have no permissions
        // until admin grants them.
        if (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) {
            copyActionPermissionsFromParent(id, parentNodeTypeId);
        }

        log.info("NodeType created: {} scheme={} parent={}", name, scheme, parentNodeTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    /**
     * Updates the parent node type. Pass null to clear inheritance.
     * Validates that no cycle would be created.
     */
    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeParent(String nodeTypeId, String parentNodeTypeId) {
        if (parentNodeTypeId != null && !parentNodeTypeId.isBlank()) {
            if (parentNodeTypeId.equals(nodeTypeId)) {
                throw new IllegalArgumentException("A node type cannot inherit from itself");
            }
            // Verify parent exists
            int exists = dsl.fetchCount(dsl.selectOne().from("node_type").where("id = ?", parentNodeTypeId));
            if (exists == 0) throw new IllegalArgumentException("Parent node type not found: " + parentNodeTypeId);
            // Cycle check: walk up from parentNodeTypeId; must not reach nodeTypeId
            assertNoCycle(nodeTypeId, parentNodeTypeId);
            dsl.execute("UPDATE node_type SET parent_node_type_id = ? WHERE id = ?", parentNodeTypeId, nodeTypeId);
        } else {
            dsl.execute("UPDATE node_type SET parent_node_type_id = NULL WHERE id = ?", nodeTypeId);
        }
        log.info("NodeType {} parent updated to {}", nodeTypeId, parentNodeTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    /**
     * Asserts that setting parentNodeTypeId as the parent of nodeTypeId (or of a new type)
     * would not create a cycle. Walks up from parentNodeTypeId; throws if it reaches nodeTypeId.
     *
     * @param nodeTypeId     the type being re-parented (null for a new type being created)
     * @param parentNodeTypeId the proposed new parent
     */
    private void assertNoCycle(String nodeTypeId, String parentNodeTypeId) {
        String current = parentNodeTypeId;
        int depth = 0;
        while (current != null && depth < 50) {
            if (current.equals(nodeTypeId)) {
                throw new IllegalArgumentException(
                    "Setting this parent would create a circular inheritance chain");
            }
            current = dsl.select(DSL.field("parent_node_type_id"))
                .from("node_type").where("id = ?", current)
                .fetchOne(DSL.field("parent_node_type_id"), String.class);
            depth++;
        }
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeNumberingScheme(String nodeTypeId, String numberingScheme) {
        NumberingScheme.valueOf(numberingScheme); // throws IllegalArgumentException if unknown
        dsl.execute(
            "UPDATE node_type SET numbering_scheme = ? WHERE id = ?",
            numberingScheme, nodeTypeId
        );
        log.info("NodeType {} numbering_scheme updated to {}", nodeTypeId, numberingScheme);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeVersionPolicy(String nodeTypeId, String versionPolicy) {
        VersionPolicy.valueOf(versionPolicy); // throws IllegalArgumentException if unknown
        dsl.execute(
            "UPDATE node_type SET version_policy = ? WHERE id = ?",
            versionPolicy, nodeTypeId
        );
        log.info("NodeType {} version_policy updated to {}", nodeTypeId, versionPolicy);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeCollapseHistory(String nodeTypeId, boolean collapseHistory) {
        dsl.execute(
            "UPDATE node_type SET collapse_history = ? WHERE id = ?",
            collapseHistory, nodeTypeId
        );
        log.info("NodeType {} collapse_history updated to {}", nodeTypeId, collapseHistory);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeAppearance(String nodeTypeId, String color, String icon) {
        dsl.execute(
            "UPDATE node_type SET color = ?, icon = ? WHERE id = ?",
            (color != null && !color.isBlank()) ? color : null,
            (icon  != null && !icon.isBlank())  ? icon  : null,
            nodeTypeId
        );
        log.info("NodeType {} appearance updated: color={} icon={}", nodeTypeId, color, icon);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @Transactional
    public void updateNodeTypeLifecycle(String nodeTypeId, String lifecycleId) {
        dsl.execute(
            "UPDATE node_type SET lifecycle_id = ? WHERE id = ?",
            lifecycleId != null && !lifecycleId.isBlank() ? lifecycleId : null,
            nodeTypeId
        );
        log.info("NodeType {} lifecycle_id updated to {}", nodeTypeId, lifecycleId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    public List<Record> getAllNodeTypes() {
        return dsl.select().from("node_type").orderBy(DSL.field("name")).fetch();
    }

    /**
     * Returns only the node types the current user is allowed to create.
     * Admins get all; other users are filtered by CHECKOUT action permission.
     *
     * Direct call instead of @PlmAction: filters a list of node types by permission,
     * cannot be expressed as a method-level annotation.
     */
    public List<Record> getCreatableNodeTypes() {
        return getAllNodeTypes().stream()
            .filter(nt -> policyService.canOnNodeType("CREATE_NODE", nt.get("id", String.class)))
            .collect(Collectors.toList());
    }

    // ================================================================
    // ATTRIBUTE DEFINITION
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createAttributeDefinition(String nodeTypeId, Map<String, Object> params) {
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        if (asName) {
            int existing = dsl.fetchCount(
                dsl.selectOne().from("attribute_definition")
                   .where("node_type_id = ?", nodeTypeId)
                   .and("as_name = 1")
            );
            if (existing > 0) {
                throw new IllegalArgumentException(
                    "A 'as_name' attribute already exists for this node type. Only one is allowed.");
            }
        }
        String id = UUID.randomUUID().toString();
        String enumDefId = (String) params.get("enumDefinitionId");
        // Resolve allowed_values from enum_definition if provided
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            INSERT INTO attribute_definition
              (ID, NODE_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP, AS_NAME,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id,
            nodeTypeId,
            params.get("name"),
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")),
            params.get("defaultValue"),
            params.get("namingRegex"),
            allowedValues,
            params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0),
            params.get("displaySection"),
            params.get("tooltip"),
            asName ? 1 : 0,
            enumDefId,
            LocalDateTime.now()
        );
        log.info("AttributeDefinition '{}' created on nodeType {}", params.get("name"), nodeTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    /**
     * Returns the effective attribute definitions for a node type, including inherited ones.
     * Each entry has extra fields {@code inherited} (Boolean) and {@code inherited_from} (String)
     * so the frontend can display inheritance information.
     */
    public List<Map<String, Object>> getAttributeDefinitions(String nodeTypeId) {
        var resolved = metaModelCache.get(nodeTypeId);
        if (resolved == null) return List.of();
        return resolved.attributes().stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",              a.id());
            m.put("node_type_id",    a.ownerNodeTypeId());
            m.put("name",            a.name());
            m.put("label",           a.label());
            m.put("data_type",       a.dataType());
            m.put("widget_type",     a.widgetType());
            m.put("required",        a.required() ? 1 : 0);
            m.put("default_value",   a.defaultValue());
            m.put("naming_regex",    a.namingRegex());
            m.put("allowed_values",  a.allowedValues());
            m.put("enum_definition_id", a.enumDefinitionId());
            m.put("display_order",   a.displayOrder());
            m.put("display_section", a.displaySection());
            m.put("tooltip",         a.tooltip());
            m.put("as_name",         a.asName() ? 1 : 0);
            m.put("inherited",       a.inherited());
            m.put("inherited_from",  a.inheritedFrom());
            return m;
        }).collect(Collectors.toList());
    }

    // ================================================================
    // ATTRIBUTE STATE RULE
    // ================================================================

    /**
     * Sets a state rule for an attribute, scoped to the given nodeTypeId.
     * A child type can call this with its own nodeTypeId to override the rule
     * inherited from a parent type for the same attribute.
     * If nodeTypeId is null, it is looked up from the attribute_definition.
     */
    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String setAttributeStateRule(String nodeTypeId, String attributeDefId, String stateId,
                                        boolean required, boolean editable, boolean visible) {
        String effectiveNodeTypeId = nodeTypeId;
        if (effectiveNodeTypeId == null || effectiveNodeTypeId.isBlank()) {
            effectiveNodeTypeId = dsl.select(DSL.field("node_type_id"))
                .from("attribute_definition").where("id = ?", attributeDefId)
                .fetchOne(DSL.field("node_type_id"), String.class);
        }
        // Upsert: delete existing rule for (nodeTypeId, attrDefId, stateId) then insert
        dsl.execute(
            "DELETE FROM attribute_state_rule WHERE node_type_id = ? AND attribute_definition_id = ? AND lifecycle_state_id = ?",
            effectiveNodeTypeId, attributeDefId, stateId
        );
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO attribute_state_rule (ID, NODE_TYPE_ID, ATTRIBUTE_DEFINITION_ID, LIFECYCLE_STATE_ID, REQUIRED, EDITABLE, VISIBLE) VALUES (?,?,?,?,?,?,?)",
            id, effectiveNodeTypeId, attributeDefId, stateId,
            required ? 1 : 0,
            editable ? 1 : 0,
            visible  ? 1 : 0
        );
        log.info("AttributeStateRule set: nodeType={} attr={} state={} required={} editable={}",
            effectiveNodeTypeId, attributeDefId, stateId, required, editable);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    /** Backward-compatible overload — resolves nodeTypeId from the attribute definition. */
    public String setAttributeStateRule(String attributeDefId, String stateId,
                                        boolean required, boolean editable, boolean visible) {
        return setAttributeStateRule(null, attributeDefId, stateId, required, editable, visible);
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

    @PlmPermission("MANAGE_PSM")
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
        return createLinkType(name, description, sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality, linkLogicalIdLabel, linkLogicalIdPattern, color, null);
    }

    public String createLinkType(String name, String description,
                                 String sourceNodeTypeId, String targetNodeTypeId,
                                 String linkPolicy,
                                 int minCardinality, Integer maxCardinality,
                                 String linkLogicalIdLabel, String linkLogicalIdPattern,
                                 String color, String icon) {
        if (!linkPolicy.equals("VERSION_TO_MASTER") && !linkPolicy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }

        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO link_type
              (ID, NAME, DESCRIPTION, SOURCE_NODE_TYPE_ID, TARGET_NODE_TYPE_ID,
               LINK_POLICY, MIN_CARDINALITY, MAX_CARDINALITY,
               LINK_LOGICAL_ID_LABEL, LINK_LOGICAL_ID_PATTERN, COLOR, ICON, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id, name, description,
            sourceNodeTypeId, targetNodeTypeId,
            linkPolicy, minCardinality, maxCardinality,
            (linkLogicalIdLabel != null && !linkLogicalIdLabel.isBlank()) ? linkLogicalIdLabel : "Link ID",
            (linkLogicalIdPattern != null && !linkLogicalIdPattern.isBlank()) ? linkLogicalIdPattern : null,
            (color != null && !color.isBlank()) ? color : null,
            (icon != null && !icon.isBlank()) ? icon : null,
            LocalDateTime.now()
        );
        log.info("LinkType '{}' created: {} → {} policy={}", name, sourceNodeTypeId, targetNodeTypeId, linkPolicy);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
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

    /**
     * Returns link types available for a node type, including those defined on ancestor types.
     * Each entry includes {@code inherited} and {@code inherited_from} metadata.
     */
    public List<Map<String, Object>> getEffectiveLinkTypes(String nodeTypeId) {
        var resolved = metaModelCache.get(nodeTypeId);
        List<String> chain = resolved != null ? resolved.ancestorChain() : List.of(nodeTypeId);

        // Fetch link types whose source matches any ancestor
        String inClause = chain.stream().map(x -> "?").collect(Collectors.joining(","));
        List<Record> rows = dsl.fetch(
            "SELECT lt.*, nt.name AS owner_type_name " +
            "FROM link_type lt " +
            "JOIN node_type nt ON nt.id = lt.source_node_type_id " +
            "WHERE lt.source_node_type_id IN (" + inClause + ") " +
            "ORDER BY lt.name",
            chain.toArray());

        return rows.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>(r.intoMap());
            String ownerTypeId = r.get("source_node_type_id", String.class);
            boolean inherited = !nodeTypeId.equals(ownerTypeId);
            m.put("inherited", inherited);
            m.put("inherited_from", inherited ? r.get("owner_type_name", String.class) : null);
            m.remove("owner_type_name");
            return m;
        }).collect(Collectors.toList());
    }

    /**
     * Returns the effective actions for a node type, derived from the {@code action}
     * catalog + {@code authorization_policy} rows. Delegates to
     * {@link ActionRegistrationService#getActionsForNodeType}.
     */
    public List<Map<String, Object>> getEffectiveActions(String nodeTypeId) {
        return actionRegistrationService.getActionsForNodeType(nodeTypeId);
    }

    // ================================================================
    // ATTRIBUTE DEFINITION — UPDATE
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateAttributeDefinition(String attrId, Map<String, Object> params) {
        boolean asName = Boolean.TRUE.equals(params.get("asName"));
        if (asName) {
            // Look up the node_type_id for this attribute
            String nodeTypeId = dsl.select(DSL.field("node_type_id"))
                .from("attribute_definition")
                .where("id = ?", attrId)
                .fetchOne(DSL.field("node_type_id"), String.class);
            if (nodeTypeId != null) {
                int existing = dsl.fetchCount(
                    dsl.selectOne().from("attribute_definition")
                       .where("node_type_id = ?", nodeTypeId)
                       .and("as_name = 1")
                       .and("id <> ?", attrId)
                );
                if (existing > 0) {
                    throw new IllegalArgumentException(
                        "A 'as_name' attribute already exists for this node type. Only one is allowed.");
                }
            }
        }
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            UPDATE attribute_definition SET
              LABEL = ?, DATA_TYPE = ?, REQUIRED = ?, DEFAULT_VALUE = ?,
              NAMING_REGEX = ?, ALLOWED_VALUES = ?, WIDGET_TYPE = ?,
              DISPLAY_ORDER = ?, DISPLAY_SECTION = ?, TOOLTIP = ?, AS_NAME = ?,
              ENUM_DEFINITION_ID = ?
            WHERE ID = ?
            """,
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")),
            params.get("defaultValue"),
            params.get("namingRegex"),
            allowedValues,
            params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0),
            params.get("displaySection"),
            params.get("tooltip"),
            asName ? 1 : 0,
            enumDefId,
            attrId
        );
        log.info("AttributeDefinition {} updated", attrId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // LINK TYPE — UPDATE
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateLinkType(String linkTypeId, Map<String, Object> params) {
        String policy = (String) params.getOrDefault("linkPolicy", "VERSION_TO_MASTER");
        if (!policy.equals("VERSION_TO_MASTER") && !policy.equals("VERSION_TO_VERSION")) {
            throw new IllegalArgumentException("linkPolicy must be VERSION_TO_MASTER or VERSION_TO_VERSION");
        }
        String label   = (String) params.get("linkLogicalIdLabel");
        String pattern = (String) params.get("linkLogicalIdPattern");
        String color = (String) params.get("color");
        String icon  = (String) params.get("icon");
        dsl.execute("""
            UPDATE link_type SET
              NAME = ?, DESCRIPTION = ?, LINK_POLICY = ?, MIN_CARDINALITY = ?, MAX_CARDINALITY = ?,
              LINK_LOGICAL_ID_LABEL = ?, LINK_LOGICAL_ID_PATTERN = ?, COLOR = ?, ICON = ?
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
            (icon  != null && !icon.isBlank())  ? icon  : null,
            linkTypeId
        );
        log.info("LinkType {} updated", linkTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // LINK TYPE ATTRIBUTES
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createLinkTypeAttribute(String linkTypeId, Map<String, Object> params) {
        String id = UUID.randomUUID().toString();
        int displayOrder = params.get("displayOrder") instanceof Number n
            ? n.intValue()
            : nextLinkTypeAttrOrder(linkTypeId);
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            INSERT INTO link_type_attribute
              (ID, LINK_TYPE_ID, NAME, LABEL, DATA_TYPE, REQUIRED, DEFAULT_VALUE,
               NAMING_REGEX, ALLOWED_VALUES, WIDGET_TYPE, DISPLAY_ORDER, DISPLAY_SECTION, TOOLTIP,
               ENUM_DEFINITION_ID, CREATED_AT)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """,
            id,
            linkTypeId,
            params.get("name"),
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")),
            params.get("defaultValue"),
            params.get("namingRegex"),
            allowedValues,
            params.getOrDefault("widgetType", "TEXT"),
            displayOrder,
            params.get("displaySection"),
            params.get("tooltip"),
            enumDefId,
            LocalDateTime.now()
        );
        log.info("LinkTypeAttribute '{}' created on linkType {}", params.get("name"), linkTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
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

    @PlmPermission("MANAGE_PSM")
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
            params.get("label"),
            params.getOrDefault("dataType", "STRING"),
            toIntFlag(params.get("required")),
            params.get("defaultValue"),
            params.get("namingRegex"),
            allowedValues,
            params.getOrDefault("widgetType", "TEXT"),
            toInt(params.get("displayOrder"), 0),
            params.get("displaySection"),
            params.get("tooltip"),
            enumDefId,
            attrId
        );
        log.info("LinkTypeAttribute {} updated", attrId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteLinkTypeAttribute(String attrId) {
        dsl.execute("DELETE FROM link_type_attribute WHERE id = ?", attrId);
        log.info("LinkTypeAttribute {} deleted", attrId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
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

    @PlmPermission("MANAGE_PSM")
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

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteLinkTypeCascade(String cascadeId) {
        dsl.execute("DELETE FROM link_type_cascade WHERE id = ?", cascadeId);
        log.info("LinkTypeCascade {} deleted", cascadeId);
    }

    // ================================================================
    // NODE TYPE — IDENTITY UPDATE
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateNodeTypeIdentity(String nodeTypeId, String label, String pattern) {
        dsl.execute(
            "UPDATE node_type SET LOGICAL_ID_LABEL = ?, LOGICAL_ID_PATTERN = ? WHERE ID = ?",
            label, pattern, nodeTypeId
        );
        log.info("NodeType {} identity updated: label={} pattern={}", nodeTypeId, label, pattern);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // DELETE OPERATIONS
    // ================================================================

    @PlmPermission("MANAGE_PSM")
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
            "DELETE FROM authorization_policy " +
            "WHERE permission_code = 'TRANSITION' " +
            "AND node_type_id IN (SELECT id FROM node_type WHERE lifecycle_id = ?) " +
            "AND transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)",
            lifecycleId, lifecycleId
        );
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id IN " +
            "(SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE lifecycle_transition_id IN " +
            "(SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM node_action_guard WHERE transition_id IN " +
            "(SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_state WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle WHERE id = ?", lifecycleId);
        log.info("Lifecycle {} deleted", lifecycleId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
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
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteTransition(String transitionId) {
        // Get from_state_id to locate the TRANSITION permission rows
        String fromStateId = dsl.select(DSL.field("from_state_id")).from("lifecycle_transition")
            .where("id = ?", transitionId)
            .fetchOne(DSL.field("from_state_id"), String.class);
        // Remove LIFECYCLE-scope permissions for this specific transition
        dsl.execute(
            "DELETE FROM authorization_policy WHERE permission_code = 'TRANSITION' AND transition_id = ?",
            transitionId
        );
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE lifecycle_transition_id = ?", transitionId);
        dsl.execute("DELETE FROM node_action_guard WHERE transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE id = ?", transitionId);
        log.info("LifecycleTransition {} deleted", transitionId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
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
        // Cascade action permissions + per-type param overrides + per-type guards
        dsl.execute("DELETE FROM authorization_policy WHERE node_type_id = ?", nodeTypeId);
        dsl.execute("DELETE FROM action_param_override WHERE node_type_id = ?", nodeTypeId);
        dsl.execute("DELETE FROM node_action_guard WHERE node_type_id = ?", nodeTypeId);
        // Block deletion if any child type references this as parent
        int children = dsl.fetchCount(
            dsl.selectOne().from("node_type").where("parent_node_type_id = ?", nodeTypeId)
        );
        if (children > 0) {
            throw new IllegalStateException("Node type has " + children + " child type(s) — remove inheritance first");
        }
        dsl.execute("DELETE FROM node_type WHERE id = ?", nodeTypeId);
        log.info("NodeType {} deleted", nodeTypeId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
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
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
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
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    // ================================================================
    // ACTION REGISTRY — delegates to ActionRegistrationService
    // ================================================================

    public List<Record> getAllActions() {
        return actionRegistrationService.getAllActions();
    }

    public List<Map<String, Object>> getActionsForNodeType(String nodeTypeId) {
        return actionRegistrationService.getActionsForNodeType(nodeTypeId);
    }

    public String registerCustomAction(String actionCode, String displayName, String handlerRef,
                                       String displayCategory, boolean requiresTx,
                                       String description, String scope) {
        return actionRegistrationService.registerCustomAction(
            actionCode, displayName, handlerRef, displayCategory, requiresTx, description, scope);
    }

    public void setPermissionGrant(String nodeTypeId, String permissionCode,
                                   String transitionId, String roleId) {
        actionRegistrationService.setPermissionGrant(nodeTypeId, permissionCode, transitionId, roleId);
    }

    public void removePermissionGrant(String nodeTypeId, String permissionCode,
                                      String transitionId, String roleId) {
        actionRegistrationService.removePermissionGrant(nodeTypeId, permissionCode, transitionId, roleId);
    }

    public List<Map<String, Object>> getPermissionGrants(String nodeTypeId, String permissionCode,
                                                         String transitionId) {
        return actionRegistrationService.getPermissionGrants(nodeTypeId, permissionCode, transitionId);
    }

    public void setNodeActionParamOverride(String nodeTypeId, String actionCode, String parameterId,
                                           String defaultValue, String allowedValues,
                                           Integer required) {
        actionRegistrationService.setNodeActionParamOverride(
            nodeTypeId, actionCode, parameterId, defaultValue, allowedValues, required);
    }

    public Map<String, Object> setManagedWith(String actionId, String managedWithId) {
        return actionRegistrationService.setManagedWith(actionId, managedWithId);
    }

    public List<Map<String, Object>> getManagedActions(String managerActionId) {
        return actionRegistrationService.getManagedActions(managerActionId);
    }

    // ================================================================
    // Helpers
    // ================================================================

    /**
     * Copies all node-scoped authorization_policy rows from parentNodeTypeId to childNodeTypeId.
     * Delegates to ActionRegistrationService.
     */
    private void copyActionPermissionsFromParent(String childNodeTypeId, String parentNodeTypeId) {
        actionRegistrationService.copyActionPermissionsFromParent(childNodeTypeId, parentNodeTypeId);
    }

    /**
     * Resolves allowed_values: if enumDefId is set, builds a JSON array of objects
     * {@code [{"value":"X","label":"Y"}, ...]} from enum_value rows.
     * Otherwise falls back to the explicitly provided allowedValues string.
     */
    private String resolveAllowedValues(String enumDefId, String explicitAllowedValues) {
        if (enumDefId != null && !enumDefId.isBlank()) {
            var rows = dsl.select(DSL.field("value"), DSL.field("label"))
                .from("enum_value")
                .where("enum_definition_id = ?", enumDefId)
                .orderBy(DSL.field("display_order"))
                .fetch();
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

    /** Converts a flag value (Boolean true/false or Integer 1/0) to SMALLINT-safe int. */
    private static int toIntFlag(Object v) {
        if (v instanceof Boolean b) return b ? 1 : 0;
        if (v instanceof Number n)  return n.intValue() != 0 ? 1 : 0;
        return 0;
    }

    /** Converts a nullable Number/String to int, falling back to def if null or non-numeric. */
    private static int toInt(Object v, int def) {
        if (v instanceof Number n) return n.intValue();
        if (v instanceof String s && !s.isBlank()) {
            try { return Integer.parseInt(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return def;
    }

    private void validateStateOwnership(String lifecycleId, String stateId, String label) {
        String owner = dsl.select().from("lifecycle_state")
                          .where("id = ?", stateId)
                          .fetchOne("lifecycle_id", String.class);
        if (!lifecycleId.equals(owner)) {
            throw new IllegalArgumentException(label + " does not belong to lifecycle " + lifecycleId);
        }
    }
}
