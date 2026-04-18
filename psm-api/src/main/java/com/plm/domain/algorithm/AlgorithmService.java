package com.plm.domain.algorithm;

import com.plm.domain.action.PlmAction;
import com.plm.domain.guard.GuardService;
import com.plm.domain.security.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * CRUD for algorithm types, algorithms, instances, parameter values,
 * and guard attachments (action_guard, node_type_action_guard).
 *
 * All mutating operations require MANAGE_METAMODEL permission and
 * invalidate the GuardService cache.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmService {

    private final DSLContext          dsl;
    private final GuardService        guardService;
    private final SecurityContextPort secCtx;

    // ================================================================
    // ALGORITHM TYPES (read-only — system-level)
    // ================================================================

    public List<Map<String, Object>> listAlgorithmTypes() {
        return dsl.select().from("algorithm_type").orderBy(DSL.field("name")).fetch()
            .map(r -> mapOf(r, "id", "name", "description", "java_interface"));
    }

    // ================================================================
    // ALGORITHMS (read-only — registered via migration)
    // ================================================================

    public List<Map<String, Object>> listAlgorithms() {
        return dsl.fetch("""
            SELECT a.id, a.code, a.name, a.description, a.handler_ref,
                   at.id AS type_id, at.name AS type_name
            FROM algorithm a
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            ORDER BY at.name, a.name
            """).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",          r.get("id",          String.class));
                m.put("code",        r.get("code",        String.class));
                m.put("name",        r.get("name",        String.class));
                m.put("description", r.get("description", String.class));
                m.put("handlerRef",  r.get("handler_ref", String.class));
                m.put("typeId",      r.get("type_id",     String.class));
                m.put("typeName",    r.get("type_name",   String.class));
                return m;
            });
    }

    public List<Map<String, Object>> listAlgorithmsByType(String typeId) {
        return dsl.select().from("algorithm")
            .where("algorithm_type_id = ?", typeId)
            .orderBy(DSL.field("name")).fetch()
            .map(r -> mapOf(r, "id", "code", "name", "description", "handler_ref"));
    }

    // ================================================================
    // ALGORITHM PARAMETERS (read-only)
    // ================================================================

    public List<Map<String, Object>> listParameters(String algorithmId) {
        return dsl.select().from("algorithm_parameter")
            .where("algorithm_id = ?", algorithmId)
            .orderBy(DSL.field("display_order")).fetch()
            .map(r -> mapOf(r, "id", "param_name", "param_label", "data_type",
                "required", "default_value", "display_order"));
    }

    // ================================================================
    // ALGORITHM INSTANCES
    // ================================================================

    public List<Map<String, Object>> listInstances(String algorithmId) {
        return dsl.fetch("""
            SELECT ai.id, ai.name, ai.algorithm_id, a.code AS algorithm_code, a.name AS algorithm_name
            FROM algorithm_instance ai
            JOIN algorithm a ON a.id = ai.algorithm_id
            WHERE ai.algorithm_id = ?
            ORDER BY ai.name
            """, algorithmId).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",            r.get("id",             String.class));
                m.put("name",          r.get("name",           String.class));
                m.put("algorithmId",   r.get("algorithm_id",   String.class));
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("algorithmName", r.get("algorithm_name", String.class));
                return m;
            });
    }

    public List<Map<String, Object>> listAllInstances() {
        return dsl.fetch("""
            SELECT ai.id, ai.name, ai.algorithm_id, a.code AS algorithm_code,
                   a.name AS algorithm_name, at.name AS type_name
            FROM algorithm_instance ai
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            ORDER BY at.name, a.name, ai.name
            """).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",            r.get("id",             String.class));
                m.put("name",          r.get("name",           String.class));
                m.put("algorithmId",   r.get("algorithm_id",   String.class));
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("algorithmName", r.get("algorithm_name", String.class));
                m.put("typeName",      r.get("type_name",      String.class));
                return m;
            });
    }

    @PlmAction("MANAGE_METAMODEL")
    public String createInstance(String algorithmId, String name) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES (?,?,?)",
            id, algorithmId, name);
        guardService.evictCache();
        log.info("Algorithm instance created: id={} algorithm={}", id, algorithmId);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    public void updateInstance(String instanceId, String name) {
        dsl.execute("UPDATE algorithm_instance SET name = ? WHERE id = ?", name, instanceId);
        guardService.evictCache();
    }

    @PlmAction("MANAGE_METAMODEL")
    public void deleteInstance(String instanceId) {
        dsl.execute("DELETE FROM node_action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM algorithm_instance WHERE id = ?", instanceId);
        guardService.evictCache();
        log.info("Algorithm instance deleted: id={}", instanceId);
    }

    // ================================================================
    // INSTANCE PARAMETER VALUES
    // ================================================================

    public List<Map<String, Object>> getInstanceParamValues(String instanceId) {
        return dsl.fetch("""
            SELECT aipv.id, ap.param_name, ap.param_label, ap.data_type, aipv.value
            FROM algorithm_instance_param_value aipv
            JOIN algorithm_parameter ap ON ap.id = aipv.algorithm_parameter_id
            WHERE aipv.algorithm_instance_id = ?
            ORDER BY ap.display_order
            """, instanceId).map(r -> mapOf(r, "id", "param_name", "param_label", "data_type", "value"));
    }

    @PlmAction("MANAGE_METAMODEL")
    public void setInstanceParamValue(String instanceId, String parameterId, String value) {
        dsl.execute(
            "DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ? AND algorithm_parameter_id = ?",
            instanceId, parameterId);
        dsl.execute(
            "INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES (?,?,?,?)",
            UUID.randomUUID().toString(), instanceId, parameterId, value);
        guardService.evictCache();
    }

    // ================================================================
    // ACTION GUARDS — global level
    // ================================================================

    public List<Map<String, Object>> listActionGuards(String actionId) {
        return dsl.fetch("""
            SELECT ag.id, ag.effect, ag.display_order,
                   ai.id AS instance_id, ai.name AS instance_name,
                   a.code AS algorithm_code, a.name AS algorithm_name,
                   at.name AS type_name
            FROM action_guard ag
            JOIN algorithm_instance ai ON ai.id = ag.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            WHERE ag.action_id = ?
            ORDER BY ag.display_order
            """, actionId).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",            r.get("id",             String.class));
                m.put("effect",        r.get("effect",         String.class));
                m.put("displayOrder",  r.get("display_order",  Integer.class));
                m.put("instanceId",    r.get("instance_id",    String.class));
                m.put("instanceName",  r.get("instance_name",  String.class));
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("algorithmName", r.get("algorithm_name", String.class));
                m.put("typeName",      r.get("type_name",      String.class));
                return m;
            });
    }

    @PlmAction("MANAGE_METAMODEL")
    public String attachActionGuard(String actionId, String instanceId, String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, actionId, instanceId, effect, displayOrder);
        guardService.evictCache();
        log.info("Action guard attached: action={} instance={} effect={}", actionId, instanceId, effect);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    public void detachActionGuard(String guardId) {
        dsl.execute("DELETE FROM action_guard WHERE id = ?", guardId);
        guardService.evictCache();
        log.info("Action guard detached: id={}", guardId);
    }

    // ================================================================
    // LIFECYCLE-TRANSITION GUARDS — shared across node_types of the lifecycle
    // ================================================================

    public List<Map<String, Object>> listTransitionGuards(String transitionId) {
        return dsl.fetch("""
            SELECT ltg.id, ltg.effect, ltg.display_order,
                   ai.id AS instance_id, ai.name AS instance_name,
                   a.code AS algorithm_code, a.name AS algorithm_name,
                   at.name AS type_name
            FROM lifecycle_transition_guard ltg
            JOIN algorithm_instance ai ON ai.id = ltg.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            WHERE ltg.lifecycle_transition_id = ?
            ORDER BY ltg.display_order
            """, transitionId).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",            r.get("id",             String.class));
                m.put("effect",        r.get("effect",         String.class));
                m.put("displayOrder",  r.get("display_order",  Integer.class));
                m.put("instanceId",    r.get("instance_id",    String.class));
                m.put("instanceName",  r.get("instance_name",  String.class));
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("algorithmName", r.get("algorithm_name", String.class));
                m.put("typeName",      r.get("type_name",      String.class));
                m.put("level",         "LIFECYCLE_TRANSITION");
                return m;
            });
    }

    @PlmAction("MANAGE_METAMODEL")
    public String attachTransitionGuard(String transitionId, String instanceId,
                                        String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, transitionId, instanceId, effect, displayOrder);
        guardService.evictCache();
        log.info("Transition guard attached: transition={} instance={} effect={}",
            transitionId, instanceId, effect);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    public void detachTransitionGuard(String guardId) {
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE id = ?", guardId);
        guardService.evictCache();
        log.info("Transition guard detached: id={}", guardId);
    }

    // ================================================================
    // NODE-ACTION GUARDS — per (node_type, action, transition?) (inherit + override)
    // ================================================================

    /**
     * Lists per-node-type guards attached to a specific (action, transition?) tuple.
     * Pass a null transitionId for NODE-scope action guards.
     */
    public List<Map<String, Object>> listNodeActionGuards(String nodeTypeId, String actionCode,
                                                          String transitionId) {
        String actionId = resolveActionId(actionCode);
        List<Object> args = new java.util.ArrayList<>();
        args.add(nodeTypeId);
        args.add(actionId);

        String where = "nag.node_type_id = ? AND nag.action_id = ?";
        if (transitionId != null) {
            where += " AND nag.transition_id = ?";
            args.add(transitionId);
        } else {
            where += " AND nag.transition_id IS NULL";
        }

        return dsl.fetch("""
            SELECT nag.id, nag.effect, nag.override_action, nag.display_order,
                   ai.id AS instance_id, ai.name AS instance_name,
                   a.code AS algorithm_code, a.name AS algorithm_name,
                   at.name AS type_name
            FROM node_action_guard nag
            JOIN algorithm_instance ai ON ai.id = nag.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            WHERE """ + where + " ORDER BY nag.display_order",
            args.toArray()).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",             r.get("id",              String.class));
                m.put("effect",         r.get("effect",          String.class));
                m.put("overrideAction", r.get("override_action", String.class));
                m.put("displayOrder",   r.get("display_order",   Integer.class));
                m.put("instanceId",     r.get("instance_id",     String.class));
                m.put("instanceName",   r.get("instance_name",   String.class));
                m.put("algorithmCode",  r.get("algorithm_code",  String.class));
                m.put("algorithmName",  r.get("algorithm_name",  String.class));
                m.put("typeName",       r.get("type_name",       String.class));
                m.put("level",          "NODE_ACTION");
                return m;
            });
    }

    @PlmAction("MANAGE_METAMODEL")
    public String attachNodeActionGuard(String nodeTypeId, String actionCode, String transitionId,
                                        String instanceId, String effect,
                                        String overrideAction, int displayOrder) {
        String actionId = resolveActionId(actionCode);
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_action_guard (id, node_type_id, action_id, transition_id, algorithm_instance_id, effect, override_action, display_order) VALUES (?,?,?,?,?,?,?,?)",
            id, nodeTypeId, actionId, transitionId, instanceId, effect, overrideAction, displayOrder);
        guardService.evictCache();
        log.info("Node-action guard attached: nodeType={} action={} transition={} instance={} effect={} override={}",
            nodeTypeId, actionCode, transitionId, instanceId, effect, overrideAction);
        return id;
    }

    @PlmAction("MANAGE_METAMODEL")
    public void detachNodeActionGuard(String guardId) {
        dsl.execute("DELETE FROM node_action_guard WHERE id = ?", guardId);
        guardService.evictCache();
        log.info("Node-action guard detached: id={}", guardId);
    }

    private String resolveActionId(String actionCode) {
        String id = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);
        if (id == null) throw new IllegalArgumentException("Unknown action: " + actionCode);
        return id;
    }

    // ================================================================
    // Helpers
    // ================================================================

    private Map<String, Object> mapOf(Record r, String... fields) {
        var m = new LinkedHashMap<String, Object>();
        for (String f : fields) {
            m.put(toCamelCase(f), r.get(f));
        }
        return m;
    }

    private String toCamelCase(String snake) {
        if (!snake.contains("_")) return snake;
        StringBuilder sb = new StringBuilder();
        boolean upper = false;
        for (char c : snake.toCharArray()) {
            if (c == '_') { upper = true; continue; }
            sb.append(upper ? Character.toUpperCase(c) : c);
            upper = false;
        }
        return sb.toString();
    }
}
