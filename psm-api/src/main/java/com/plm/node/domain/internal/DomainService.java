package com.plm.node.domain.internal;

import com.plm.node.metamodel.internal.MetaModelCache;
import com.plm.shared.authorization.PlmPermission;
import com.plm.shared.event.PlmEventPublisher;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DomainService {

    private final DSLContext dsl;
    private final MetaModelCache metaModelCache;
    private final PlmEventPublisher eventPublisher;
    private final SecurityContextPort secCtx;

    // ================================================================
    // DOMAIN CRUD
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createDomain(String name, String description, String color, String icon) {
        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO domain (id, name, description, color, icon, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, id, name, description, color, icon, LocalDateTime.now());
        log.info("Domain '{}' created: {}", name, id);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateDomain(String domainId, String name, String description, String color, String icon) {
        int updated = dsl.execute("""
            UPDATE domain SET name = ?, description = ?, color = ?, icon = ?
            WHERE id = ?
            """, name, description, color, icon, domainId);
        if (updated == 0) throw new IllegalArgumentException("Domain not found: " + domainId);
        log.info("Domain '{}' updated", domainId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteDomain(String domainId) {
        int assignedCount = dsl.fetchCount(
            dsl.selectOne().from("node_version_domain").where("domain_id = ?", domainId));
        if (assignedCount > 0) {
            throw new IllegalStateException(
                "Cannot delete domain " + domainId + ": still assigned to " + assignedCount + " node version(s)");
        }
        // Cascade: state rules for domain attrs
        dsl.execute("""
            DELETE FROM attribute_state_rule
            WHERE attribute_definition_id IN (
                SELECT id FROM attribute_definition WHERE domain_id = ?
            )
            """, domainId);
        // Cascade: view overrides for domain attrs
        dsl.execute("""
            DELETE FROM view_attribute_override
            WHERE attribute_def_id IN (
                SELECT id FROM attribute_definition WHERE domain_id = ?
            )
            """, domainId);
        dsl.execute("DELETE FROM attribute_definition WHERE domain_id = ?", domainId);
        dsl.execute("DELETE FROM domain WHERE id = ?", domainId);
        log.info("Domain '{}' deleted", domainId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    public List<Map<String, Object>> getAllDomains() {
        return dsl.select().from("domain")
            .orderBy(DSL.field("name"))
            .fetch()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.get("id", String.class));
                m.put("name", r.get("name", String.class));
                m.put("description", r.get("description", String.class));
                m.put("color", r.get("color", String.class));
                m.put("icon", r.get("icon", String.class));
                return m;
            });
    }

    public Map<String, Object> getDomain(String domainId) {
        Record r = dsl.select().from("domain").where("id = ?", domainId).fetchOne();
        if (r == null) throw new IllegalArgumentException("Domain not found: " + domainId);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.get("id", String.class));
        m.put("name", r.get("name", String.class));
        m.put("description", r.get("description", String.class));
        m.put("color", r.get("color", String.class));
        m.put("icon", r.get("icon", String.class));
        return m;
    }

    // ================================================================
    // DOMAIN ATTRIBUTE DEFINITION CRUD
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String createDomainAttribute(String domainId, Map<String, Object> params) {
        // Domain attributes must not have as_name
        if (Boolean.TRUE.equals(params.get("asName"))) {
            throw new IllegalArgumentException("Domain attributes cannot be marked as 'as_name'");
        }
        String id = UUID.randomUUID().toString();
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            INSERT INTO attribute_definition
              (id, node_type_id, domain_id, name, label, data_type, required, default_value,
               naming_regex, allowed_values, widget_type, display_order, display_section, tooltip, as_name,
               enum_definition_id, created_at)
            VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
            """,
            id, domainId,
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
            enumDefId,
            LocalDateTime.now()
        );
        log.info("Domain attribute '{}' created on domain {}", params.get("name"), domainId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void updateDomainAttribute(String domainId, String attrId, Map<String, Object> params) {
        String enumDefId = (String) params.get("enumDefinitionId");
        String allowedValues = resolveAllowedValues(enumDefId, (String) params.get("allowedValues"));
        dsl.execute("""
            UPDATE attribute_definition
            SET name = ?, label = ?, data_type = ?, required = ?, default_value = ?,
                naming_regex = ?, allowed_values = ?, widget_type = ?,
                display_order = ?, display_section = ?, tooltip = ?,
                enum_definition_id = ?
            WHERE id = ? AND domain_id = ?
            """,
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
            enumDefId,
            attrId, domainId
        );
        log.info("Domain attribute '{}' updated", attrId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public void deleteDomainAttribute(String domainId, String attrId) {
        dsl.execute("""
            DELETE FROM attribute_state_rule WHERE attribute_definition_id = ?
            """, attrId);
        dsl.execute("""
            DELETE FROM view_attribute_override WHERE attribute_def_id = ?
            """, attrId);
        dsl.execute("""
            DELETE FROM node_version_attribute WHERE attribute_def_id = ?
            """, attrId);
        dsl.execute("DELETE FROM attribute_definition WHERE id = ? AND domain_id = ?", attrId, domainId);
        log.info("Domain attribute '{}' deleted from domain {}", attrId, domainId);
        metaModelCache.invalidate();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    public List<Map<String, Object>> getDomainAttributes(String domainId) {
        var attrs = metaModelCache.getDomainAttributes(domainId);
        return attrs.stream().map(a -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.id());
            m.put("domain_id", domainId);
            m.put("name", a.name());
            m.put("label", a.label());
            m.put("data_type", a.dataType());
            m.put("widget_type", a.widgetType());
            m.put("required", a.required() ? 1 : 0);
            m.put("default_value", a.defaultValue());
            m.put("naming_regex", a.namingRegex());
            m.put("allowed_values", a.allowedValues());
            m.put("enum_definition_id", a.enumDefinitionId());
            m.put("display_order", a.displayOrder());
            m.put("display_section", a.displaySection());
            m.put("tooltip", a.tooltip());
            return m;
        }).toList();
    }

    // ================================================================
    // DOMAIN ATTRIBUTE STATE RULES
    // ================================================================

    @PlmPermission("MANAGE_PSM")
    @Transactional
    public String setDomainAttributeStateRule(String domainId, String attrDefId, String stateId,
                                              boolean required, boolean editable, boolean visible) {
        // For domain attrs, node_type_id in attribute_state_rule is NULL (domain-level default).
        // A node_type-scoped override can be set separately via MetaModelService.
        dsl.execute("""
            DELETE FROM attribute_state_rule
            WHERE attribute_definition_id = ? AND lifecycle_state_id = ? AND node_type_id IS NULL
            """, attrDefId, stateId);

        String id = UUID.randomUUID().toString();
        dsl.execute("""
            INSERT INTO attribute_state_rule (id, attribute_definition_id, lifecycle_state_id,
                                              required, editable, visible, node_type_id)
            VALUES (?, ?, ?, ?, ?, ?, NULL)
            """, id, attrDefId, stateId,
            required ? 1 : 0, editable ? 1 : 0, visible ? 1 : 0);
        log.info("Domain attr state rule set: attr={} state={}", attrDefId, stateId);
        metaModelCache.invalidate();
        return id;
    }

    public List<Map<String, Object>> getDomainAttributeStateMatrix(String domainId) {
        return dsl.fetch("""
            SELECT asr.*, ad.name AS attr_name, ad.label AS attr_label,
                   ls.name AS state_name
            FROM attribute_state_rule asr
            JOIN attribute_definition ad ON ad.id = asr.attribute_definition_id
            JOIN lifecycle_state ls ON ls.id = asr.lifecycle_state_id
            WHERE ad.domain_id = ?
            ORDER BY ad.display_order, ls.display_order
            """, domainId)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.get("id", String.class));
                m.put("attributeDefinitionId", r.get("attribute_definition_id", String.class));
                m.put("attrName", r.get("attr_name", String.class));
                m.put("attrLabel", r.get("attr_label", String.class));
                m.put("lifecycleStateId", r.get("lifecycle_state_id", String.class));
                m.put("stateName", r.get("state_name", String.class));
                m.put("required", r.get("required", Integer.class));
                m.put("editable", r.get("editable", Integer.class));
                m.put("visible", r.get("visible", Integer.class));
                m.put("nodeTypeId", r.get("node_type_id", String.class));
                return m;
            });
    }

    // ================================================================
    // DOMAIN ASSIGNMENT TO NODES
    // ================================================================

    /**
     * Assigns a domain to a node version. Validates no attribute name collision
     * with node_type attributes or other assigned domains.
     */
    @Transactional
    public void assignDomain(String nodeId, String domainId, String versionId) {
        // Check domain exists
        Record domain = dsl.select().from("domain").where("id = ?", domainId).fetchOne();
        if (domain == null) throw new IllegalArgumentException("Domain not found: " + domainId);

        // Check not already assigned
        int exists = dsl.fetchCount(
            dsl.selectOne().from("node_version_domain")
               .where("node_version_id = ?", versionId)
               .and("domain_id = ?", domainId));
        if (exists > 0) throw new IllegalStateException("Domain already assigned to this version");

        // Validate no attribute name collision
        String nodeTypeId = dsl.select().from("node").where("id = ?", nodeId)
            .fetchOne("node_type_id", String.class);
        var resolvedType = metaModelCache.get(nodeTypeId);
        List<String> existingNames = new ArrayList<>();
        if (resolvedType != null) {
            resolvedType.attributes().forEach(a -> existingNames.add(a.name()));
        }
        // Also collect names from other assigned domains
        dsl.select().from("node_version_domain")
           .where("node_version_id = ?", versionId)
           .fetch()
           .forEach(r -> {
               String otherDomainId = r.get("domain_id", String.class);
               metaModelCache.getDomainAttributes(otherDomainId)
                   .forEach(a -> existingNames.add(a.name()));
           });

        // Check incoming domain attrs for collisions
        List<ResolvedAttribute> domainAttrs = metaModelCache.getDomainAttributes(domainId);
        for (ResolvedAttribute attr : domainAttrs) {
            if (existingNames.contains(attr.name())) {
                throw new IllegalStateException(
                    "Cannot assign domain '" + domain.get("name", String.class)
                    + "': attribute '" + attr.name() + "' conflicts with an existing attribute");
            }
        }

        // Insert assignment
        dsl.execute(
            "INSERT INTO node_version_domain (id, node_version_id, domain_id) VALUES (?, ?, ?)",
            UUID.randomUUID().toString(), versionId, domainId);

        // Insert default attribute values for domain attrs not yet present
        for (ResolvedAttribute attr : domainAttrs) {
            String defaultValue = attr.defaultValue();
            if (defaultValue != null && !defaultValue.isBlank()) {
                dsl.execute(
                    "INSERT INTO node_version_attribute (id, node_version_id, attribute_def_id, value) VALUES (?, ?, ?, ?)",
                    UUID.randomUUID().toString(), versionId, attr.id(), defaultValue);
            }
        }

        log.info("Domain {} assigned to node {} version {}", domainId, nodeId, versionId);
    }

    /**
     * Unassigns a domain from a node version. Removes domain attribute values.
     */
    @Transactional
    public void unassignDomain(String nodeId, String domainId, String versionId) {
        // Remove attribute values for this domain's attrs
        dsl.execute("""
            DELETE FROM node_version_attribute
            WHERE node_version_id = ?
            AND attribute_def_id IN (SELECT id FROM attribute_definition WHERE domain_id = ?)
            """, versionId, domainId);

        int removed = dsl.execute(
            "DELETE FROM node_version_domain WHERE node_version_id = ? AND domain_id = ?",
            versionId, domainId);
        if (removed == 0) throw new IllegalStateException("Domain not assigned to this version");
        log.info("Domain {} unassigned from node {} version {}", domainId, nodeId, versionId);
    }

    /**
     * Returns assigned domain IDs for a node version.
     */
    public List<String> getAssignedDomainIds(String nodeVersionId) {
        return dsl.select(DSL.field("domain_id"))
            .from("node_version_domain")
            .where("node_version_id = ?", nodeVersionId)
            .fetch("domain_id", String.class);
    }

    /**
     * Returns assigned domains with details for a node version.
     */
    public List<Map<String, Object>> getAssignedDomains(String nodeVersionId) {
        return dsl.fetch("""
            SELECT d.id, d.name, d.description, d.color, d.icon
            FROM domain d
            JOIN node_version_domain nvd ON nvd.domain_id = d.id
            WHERE nvd.node_version_id = ?
            ORDER BY d.name
            """, nodeVersionId)
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", r.get("id", String.class));
                m.put("name", r.get("name", String.class));
                m.put("description", r.get("description", String.class));
                m.put("color", r.get("color", String.class));
                m.put("icon", r.get("icon", String.class));
                return m;
            });
    }

    // ================================================================
    // Helpers
    // ================================================================

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

    private static int toIntFlag(Object val) {
        if (val == null) return 0;
        if (val instanceof Boolean b) return b ? 1 : 0;
        if (val instanceof Number n) return n.intValue();
        return "true".equalsIgnoreCase(val.toString()) || "1".equals(val.toString()) ? 1 : 0;
    }

    private static int toInt(Object val, int defaultVal) {
        if (val == null) return defaultVal;
        if (val instanceof Number n) return n.intValue();
        try { return Integer.parseInt(val.toString()); } catch (NumberFormatException e) { return defaultVal; }
    }
}
