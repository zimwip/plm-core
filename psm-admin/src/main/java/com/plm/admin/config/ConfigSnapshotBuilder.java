package com.plm.admin.config;

import com.plm.platform.config.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Builds a full {@link ConfigSnapshot} from the admin database.
 * Actions, algorithms, permissions, and transition guards are fetched from
 * platform-api (authoritative source). Metamodel data (node types, lifecycles,
 * link types, domains, enums, views, state actions, sources) is read locally.
 */
@Slf4j
@Component
public class ConfigSnapshotBuilder {

    private final DSLContext dsl;
    private final RestTemplate rest;
    private final String platformUrl;
    private final String serviceSecret;
    private final AtomicLong versionCounter = new AtomicLong(0);

    private static final String PLATFORM_ACTIONS_PATH = "/api/platform/internal/config/actions?serviceCode=psm";

    public ConfigSnapshotBuilder(DSLContext dsl, RestTemplateBuilder restBuilder,
                                 @Value("${plm.settings.settings-url:http://platform-api:8084}") String platformUrl,
                                 @Value("${plm.auth.service-secret:}") String serviceSecret) {
        this.dsl           = dsl;
        this.rest          = restBuilder.build();
        this.platformUrl   = platformUrl;
        this.serviceSecret = serviceSecret;
    }

    public ConfigSnapshot buildFullSnapshot() {
        long version = versionCounter.incrementAndGet();

        PlatformActionSnapshot platform = safeFetchPlatformSnapshot();

        var actions      = platform.actions()    != null ? platform.actions()    : List.<ActionConfig>of();
        var algorithms   = platform.algorithms() != null ? platform.algorithms() : List.<AlgorithmConfig>of();
        var permissions  = platform.permissions() != null ? platform.permissions() : List.<PermissionConfig>of();

        var nodeTypes     = buildNodeTypes();
        var lifecycles    = buildLifecycles();
        var linkTypes     = buildLinkTypes();
        var authPolicies  = List.<AuthorizationPolicyConfig>of();
        var domains       = buildDomains();
        var enums         = buildEnumDefinitions();
        var views         = buildAttributeViews();
        var stateActions  = buildStateActions();
        var sources       = buildSources(algorithms);
        var entityMetadata = buildEntityMetadata();

        log.info("Config snapshot v{} built ({} nodeTypes, {} lifecycles, {} actions, {} algorithms, {} sources)",
            version, nodeTypes.size(), lifecycles.size(), actions.size(), algorithms.size(), sources.size());

        return new ConfigSnapshot(version, nodeTypes, lifecycles, linkTypes, actions,
            permissions, authPolicies, algorithms, domains, enums, views,
            stateActions, sources, entityMetadata);
    }

    // ── Node types ───────────────────────────────────────────────

    private List<NodeTypeConfig> buildNodeTypes() {
        List<Record> types = dsl.select().from("node_type").fetch();
        Map<String, Record> typeById = new LinkedHashMap<>();
        for (Record t : types) typeById.put(str(t, "id"), t);

        Map<String, List<Record>> attrsByType = new LinkedHashMap<>();
        dsl.select().from("attribute_definition")
           .where("node_type_id IS NOT NULL")
           .orderBy(DSL.field("display_order"))
           .fetch()
           .forEach(a -> attrsByType
               .computeIfAbsent(str(a, "node_type_id"), k -> new ArrayList<>())
               .add(a));

        List<Record> allRules = dsl.select().from("attribute_state_rule").fetch();

        List<NodeTypeConfig> result = new ArrayList<>();
        for (Record type : types) {
            String typeId = str(type, "id");
            List<String> chain = buildAncestorChain(typeId, typeById);

            LinkedHashSet<String> seenNames = new LinkedHashSet<>();
            List<AttributeConfig> mergedAttrs = new ArrayList<>();
            for (String ancestorId : chain) {
                Record ancestor = typeById.get(ancestorId);
                if (ancestor == null) continue;
                String ancestorName = str(ancestor, "name");
                boolean isOwn = ancestorId.equals(typeId);
                for (Record a : attrsByType.getOrDefault(ancestorId, List.of())) {
                    String attrName = str(a, "name");
                    if (!seenNames.add(attrName)) continue;
                    mergedAttrs.add(new AttributeConfig(
                        str(a, "id"), attrName, str(a, "label"),
                        str(a, "data_type"), str(a, "widget_type"),
                        bool(a, "required"), str(a, "default_value"),
                        str(a, "naming_regex"), str(a, "allowed_values"),
                        str(a, "enum_definition_id"),
                        intVal(a, "display_order"),
                        str(a, "display_section"), str(a, "tooltip"),
                        bool(a, "as_name"), !isOwn,
                        isOwn ? null : ancestorName,
                        ancestorId, null, null
                    ));
                }
            }

            List<AttributeStateRuleConfig> typeRules = new ArrayList<>();
            for (Record r : allRules) {
                String ruleNtId = str(r, "node_type_id");
                if (typeId.equals(ruleNtId) || ruleNtId == null) {
                    typeRules.add(new AttributeStateRuleConfig(
                        str(r, "id"), str(r, "attribute_definition_id"),
                        str(r, "lifecycle_state_id"), ruleNtId,
                        bool(r, "required"), bool(r, "editable"), bool(r, "visible")
                    ));
                }
            }

            result.add(new NodeTypeConfig(
                typeId, str(type, "name"), str(type, "description"),
                str(type, "lifecycle_id"), str(type, "logical_id_label"),
                str(type, "logical_id_pattern"), str(type, "numbering_scheme"),
                str(type, "version_policy"),
                Boolean.TRUE.equals(type.get("collapse_history", Boolean.class)),
                str(type, "color"), str(type, "icon"),
                str(type, "parent_node_type_id"),
                List.copyOf(chain), List.copyOf(mergedAttrs), List.copyOf(typeRules)
            ));
        }
        return result;
    }

