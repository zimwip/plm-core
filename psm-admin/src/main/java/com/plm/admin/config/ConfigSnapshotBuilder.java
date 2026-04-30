package com.plm.admin.config;

import com.plm.platform.config.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Builds a full {@link ConfigSnapshot} from the admin database.
 * Used for initial push to psm-data instances and for the /internal/config/snapshot endpoint.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ConfigSnapshotBuilder {

    private final DSLContext dsl;
    private final AtomicLong versionCounter = new AtomicLong(0);

    public ConfigSnapshot buildFullSnapshot() {
        long version = versionCounter.incrementAndGet();

        var nodeTypes = buildNodeTypes();
        var lifecycles = buildLifecycles();
        var linkTypes = buildLinkTypes();
        var actions = buildActions();
        var permissions = buildPermissions();
        var authPolicies = buildAuthorizationPolicies();
        var algorithms = buildAlgorithms();
        var domains = buildDomains();
        var enums = buildEnumDefinitions();
        var views = buildAttributeViews();
        var stateActions = buildStateActions();
        var nodeActionGuards = buildNodeActionGuards();
        var sources = buildSources(algorithms);
        var entityMetadata = buildEntityMetadata();

        log.info("Config snapshot v{} built ({} nodeTypes, {} lifecycles, {} actions, {} algorithms, {} sources)",
            version, nodeTypes.size(), lifecycles.size(), actions.size(), algorithms.size(), sources.size());

        return new ConfigSnapshot(version, nodeTypes, lifecycles, linkTypes, actions,
            permissions, authPolicies, algorithms, domains, enums, views,
            stateActions, nodeActionGuards, sources, entityMetadata);
    }

    // ── Node types ───────────────────────────────────────────────

    private List<NodeTypeConfig> buildNodeTypes() {
        List<Record> types = dsl.select().from("node_type").fetch();
        Map<String, Record> typeById = new LinkedHashMap<>();
        for (Record t : types) typeById.put(str(t, "id"), t);

        // Attributes grouped by node_type_id (exclude domain attrs)
        Map<String, List<Record>> attrsByType = new LinkedHashMap<>();
        dsl.select().from("attribute_definition")
           .where("node_type_id IS NOT NULL")
           .orderBy(DSL.field("display_order"))
           .fetch()
           .forEach(a -> attrsByType
               .computeIfAbsent(str(a, "node_type_id"), k -> new ArrayList<>())
               .add(a));

        // State rules grouped by node_type_id (nullable)
        List<Record> allRules = dsl.select().from("attribute_state_rule").fetch();

        List<NodeTypeConfig> result = new ArrayList<>();
        for (Record type : types) {
            String typeId = str(type, "id");
            List<String> chain = buildAncestorChain(typeId, typeById);

            // Merge attributes with inheritance
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

            // Collect state rules relevant to this type
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
        List<Record> lifecycles = dsl.select().from("lifecycle").fetch();
        List<Record> states = dsl.select().from("lifecycle_state").fetch();
        List<Record> transitions = dsl.select().from("lifecycle_transition").fetch();
        List<Record> sigReqs = dsl.select().from("signature_requirement").fetch();
        List<Record> transGuards = dsl.select().from("lifecycle_transition_guard").fetch();

        Map<String, List<Record>> statesByLc = groupBy(states, "lifecycle_id");
        Map<String, List<Record>> transByLc = groupBy(transitions, "lifecycle_id");
        Map<String, List<Record>> sigReqsByTrans = groupBy(sigReqs, "lifecycle_transition_id");
        Map<String, List<Record>> guardsByTrans = groupBy(transGuards, "lifecycle_transition_id");

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

                List<TransitionGuardConfig> guards = new ArrayList<>();
                for (Record g : guardsByTrans.getOrDefault(transId, List.of())) {
                    guards.add(new TransitionGuardConfig(
                        str(g, "id"), transId, str(g, "algorithm_instance_id"),
                        str(g, "effect"), intVal(g, "display_order")
                    ));
                }

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
        List<Record> attrs = dsl.select().from("link_type_attribute").fetch();
        List<Record> cascades = dsl.select().from("link_type_cascade").fetch();

        Map<String, List<Record>> attrsByLt = groupBy(attrs, "link_type_id");
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

    // ── Actions ──────────────────────────────────────────────────

    private List<ActionConfig> buildActions() {
        List<Record> actions = dsl.select().from("action").fetch();
        List<Record> params = dsl.select().from("action_parameter").fetch();
        List<Record> overrides = dsl.select().from("action_param_override").fetch();
        List<Record> reqPerms = dsl.select().from("action_required_permission").fetch();
        List<Record> guards = dsl.select().from("action_guard").fetch();
        List<Record> wrappers = dsl.select().from("action_wrapper").fetch();

        Map<String, List<Record>> paramsByAction = groupBy(params, "action_id");
        Map<String, List<Record>> overridesByAction = groupBy(overrides, "action_id");
        Map<String, List<Record>> permsByAction = groupBy(reqPerms, "action_id");
        Map<String, List<Record>> guardsByAction = groupBy(guards, "action_id");
        Map<String, List<Record>> wrappersByAction = groupBy(wrappers, "action_id");

        List<ActionConfig> result = new ArrayList<>();
        for (Record a : actions) {
            String actionId = str(a, "id");

            List<ActionParameterConfig> actionParams = new ArrayList<>();
            for (Record p : paramsByAction.getOrDefault(actionId, List.of())) {
                actionParams.add(new ActionParameterConfig(
                    str(p, "id"), actionId, str(p, "param_name"), str(p, "param_label"),
                    str(p, "data_type"), bool(p, "required"), str(p, "default_value"),
                    str(p, "allowed_values"), str(p, "widget_type"), str(p, "validation_regex"),
                    str(p, "min_value"), str(p, "max_value"), str(p, "visibility"),
                    intVal(p, "display_order"), str(p, "tooltip")
                ));
            }

            List<ActionParamOverrideConfig> actionOverrides = new ArrayList<>();
            for (Record o : overridesByAction.getOrDefault(actionId, List.of())) {
                actionOverrides.add(new ActionParamOverrideConfig(
                    str(o, "id"), str(o, "node_type_id"), actionId, str(o, "parameter_id"),
                    str(o, "default_value"), str(o, "allowed_values"),
                    o.get("required", Integer.class) != null
                        ? Integer.valueOf(1).equals(o.get("required", Integer.class))
                        : null
                ));
            }

            List<String> requiredPerms = new ArrayList<>();
            for (Record rp : permsByAction.getOrDefault(actionId, List.of())) {
                requiredPerms.add(str(rp, "permission_code"));
            }

            List<ActionGuardConfig> actionGuards = new ArrayList<>();
            for (Record g : guardsByAction.getOrDefault(actionId, List.of())) {
                actionGuards.add(new ActionGuardConfig(
                    str(g, "id"), str(g, "algorithm_instance_id"),
                    str(g, "effect"), intVal(g, "display_order"),
                    "ACTION", actionId, null, null, null
                ));
            }

            List<ActionWrapperConfig> actionWrappers = new ArrayList<>();
            for (Record w : wrappersByAction.getOrDefault(actionId, List.of())) {
                actionWrappers.add(new ActionWrapperConfig(
                    str(w, "id"), actionId, str(w, "algorithm_instance_id"),
                    intVal(w, "execution_order")
                ));
            }

            result.add(new ActionConfig(
                actionId, str(a, "action_code"), str(a, "scope"),
                str(a, "display_name"), str(a, "description"),
                str(a, "display_category"), intVal(a, "display_order"),
                str(a, "managed_with"), str(a, "handler_instance_id"),
                actionParams, actionOverrides, requiredPerms, actionGuards, actionWrappers
            ));
        }
        return result;
    }

    // ── Permissions ──────────────────────────────────────────────

    private List<PermissionConfig> buildPermissions() {
        return dsl.select().from("permission").fetch().stream()
            .map(r -> new PermissionConfig(
                str(r, "permission_code"), str(r, "scope"),
                str(r, "display_name"), str(r, "description"),
                intVal(r, "display_order")
            )).toList();
    }

    private List<AuthorizationPolicyConfig> buildAuthorizationPolicies() {
        // Phase D4: authorization_policy moved to pno-api. psm-admin no longer stores grants.
        // Returning an empty list keeps the ConfigSnapshot schema stable — psm-api pulls
        // grants directly from /api/pno/internal/authorization/snapshot now.
        return List.of();
    }

    // ── Algorithms ───────────────────────────────────────────────

    private List<AlgorithmConfig> buildAlgorithms() {
        List<Record> algorithms = dsl.select().from("algorithm").fetch();
        List<Record> params = dsl.select().from("algorithm_parameter").fetch();
        List<Record> instances = dsl.select().from("algorithm_instance").fetch();
        List<Record> paramValues = dsl.select().from("algorithm_instance_param_value").fetch();

        Map<String, List<Record>> paramsByAlgo = groupBy(params, "algorithm_id");
        Map<String, List<Record>> instByAlgo = groupBy(instances, "algorithm_id");

        // Build param value lookup: instanceId → { paramId → value }
        Map<String, Map<String, String>> pvByInstance = new LinkedHashMap<>();
        // Also need paramId → paramName mapping
        Map<String, String> paramNameById = new LinkedHashMap<>();
        for (Record p : params) {
            paramNameById.put(str(p, "id"), str(p, "param_name"));
        }
        for (Record pv : paramValues) {
            String instId = str(pv, "algorithm_instance_id");
            String paramId = str(pv, "algorithm_parameter_id");
            String paramName = paramNameById.getOrDefault(paramId, paramId);
            pvByInstance.computeIfAbsent(instId, k -> new LinkedHashMap<>())
                .put(paramName, str(pv, "value"));
        }

        List<AlgorithmConfig> result = new ArrayList<>();
        for (Record alg : algorithms) {
            String algId = str(alg, "id");

            List<AlgorithmParameterConfig> algParams = new ArrayList<>();
            for (Record p : paramsByAlgo.getOrDefault(algId, List.of())) {
                algParams.add(new AlgorithmParameterConfig(
                    str(p, "id"), algId, str(p, "param_name"), str(p, "param_label"),
                    str(p, "data_type"), bool(p, "required"),
                    str(p, "default_value"), intVal(p, "display_order")
                ));
            }

            List<AlgorithmInstanceConfig> algInstances = new ArrayList<>();
            for (Record inst : instByAlgo.getOrDefault(algId, List.of())) {
                String instId = str(inst, "id");
                algInstances.add(new AlgorithmInstanceConfig(
                    instId, algId, str(inst, "name"),
                    pvByInstance.getOrDefault(instId, Map.of())
                ));
            }

            result.add(new AlgorithmConfig(
                algId, str(alg, "algorithm_type_id"), str(alg, "code"),
                str(alg, "name"), str(alg, "description"), str(alg, "handler_ref"),
                algParams, algInstances
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
        List<Record> views = dsl.select().from("attribute_view").fetch();
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

        // Tier 1: lifecycle-level state actions
        for (Record r : dsl.select().from("lifecycle_state_action").fetch()) {
            result.add(new StateActionConfig(
                str(r, "id"), str(r, "lifecycle_state_id"),
                str(r, "algorithm_instance_id"), str(r, "trigger"),
                str(r, "execution_mode"), intVal(r, "display_order"),
                null, null
            ));
        }

        // Tier 2: node-type-specific state actions
        for (Record r : dsl.select().from("node_type_state_action").fetch()) {
            result.add(new StateActionConfig(
                str(r, "id"), str(r, "lifecycle_state_id"),
                str(r, "algorithm_instance_id"), str(r, "trigger"),
                str(r, "execution_mode"), intVal(r, "display_order"),
                str(r, "node_type_id"), str(r, "override_action")
            ));
        }
        return result;
    }

    // ── Node action guards ───────────────────────────────────────

    private List<NodeActionGuardConfig> buildNodeActionGuards() {
        return dsl.select().from("node_action_guard").fetch().stream()
            .map(r -> new NodeActionGuardConfig(
                str(r, "id"), str(r, "node_type_id"), str(r, "action_id"),
                str(r, "transition_id"), str(r, "algorithm_instance_id"),
                str(r, "effect"), str(r, "override_action"),
                intVal(r, "display_order")
            )).toList();
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
