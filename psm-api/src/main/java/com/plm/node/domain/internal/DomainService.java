package com.plm.node.domain.internal;

import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.DomainConfig;
import com.plm.shared.model.ResolvedAttribute;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final ConfigCache configCache;
    private final MetaModelCachePort metaModelCache;

    // ================================================================
    // DOMAIN ASSIGNMENT TO NODES
    // ================================================================

    /**
     * Assigns a domain to a node version. Validates no attribute name collision
     * with node_type attributes or other assigned domains.
     */
    @Transactional
    public void assignDomain(String nodeId, String domainId, String versionId) {
        // Check domain exists in ConfigCache
        DomainConfig domain = configCache.getDomain(domainId)
            .orElseThrow(() -> new IllegalArgumentException("Domain not found: " + domainId));

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
                    "Cannot assign domain '" + domain.name()
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
        // Remove attribute values for this domain's attrs using ConfigCache
        List<ResolvedAttribute> domainAttrs = metaModelCache.getDomainAttributes(domainId);
        for (ResolvedAttribute attr : domainAttrs) {
            dsl.execute(
                "DELETE FROM node_version_attribute WHERE node_version_id = ? AND attribute_def_id = ?",
                versionId, attr.id());
        }

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
        List<String> domainIds = getAssignedDomainIds(nodeVersionId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (String domainId : domainIds) {
            configCache.getDomain(domainId).ifPresent(d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", d.id());
                m.put("name", d.name());
                m.put("description", d.description());
                m.put("color", d.color());
                m.put("icon", d.icon());
                result.add(m);
            });
        }
        result.sort((a, b) -> String.valueOf(a.get("name")).compareTo(String.valueOf(b.get("name"))));
        return result;
    }
}