    private List<String> buildAncestorChain(String typeId, Map<String, Record> typeById) {
        List<String> chain = new ArrayList<>();
        Set<String> visited = new LinkedHashSet<>();
        String current = typeId;
        while (current != null) {
            if (!visited.add(current)) break;
            chain.add(current);
            Record type = typeById.get(current);
            if (type == null) break;
            current = str(type, "parent_node_type_id");
        }
        return chain;
    }

    // ── Lifecycles ───────────────────────────────────────────────

    private List<LifecycleConfig> buildLifecycles() {
        List<Record> lifecycles  = dsl.select().from("lifecycle").fetch();
        List<Record> states      = dsl.select().from("lifecycle_state").fetch();
        List<Record> transitions = dsl.select().from("lifecycle_transition").fetch();
        List<Record> sigReqs     = dsl.select().from("signature_requirement").fetch();
        List<Record> ltgRows     = dsl.select().from("lifecycle_transition_guard").fetch();

        Map<String, List<Record>> statesByLc     = groupBy(states,      "lifecycle_id");
        Map<String, List<Record>> transByLc      = groupBy(transitions, "lifecycle_id");
        Map<String, List<Record>> sigReqsByTrans = groupBy(sigReqs,     "lifecycle_transition_id");

        Map<String, List<TransitionGuardConfig>> guardsByTrans = new LinkedHashMap<>();
        for (Record r : ltgRows) {
            TransitionGuardConfig g = new TransitionGuardConfig(
                str(r, "id"), str(r, "lifecycle_transition_id"),
                str(r, "algorithm_instance_id"), str(r, "effect"),
                intVal(r, "display_order")
            );
            guardsByTrans.computeIfAbsent(g.lifecycleTransitionId(), k -> new ArrayList<>()).add(g);
        }

        List<LifecycleConfig> result = new ArrayList<>();
        for (Record lc : lifecycles) {
            String lcId = str(lc, "id");

            List<LifecycleStateConfig> stateConfigs = new ArrayList<>();
            for (Record s : statesByLc.getOrDefault(lcId, List.of())) {
                stateConfigs.add(new LifecycleStateConfig(
                    str(s, "id"), lcId, str(s, "name"),
                    bool(s, "is_initial"), intVal(s, "display_order"), str(s, "color")
                ));
            }

            List<LifecycleTransitionConfig> transConfigs = new ArrayList<>();
            for (Record t : transByLc.getOrDefault(lcId, List.of())) {
                String transId = str(t, "id");

                List<SignatureRequirementConfig> sigs = new ArrayList<>();
                for (Record sr : sigReqsByTrans.getOrDefault(transId, List.of())) {
                    sigs.add(new SignatureRequirementConfig(
                        str(sr, "id"), transId, str(sr, "role_required"),
                        intVal(sr, "display_order")
                    ));
                }

                List<TransitionGuardConfig> guards = new ArrayList<>(
                    guardsByTrans.getOrDefault(transId, List.of()));

                transConfigs.add(new LifecycleTransitionConfig(
                    transId, lcId, str(t, "name"),
                    str(t, "from_state_id"), str(t, "to_state_id"),
                    str(t, "guard_expr"), str(t, "action_type"),
                    str(t, "version_strategy"), sigs, guards
                ));
            }

            result.add(new LifecycleConfig(
                lcId, str(lc, "name"), str(lc, "description"),
                stateConfigs, transConfigs
            ));
        }
        return result;
    }

    // ── Link types ───────────────────────────────────────────────

