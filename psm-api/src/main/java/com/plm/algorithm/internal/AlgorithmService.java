package com.plm.algorithm.internal;

import com.plm.shared.authorization.PlmPermission;
import com.plm.algorithm.AlgorithmRegistry;
import com.plm.action.guard.ActionGuardService;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardService;
import com.plm.shared.security.SecurityContextPort;
import com.plm.node.lifecycle.internal.stateaction.StateActionService;
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
 * All mutating operations require MANAGE_PSM permission and
 * invalidate the GuardService cache.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmService {

    private final DSLContext          dsl;
    private final ActionGuardService   actionGuardService;
    private final LifecycleGuardService lifecycleGuardService;
    private final StateActionService  stateActionService;
    private final SecurityContextPort secCtx;
    private final AlgorithmRegistry   algorithmRegistry;

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
                m.put("moduleName",  algorithmRegistry.getModuleForCode(r.get("code", String.class)));
                m.put("domainName",  algorithmRegistry.getDomainForCode(r.get("code", String.class)));
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
                m.put("moduleName",    algorithmRegistry.getModuleForCode(r.get("algorithm_code", String.class)));
                m.put("domainName",    algorithmRegistry.getDomainForCode(r.get("algorithm_code", String.class)));
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String createInstance(String algorithmId, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Instance name is required");
        }
        assertInstanceNameUnique(name.trim(), null);
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO algorithm_instance (id, algorithm_id, name) VALUES (?,?,?)",
            id, algorithmId, name.trim());
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        stateActionService.evictCache();
        log.info("Algorithm instance created: id={} algorithm={}", id, algorithmId);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void updateInstance(String instanceId, String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Instance name is required");
        }
        assertInstanceNameUnique(name.trim(), instanceId);
        dsl.execute("UPDATE algorithm_instance SET name = ? WHERE id = ?", name.trim(), instanceId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        stateActionService.evictCache();
    }

    private void assertInstanceNameUnique(String name, String excludeId) {
        String sql = excludeId != null
            ? "SELECT COUNT(*) FROM algorithm_instance WHERE name = ? AND id != ?"
            : "SELECT COUNT(*) FROM algorithm_instance WHERE name = ?";
        int count = excludeId != null
            ? dsl.fetchOne(sql, name, excludeId).into(int.class)
            : dsl.fetchOne(sql, name).into(int.class);
        if (count > 0) {
            throw new IllegalArgumentException("Instance name '" + name + "' is already taken");
        }
    }

    @PlmPermission("MANAGE_PSM")
    public void deleteInstance(String instanceId) {
        dsl.execute("DELETE FROM node_type_state_action WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM lifecycle_state_action WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM node_action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM action_wrapper WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM algorithm_instance WHERE id = ?", instanceId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        stateActionService.evictCache();
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

    @PlmPermission("MANAGE_PSM")
    public void setInstanceParamValue(String instanceId, String parameterId, String value) {
        dsl.execute(
            "DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ? AND algorithm_parameter_id = ?",
            instanceId, parameterId);
        dsl.execute(
            "INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES (?,?,?,?)",
            UUID.randomUUID().toString(), instanceId, parameterId, value);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
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
                m.put("moduleName",    algorithmRegistry.getModuleForCode(r.get("algorithm_code", String.class)));
                m.put("domainName",    algorithmRegistry.getDomainForCode(r.get("algorithm_code", String.class)));
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String attachActionGuard(String actionId, String instanceId, String effect, int displayOrder) {
        assertNotManagedForHide(actionId, effect);
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, actionId, instanceId, effect, displayOrder);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        log.info("Action guard attached: action={} instance={} effect={}", actionId, instanceId, effect);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachActionGuard(String guardId) {
        dsl.execute("DELETE FROM action_guard WHERE id = ?", guardId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        log.info("Action guard detached: id={}", guardId);
    }

    // ================================================================
    // ACTION WRAPPERS (middleware pipeline)
    // ================================================================

    public List<Map<String, Object>> listActionWrappers(String actionId) {
        return dsl.fetch("""
            SELECT aw.id, aw.action_id, aw.algorithm_instance_id, aw.execution_order,
                   ai.name AS instance_name, a.code AS algorithm_code,
                   a.name  AS algorithm_name
            FROM action_wrapper aw
            JOIN algorithm_instance ai ON ai.id = aw.algorithm_instance_id
            JOIN algorithm a           ON a.id = ai.algorithm_id
            WHERE aw.action_id = ?
            ORDER BY aw.execution_order
            """, actionId)
            .map(r -> {
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("id",              r.get("id",              String.class));
                m.put("actionId",        r.get("action_id",       String.class));
                m.put("instanceId",      r.get("algorithm_instance_id", String.class));
                m.put("executionOrder",  r.get("execution_order", Integer.class));
                m.put("instanceName",    r.get("instance_name",   String.class));
                m.put("algorithmCode",   r.get("algorithm_code",  String.class));
                m.put("algorithmName",   r.get("algorithm_name",  String.class));
                m.put("moduleName",      algorithmRegistry.getModuleForCode(r.get("algorithm_code", String.class)));
                m.put("domainName",      algorithmRegistry.getDomainForCode(r.get("algorithm_code", String.class)));
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String attachActionWrapper(String actionId, String instanceId, int executionOrder) {
        String id = java.util.UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES (?,?,?,?)",
            id, actionId, instanceId, executionOrder);
        log.info("Action wrapper attached: action={} instance={} order={}", actionId, instanceId, executionOrder);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachActionWrapper(String wrapperId) {
        dsl.execute("DELETE FROM action_wrapper WHERE id = ?", wrapperId);
        log.info("Action wrapper detached: id={}", wrapperId);
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
                m.put("moduleName",    algorithmRegistry.getModuleForCode(r.get("algorithm_code", String.class)));
                m.put("domainName",    algorithmRegistry.getDomainForCode(r.get("algorithm_code", String.class)));
                m.put("level",         "LIFECYCLE_TRANSITION");
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String attachTransitionGuard(String transitionId, String instanceId,
                                        String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, transitionId, instanceId, effect, displayOrder);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        log.info("Transition guard attached: transition={} instance={} effect={}",
            transitionId, instanceId, effect);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachTransitionGuard(String guardId) {
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE id = ?", guardId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
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
            WHERE\s""" + where + " ORDER BY nag.display_order",
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

    @PlmPermission("MANAGE_PSM")
    public String attachNodeActionGuard(String nodeTypeId, String actionCode, String transitionId,
                                        String instanceId, String effect,
                                        String overrideAction, int displayOrder) {
        String actionId = resolveActionId(actionCode);
        assertNotManagedForHide(actionId, effect);
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_action_guard (id, node_type_id, action_id, transition_id, algorithm_instance_id, effect, override_action, display_order) VALUES (?,?,?,?,?,?,?,?)",
            id, nodeTypeId, actionId, transitionId, instanceId, effect, overrideAction, displayOrder);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        log.info("Node-action guard attached: nodeType={} action={} transition={} instance={} effect={} override={}",
            nodeTypeId, actionCode, transitionId, instanceId, effect, overrideAction);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachNodeActionGuard(String guardId) {
        dsl.execute("DELETE FROM node_action_guard WHERE id = ?", guardId);
        actionGuardService.evictCache();
        lifecycleGuardService.evictCache();
        log.info("Node-action guard detached: id={}", guardId);
    }

    // ================================================================
    // LIFECYCLE STATE ACTIONS — tier 1 (lifecycle-state level)
    // ================================================================

    public List<Map<String, Object>> listStateActions(String stateId) {
        return dsl.fetch("""
            SELECT lsa.id, lsa.trigger, lsa.execution_mode, lsa.display_order,
                   ai.id AS instance_id, ai.name AS instance_name,
                   a.code AS algorithm_code, a.name AS algorithm_name,
                   at.name AS type_name
            FROM lifecycle_state_action lsa
            JOIN algorithm_instance ai ON ai.id = lsa.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            WHERE lsa.lifecycle_state_id = ?
            ORDER BY lsa.display_order
            """, stateId).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",            r.get("id",              String.class));
                m.put("trigger",       r.get("trigger",         String.class));
                m.put("executionMode", r.get("execution_mode",  String.class));
                m.put("displayOrder",  r.get("display_order",   Integer.class));
                m.put("instanceId",    r.get("instance_id",     String.class));
                m.put("instanceName",  r.get("instance_name",   String.class));
                m.put("algorithmCode", r.get("algorithm_code",  String.class));
                m.put("algorithmName", r.get("algorithm_name",  String.class));
                m.put("typeName",      r.get("type_name",       String.class));
                m.put("level",         "LIFECYCLE_STATE");
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String attachStateAction(String stateId, String instanceId,
                                    String trigger, String executionMode, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES (?,?,?,?,?,?)",
            id, stateId, instanceId, trigger, executionMode, displayOrder);
        stateActionService.evictCache();
        log.info("State action attached: state={} instance={} trigger={} mode={}",
            stateId, instanceId, trigger, executionMode);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachStateAction(String attachmentId) {
        dsl.execute("DELETE FROM lifecycle_state_action WHERE id = ?", attachmentId);
        stateActionService.evictCache();
        log.info("State action detached: id={}", attachmentId);
    }

    // ================================================================
    // NODE-TYPE STATE ACTIONS — tier 2 (per-node-type override)
    // ================================================================

    public List<Map<String, Object>> listNodeTypeStateActions(String nodeTypeId, String stateId) {
        return dsl.fetch("""
            SELECT ntsa.id, ntsa.trigger, ntsa.execution_mode, ntsa.override_action, ntsa.display_order,
                   ai.id AS instance_id, ai.name AS instance_name,
                   a.code AS algorithm_code, a.name AS algorithm_name,
                   at.name AS type_name
            FROM node_type_state_action ntsa
            JOIN algorithm_instance ai ON ai.id = ntsa.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            JOIN algorithm_type at ON at.id = a.algorithm_type_id
            WHERE ntsa.node_type_id = ? AND ntsa.lifecycle_state_id = ?
            ORDER BY ntsa.display_order
            """, nodeTypeId, stateId).map(r -> {
                var m = new LinkedHashMap<String, Object>();
                m.put("id",             r.get("id",              String.class));
                m.put("trigger",        r.get("trigger",         String.class));
                m.put("executionMode",  r.get("execution_mode",  String.class));
                m.put("overrideAction", r.get("override_action", String.class));
                m.put("displayOrder",   r.get("display_order",   Integer.class));
                m.put("instanceId",     r.get("instance_id",     String.class));
                m.put("instanceName",   r.get("instance_name",   String.class));
                m.put("algorithmCode",  r.get("algorithm_code",  String.class));
                m.put("algorithmName",  r.get("algorithm_name",  String.class));
                m.put("typeName",       r.get("type_name",       String.class));
                m.put("level",          "NODE_TYPE");
                return m;
            });
    }

    @PlmPermission("MANAGE_PSM")
    public String attachNodeTypeStateAction(String nodeTypeId, String stateId, String instanceId,
                                            String trigger, String executionMode,
                                            String overrideAction, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_type_state_action (id, node_type_id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, override_action, display_order) VALUES (?,?,?,?,?,?,?,?)",
            id, nodeTypeId, stateId, instanceId, trigger, executionMode, overrideAction, displayOrder);
        stateActionService.evictCache();
        log.info("Node-type state action attached: nodeType={} state={} instance={} trigger={} mode={} override={}",
            nodeTypeId, stateId, instanceId, trigger, executionMode, overrideAction);
        return id;
    }

    @PlmPermission("MANAGE_PSM")
    public void detachNodeTypeStateAction(String attachmentId) {
        dsl.execute("DELETE FROM node_type_state_action WHERE id = ?", attachmentId);
        stateActionService.evictCache();
        log.info("Node-type state action detached: id={}", attachmentId);
    }

    // ================================================================
    // Helpers
    // ================================================================

    private String resolveActionId(String actionCode) {
        String id = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOne(DSL.field("id"), String.class);
        if (id == null) throw new IllegalArgumentException("Unknown action: " + actionCode);
        return id;
    }

    private void assertNotManagedForHide(String actionId, String effect) {
        if (!"HIDE".equals(effect)) return; // BLOCK guards are allowed on managed actions
        String managedWith = dsl.select(DSL.field("managed_with")).from("action")
            .where("id = ?", actionId)
            .fetchOne(DSL.field("managed_with"), String.class);
        if (managedWith != null) {
            throw new IllegalArgumentException(
                "Cannot attach HIDE guards on managed action — HIDE guards are inherited from manager action");
        }
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
