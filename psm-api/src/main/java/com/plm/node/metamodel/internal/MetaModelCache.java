package com.plm.node.metamodel.internal;

import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.model.ResolvedNodeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

/**
 * In-memory cache of the resolved metamodel (node types + inherited attributes).
 *
 * <p>Built lazily on first access, invalidated on every metamodel write via
 * {@link MetaModelService}. The cache is an {@link AtomicReference} holding an
 * immutable snapshot — concurrent readers never block, and invalidation simply
 * swaps in null to trigger a rebuild on the next access.
 *
 * <p>The cache also provides a {@link #getStateRule} helper that resolves the
 * most specific {@code attribute_state_rule} for a (context node type, attribute,
 * state) triple, applying child-type overrides first and falling back to the
 * owner type's rule.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MetaModelCache {

    private final DSLContext dsl;

    private final AtomicReference<Map<String, ResolvedNodeType>> cache = new AtomicReference<>(null);
    private final AtomicReference<Map<String, List<ResolvedAttribute>>> domainAttrCache = new AtomicReference<>(null);
    private final AtomicReference<Map<String, Record>> domainCache = new AtomicReference<>(null);

    // ── Public API ────────────────────────────────────────────────────

    public ResolvedNodeType get(String nodeTypeId) {
        return getAll().get(nodeTypeId);
    }

    public Map<String, ResolvedNodeType> getAll() {
        Map<String, ResolvedNodeType> current = cache.get();
        if (current == null) {
            current = buildCache();
            cache.set(current);
        }
        return current;
    }

    /** Returns resolved attributes for a domain. */
    public List<ResolvedAttribute> getDomainAttributes(String domainId) {
        var all = getAllDomainAttributes();
        return all.getOrDefault(domainId, List.of());
    }

    /** Returns all domain records keyed by ID. */
    public Map<String, Record> getAllDomains() {
        Map<String, Record> current = domainCache.get();
        if (current == null) {
            buildDomainCaches();
            current = domainCache.get();
        }
        return current != null ? current : Map.of();
    }

    private Map<String, List<ResolvedAttribute>> getAllDomainAttributes() {
        Map<String, List<ResolvedAttribute>> current = domainAttrCache.get();
        if (current == null) {
            buildDomainCaches();
            current = domainAttrCache.get();
        }
        return current != null ? current : Map.of();
    }

    /** Invalidates the cache; next call to getAll/get triggers a full rebuild. */
    public void invalidate() {
        cache.set(null);
        domainAttrCache.set(null);
        domainCache.set(null);
        log.debug("MetaModelCache invalidated");
    }

    /**
     * Returns the most specific attribute_state_rule for the given (contextNodeTypeId,
     * attrDefId, stateId) triple.
     *
     * Resolution order:
     * 1. Rule scoped to contextNodeTypeId (child-type override or node-type-scoped domain override).
     * 2. Rule scoped to the attribute's ownerNodeTypeId (parent definition's rule).
     * 3. Rule with node_type_id IS NULL (domain-level default for domain attributes).
     */
    public Record getStateRule(String contextNodeTypeId, String attrDefId, String stateId) {
        if (stateId == null || attrDefId == null) return null;

        // 1. Context type override (child or own rule, or node-type-scoped domain override)
        Record rule = dsl.select()
            .from("attribute_state_rule")
            .where("node_type_id = ?", contextNodeTypeId)
            .and("attribute_definition_id = ?", attrDefId)
            .and("lifecycle_state_id = ?", stateId)
            .fetchOne();
        if (rule != null) return rule;

        // 2. Fall back to owner type's rule (only relevant for inherited node_type attrs)
        ResolvedNodeType nt = get(contextNodeTypeId);
        if (nt != null) {
            String ownerTypeId = nt.attributes().stream()
                .filter(a -> a.id().equals(attrDefId))
                .map(ResolvedAttribute::ownerNodeTypeId)
                .findFirst().orElse(null);
            if (ownerTypeId != null && !ownerTypeId.equals(contextNodeTypeId)) {
                rule = dsl.select()
                    .from("attribute_state_rule")
                    .where("node_type_id = ?", ownerTypeId)
                    .and("attribute_definition_id = ?", attrDefId)
                    .and("lifecycle_state_id = ?", stateId)
                    .fetchOne();
                if (rule != null) return rule;
            }
        }

        // 3. Fall back to domain-level default (node_type_id IS NULL) for domain attributes
        return dsl.select()
            .from("attribute_state_rule")
            .where("node_type_id IS NULL")
            .and("attribute_definition_id = ?", attrDefId)
            .and("lifecycle_state_id = ?", stateId)
            .fetchOne();
    }

    // ── Cache build ───────────────────────────────────────────────────

    private Map<String, ResolvedNodeType> buildCache() {
        // Load all node_types and all attribute_definitions in two bulk queries
        List<Record> allTypes = dsl.select().from("node_type").fetch();
        Map<String, Record> typeById = new HashMap<>();
        for (Record t : allTypes) {
            typeById.put(t.get("id", String.class), t);
        }

        // Group attrs by node_type_id, preserving display_order sort (exclude domain attrs)
        Map<String, List<Record>> attrsByType = new LinkedHashMap<>();
        dsl.select().from("attribute_definition")
           .where("node_type_id IS NOT NULL")
           .orderBy(org.jooq.impl.DSL.field("display_order"))
           .fetch()
           .forEach(a -> attrsByType
               .computeIfAbsent(a.get("node_type_id", String.class), k -> new ArrayList<>())
               .add(a));

        Map<String, ResolvedNodeType> result = new LinkedHashMap<>();

        for (Record type : allTypes) {
            String typeId = type.get("id", String.class);
            List<String> chain = buildAncestorChain(typeId, typeById);

            // Merge attributes bottom-up (child first → parent → grandparent …)
            // Child's own attr wins on name collision (seenNames ensures that).
            LinkedHashSet<String> seenNames = new LinkedHashSet<>();
            List<ResolvedAttribute> mergedAttrs = new ArrayList<>();

            for (String ancestorId : chain) {
                Record ancestorType = typeById.get(ancestorId);
                if (ancestorType == null) continue;
                String ancestorName = ancestorType.get("name", String.class);
                boolean isOwn = ancestorId.equals(typeId);

                for (Record a : attrsByType.getOrDefault(ancestorId, List.of())) {
                    String attrName = a.get("name", String.class);
                    if (!seenNames.add(attrName)) {
                        if (!isOwn) {
                            // Parent attr shadowed by child's own attr with same name
                            log.debug("MetaModelCache: attr '{}' from '{}' shadowed by child type '{}' — skipping",
                                attrName, ancestorName, typeId);
                        }
                        continue;
                    }
                    Integer rawOrder = a.get("display_order", Integer.class);
                    mergedAttrs.add(new ResolvedAttribute(
                        a.get("id", String.class),
                        attrName,
                        a.get("label", String.class),
                        a.get("data_type", String.class),
                        a.get("widget_type", String.class),
                        Integer.valueOf(1).equals(a.get("required", Integer.class)),
                        a.get("default_value", String.class),
                        a.get("naming_regex", String.class),
                        a.get("allowed_values", String.class),
                        a.get("enum_definition_id", String.class),
                        rawOrder != null ? rawOrder : 0,
                        a.get("display_section", String.class),
                        a.get("tooltip", String.class),
                        Integer.valueOf(1).equals(a.get("as_name", Integer.class)),
                        !isOwn,
                        isOwn ? null : ancestorName,
                        ancestorId,
                        null, null
                    ));
                }
            }

            // Sort by display_order; own attrs (inherited=false) sort before inherited
            // at the same display_order so they appear first visually.
            mergedAttrs.sort(Comparator
                .comparingInt(ResolvedAttribute::displayOrder)
                .thenComparing(a -> a.inherited() ? 1 : 0));

            Boolean rawCollapse = type.get("collapse_history", Boolean.class);

            result.put(typeId, new ResolvedNodeType(
                typeId,
                type.get("name",                String.class),
                type.get("description",          String.class),
                type.get("lifecycle_id",          String.class),
                type.get("logical_id_label",      String.class),
                type.get("logical_id_pattern",    String.class),
                type.get("numbering_scheme",      String.class),
                type.get("version_policy",        String.class),
                Boolean.TRUE.equals(rawCollapse),
                type.get("color",                 String.class),
                type.get("icon",                  String.class),
                type.get("parent_node_type_id",   String.class),
                List.copyOf(chain),
                List.copyOf(mergedAttrs)
            ));
        }

        log.debug("MetaModelCache built: {} node types", result.size());
        return Collections.unmodifiableMap(result);
    }

    /**
     * Builds the ancestor chain starting with {@code typeId}, walking up via
     * parent_node_type_id. Throws if a cycle is detected.
     */
    private List<String> buildAncestorChain(String typeId, Map<String, Record> typeById) {
        List<String> chain = new ArrayList<>();
        LinkedHashSet<String> visited = new LinkedHashSet<>();
        String current = typeId;
        while (current != null) {
            if (!visited.add(current)) {
                throw new IllegalStateException(
                    "Circular inheritance detected involving node type: " + current);
            }
            chain.add(current);
            Record type = typeById.get(current);
            if (type == null) break;
            current = type.get("parent_node_type_id", String.class);
        }
        return chain;
    }

    // ── Domain cache ──────────────────────────────────────────────────

    private void buildDomainCaches() {
        // Load all domains
        Map<String, Record> domains = new LinkedHashMap<>();
        dsl.select().from("domain").fetch()
            .forEach(d -> domains.put(d.get("id", String.class), d));

        // Load domain attribute definitions grouped by domain_id
        Map<String, List<ResolvedAttribute>> attrsByDomain = new LinkedHashMap<>();
        dsl.select().from("attribute_definition")
           .where("domain_id IS NOT NULL")
           .orderBy(org.jooq.impl.DSL.field("display_order"))
           .fetch()
           .forEach(a -> {
               String domainId = a.get("domain_id", String.class);
               Record domain = domains.get(domainId);
               String domainName = domain != null ? domain.get("name", String.class) : null;
               Integer rawOrder = a.get("display_order", Integer.class);
               attrsByDomain
                   .computeIfAbsent(domainId, k -> new ArrayList<>())
                   .add(new ResolvedAttribute(
                       a.get("id", String.class),
                       a.get("name", String.class),
                       a.get("label", String.class),
                       a.get("data_type", String.class),
                       a.get("widget_type", String.class),
                       Integer.valueOf(1).equals(a.get("required", Integer.class)),
                       a.get("default_value", String.class),
                       a.get("naming_regex", String.class),
                       a.get("allowed_values", String.class),
                       a.get("enum_definition_id", String.class),
                       rawOrder != null ? rawOrder : 0,
                       a.get("display_section", String.class),
                       a.get("tooltip", String.class),
                       false, // as_name never on domain attrs
                       false, null, null,
                       domainId, domainName
                   ));
           });

        domainCache.set(Collections.unmodifiableMap(domains));
        domainAttrCache.set(Collections.unmodifiableMap(attrsByDomain));
        log.debug("Domain cache built: {} domains, {} with attributes", domains.size(), attrsByDomain.size());
    }
}