    private List<LinkTypeConfig> buildLinkTypes() {
        List<Record> linkTypes = dsl.select().from("link_type").fetch();
        List<Record> attrs     = dsl.select().from("link_type_attribute").fetch();
        List<Record> cascades  = dsl.select().from("link_type_cascade").fetch();

        Map<String, List<Record>> attrsByLt = groupBy(attrs,    "link_type_id");
        Map<String, List<Record>> cascsByLt = groupBy(cascades, "link_type_id");

        List<LinkTypeConfig> result = new ArrayList<>();
        for (Record lt : linkTypes) {
            String ltId = str(lt, "id");

            List<LinkTypeAttributeConfig> ltAttrs = new ArrayList<>();
            for (Record a : attrsByLt.getOrDefault(ltId, List.of())) {
                ltAttrs.add(new LinkTypeAttributeConfig(
                    str(a, "id"), ltId, str(a, "name"), str(a, "label"),
                    str(a, "data_type"), bool(a, "required"), str(a, "default_value"),
                    str(a, "naming_regex"), str(a, "allowed_values"), str(a, "widget_type"),
                    intVal(a, "display_order"), str(a, "display_section"),
                    str(a, "tooltip"), str(a, "enum_definition_id")
                ));
            }

            List<LinkTypeCascadeConfig> ltCascades = new ArrayList<>();
            for (Record c : cascsByLt.getOrDefault(ltId, List.of())) {
                ltCascades.add(new LinkTypeCascadeConfig(
                    str(c, "id"), ltId, str(c, "parent_transition_id"),
                    str(c, "child_from_state_id"), str(c, "child_transition_id")
                ));
            }

            result.add(new LinkTypeConfig(
                ltId, str(lt, "name"), str(lt, "description"),
                str(lt, "source_node_type_id"),
                str(lt, "target_source_id"), str(lt, "target_type"),
                str(lt, "link_policy"), intVal(lt, "min_cardinality"),
                lt.get("max_cardinality", Integer.class),
                str(lt, "link_logical_id_label"), str(lt, "link_logical_id_pattern"),
                str(lt, "color"), str(lt, "icon"), ltAttrs, ltCascades
            ));
        }
        return result;
    }

    // ── Domains ──────────────────────────────────────────────────

    private List<DomainConfig> buildDomains() {
        List<Record> domains = dsl.select().from("domain").fetch();
        List<Record> attrs = dsl.select().from("attribute_definition")
            .where("domain_id IS NOT NULL")
            .orderBy(DSL.field("display_order"))
            .fetch();
        Map<String, List<Record>> attrsByDomain = groupBy(attrs, "domain_id");

        List<DomainConfig> result = new ArrayList<>();
        for (Record d : domains) {
            String domId = str(d, "id");
            String domName = str(d, "name");

            List<AttributeConfig> domAttrs = new ArrayList<>();
            for (Record a : attrsByDomain.getOrDefault(domId, List.of())) {
                domAttrs.add(new AttributeConfig(
                    str(a, "id"), str(a, "name"), str(a, "label"),
                    str(a, "data_type"), str(a, "widget_type"),
                    bool(a, "required"), str(a, "default_value"),
                    str(a, "naming_regex"), str(a, "allowed_values"),
                    str(a, "enum_definition_id"), intVal(a, "display_order"),
                    str(a, "display_section"), str(a, "tooltip"),
                    false, false, null, null, domId, domName
                ));
            }

            result.add(new DomainConfig(domId, domName, str(d, "description"),
                str(d, "color"), str(d, "icon"), domAttrs));
        }
        return result;
    }

    // ── Enum definitions ─────────────────────────────────────────

    private List<EnumDefinitionConfig> buildEnumDefinitions() {
        List<Record> enums = dsl.select().from("enum_definition").fetch();
        List<Record> values = dsl.select().from("enum_value")
            .orderBy(DSL.field("display_order"))
            .fetch();
        Map<String, List<Record>> valuesByEnum = groupBy(values, "enum_definition_id");

        List<EnumDefinitionConfig> result = new ArrayList<>();
        for (Record e : enums) {
            String enumId = str(e, "id");
            List<EnumValueConfig> enumValues = new ArrayList<>();
            for (Record v : valuesByEnum.getOrDefault(enumId, List.of())) {
                enumValues.add(new EnumValueConfig(
                    str(v, "id"), enumId, str(v, "value"),
                    str(v, "label"), intVal(v, "display_order")
                ));
            }
            result.add(new EnumDefinitionConfig(
                enumId, str(e, "name"), str(e, "description"), enumValues
            ));
        }
        return result;
    }

    // ── Attribute views ──────────────────────────────────────────

    private List<AttributeViewConfig> buildAttributeViews() {
        List<Record> views     = dsl.select().from("attribute_view").fetch();
        List<Record> overrides = dsl.select().from("view_attribute_override").fetch();
        Map<String, List<Record>> overridesByView = groupBy(overrides, "view_id");

        List<AttributeViewConfig> result = new ArrayList<>();
        for (Record v : views) {
            String viewId = str(v, "id");
            List<ViewAttributeOverrideConfig> viewOverrides = new ArrayList<>();
            for (Record o : overridesByView.getOrDefault(viewId, List.of())) {
                viewOverrides.add(new ViewAttributeOverrideConfig(
                    str(o, "id"), viewId, str(o, "attribute_def_id"),
                    o.get("visible", Integer.class) != null
                        ? Integer.valueOf(1).equals(o.get("visible", Integer.class)) : null,
                    o.get("editable", Integer.class) != null
                        ? Integer.valueOf(1).equals(o.get("editable", Integer.class)) : null,
                    o.get("display_order", Integer.class),
                    str(o, "display_section")
                ));
            }
            result.add(new AttributeViewConfig(
                viewId, str(v, "node_type_id"), str(v, "name"), str(v, "description"),
                str(v, "eligible_role_id"), str(v, "eligible_state_id"),
                intVal(v, "priority"), viewOverrides
            ));
        }
        return result;
    }

    // ── State actions ────────────────────────────────────────────

    private List<StateActionConfig> buildStateActions() {
        List<StateActionConfig> result = new ArrayList<>();
        for (Record r : dsl.select().from("lifecycle_state_action").fetch()) {
            result.add(new StateActionConfig(
                str(r, "id"), str(r, "lifecycle_state_id"),
                str(r, "algorithm_instance_id"), str(r, "trigger"),
                str(r, "execution_mode"), intVal(r, "display_order")
            ));
        }
        return result;
    }

    // ── Sources ──────────────────────────────────────────────────

    private List<SourceConfig> buildSources(List<AlgorithmConfig> algorithms) {
        Map<String, String> instanceToAlgoCode = new LinkedHashMap<>();
        for (AlgorithmConfig alg : algorithms) {
            if (alg.instances() != null) {
                for (AlgorithmInstanceConfig inst : alg.instances()) {
                    instanceToAlgoCode.put(inst.id(), alg.code());
                }
            }
        }

        List<SourceConfig> result = new ArrayList<>();
        for (Record s : dsl.select().from("source").fetch()) {
            String instanceId = str(s, "resolver_instance_id");
            result.add(new SourceConfig(
                str(s, "id"), str(s, "name"), str(s, "description"),
                instanceId, instanceToAlgoCode.get(instanceId),
                bool(s, "is_builtin"),
                bool(s, "is_versioned"),
                str(s, "color"), str(s, "icon")
            ));
        }
        return result;
    }

    // ── Entity metadata ──────────────────────────────────────────

    private Map<String, String> buildEntityMetadata() {
        Map<String, String> meta = new LinkedHashMap<>();
        dsl.select().from("entity_metadata").fetch()
            .forEach(r -> {
                String key = str(r, "target_type") + ":" + str(r, "target_id") + ":" + str(r, "meta_key");
                meta.put(key, str(r, "meta_value"));
            });
        return meta;
    }

    // ── Platform fetch ───────────────────────────────────────────

    private record PlatformActionSnapshot(
        List<ActionConfig> actions,
        List<AlgorithmConfig> algorithms,
        List<PermissionConfig> permissions
    ) {}

    private PlatformActionSnapshot safeFetchPlatformSnapshot() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Service-Secret", serviceSecret);
            var resp = rest.exchange(
                platformUrl + PLATFORM_ACTIONS_PATH,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                new ParameterizedTypeReference<PlatformActionSnapshot>() {});
            if (resp.getBody() != null) return resp.getBody();
        } catch (Exception e) {
            log.warn("Failed to fetch config from platform-api: {} — returning empty snapshot", e.getMessage());
        }
        return new PlatformActionSnapshot(List.of(), List.of(), List.of());
    }

    // ── Helpers ──────────────────────────────────────────────────

    private static String str(Record r, String field) {
        return r.get(field, String.class);
    }

    private static int intVal(Record r, String field) {
        Integer v = r.get(field, Integer.class);
        return v != null ? v : 0;
    }

    private static boolean bool(Record r, String field) {
        Integer v = r.get(field, Integer.class);
        return Integer.valueOf(1).equals(v);
    }

    private static Map<String, List<Record>> groupBy(List<Record> records, String field) {
        Map<String, List<Record>> map = new LinkedHashMap<>();
        for (Record r : records) {
            String key = str(r, field);
            if (key != null) {
                map.computeIfAbsent(key, k -> new ArrayList<>()).add(r);
            }
        }
        return map;
    }
}
