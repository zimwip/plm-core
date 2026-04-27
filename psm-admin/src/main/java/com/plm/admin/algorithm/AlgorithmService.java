package com.plm.admin.algorithm;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.shared.MapKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin CRUD for algorithms, instances, parameter values, guards, and wrappers.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<Map<String, Object>> listAlgorithmTypes() {
        return dsl.select().from("algorithm_type").fetch().intoMaps();
    }

    public List<Map<String, Object>> listAlgorithms() {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT a.*, t.name AS type_name " +
            "FROM algorithm a " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "ORDER BY a.code").intoMaps());
    }

    public List<Map<String, Object>> listAlgorithmsByType(String typeId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT a.*, t.name AS type_name " +
            "FROM algorithm a " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE a.algorithm_type_id = ?", typeId).intoMaps());
    }

    public List<Map<String, Object>> listParameters(String algorithmId) {
        return dsl.select().from("algorithm_parameter")
            .where("algorithm_id = ?", algorithmId)
            .orderBy(DSL.field("display_order")).fetch().intoMaps();
    }

    public List<Map<String, Object>> listAllInstances() {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT ai.*, a.code AS algorithm_code, a.name AS algorithm_name, " +
            "       t.name AS type_name, t.id AS algorithm_type_id " +
            "FROM algorithm_instance ai " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "ORDER BY ai.name").intoMaps());
    }

    public List<Map<String, Object>> listInstances(String algorithmId) {
        return dsl.select().from("algorithm_instance")
            .where("algorithm_id = ?", algorithmId).fetch().intoMaps();
    }

    @Transactional
    public String createInstance(String algorithmId, String name) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO algorithm_instance (id, algorithm_id, name, created_at) VALUES (?,?,?,?)",
            id, algorithmId, name, LocalDateTime.now());
        publishChange("CREATE", "ALGORITHM_INSTANCE", id);
        return id;
    }

    @Transactional
    public void updateInstance(String instanceId, String name) {
        dsl.execute("UPDATE algorithm_instance SET name = ? WHERE id = ?", name, instanceId);
        publishChange("UPDATE", "ALGORITHM_INSTANCE", instanceId);
    }

    @Transactional
    public void deleteInstance(String instanceId) {
        dsl.execute("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM node_action_guard WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM action_wrapper WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM lifecycle_state_action WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM node_type_state_action WHERE algorithm_instance_id = ?", instanceId);
        dsl.execute("DELETE FROM algorithm_instance WHERE id = ?", instanceId);
        publishChange("DELETE", "ALGORITHM_INSTANCE", instanceId);
    }

    public List<Map<String, Object>> getInstanceParamValues(String instanceId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT aipv.*, ap.param_name, ap.param_label, ap.data_type " +
            "FROM algorithm_instance_param_value aipv " +
            "JOIN algorithm_parameter ap ON ap.id = aipv.algorithm_parameter_id " +
            "WHERE aipv.algorithm_instance_id = ?", instanceId).intoMaps());
    }

    @Transactional
    public void setInstanceParamValue(String instanceId, String parameterId, String value) {
        dsl.execute("DELETE FROM algorithm_instance_param_value WHERE algorithm_instance_id = ? AND algorithm_parameter_id = ?",
            instanceId, parameterId);
        dsl.execute("INSERT INTO algorithm_instance_param_value (id, algorithm_instance_id, algorithm_parameter_id, value) VALUES (?,?,?,?)",
            UUID.randomUUID().toString(), instanceId, parameterId, value);
        publishChange("UPDATE", "ALGORITHM_INSTANCE", instanceId);
    }

    // Guards
    public List<Map<String, Object>> listActionGuards(String actionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT ag.*, ai.name AS instance_name, " +
            "       a.code AS algorithm_code, a.name AS algorithm_name, " +
            "       a.module_name AS module_name, " +
            "       t.name AS type_name " +
            "FROM action_guard ag " +
            "JOIN algorithm_instance ai ON ai.id = ag.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE ag.action_id = ? ORDER BY ag.display_order", actionId).intoMaps());
    }

    @Transactional
    public String attachActionGuard(String actionId, String instanceId, String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, actionId, instanceId, effect, displayOrder);
        publishChange("CREATE", "ACTION_GUARD", id);
        return id;
    }

    @Transactional
    public void updateActionGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK"))) {
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        }
        int rows = dsl.execute("UPDATE action_guard SET effect = ? WHERE id = ?", effect, guardId);
        if (rows == 0) throw new IllegalArgumentException("Unknown action guard: " + guardId);
        publishChange("UPDATE", "ACTION_GUARD", guardId);
    }

    @Transactional
    public void detachActionGuard(String guardId) {
        dsl.execute("DELETE FROM action_guard WHERE id = ?", guardId);
        publishChange("DELETE", "ACTION_GUARD", guardId);
    }

    // Wrappers
    public List<Map<String, Object>> listActionWrappers(String actionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT aw.*, ai.name AS instance_name, " +
            "       a.code AS algorithm_code, a.name AS algorithm_name, " +
            "       a.module_name AS module_name, " +
            "       t.name AS type_name " +
            "FROM action_wrapper aw " +
            "JOIN algorithm_instance ai ON ai.id = aw.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE aw.action_id = ? ORDER BY aw.execution_order", actionId).intoMaps());
    }

    @Transactional
    public String attachActionWrapper(String actionId, String instanceId, int executionOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO action_wrapper (id, action_id, algorithm_instance_id, execution_order) VALUES (?,?,?,?)",
            id, actionId, instanceId, executionOrder);
        publishChange("CREATE", "ACTION_WRAPPER", id);
        return id;
    }

    @Transactional
    public void detachActionWrapper(String wrapperId) {
        dsl.execute("DELETE FROM action_wrapper WHERE id = ?", wrapperId);
        publishChange("DELETE", "ACTION_WRAPPER", wrapperId);
    }

    // Stats — aggregated by AlgorithmStatsAggregator from NATS deltas.
    public List<Map<String, Object>> getStats() {
        List<Map<String, Object>> out = new java.util.ArrayList<>();
        dsl.select().from("algorithm_stat")
            .orderBy(DSL.field("algorithm_code"))
            .fetch()
            .forEach(r -> {
                long count   = r.get("call_count", Long.class);
                long totalNs = r.get("total_ns",   Long.class);
                long minNs   = r.get("min_ns",     Long.class);
                long maxNs   = r.get("max_ns",     Long.class);
                double totalMs = totalNs / 1_000_000.0;
                double avgMs   = count > 0 ? totalMs / count : 0;
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("callCount", count);
                m.put("totalMs",   totalMs);
                m.put("minMs",     minNs / 1_000_000.0);
                m.put("maxMs",     maxNs / 1_000_000.0);
                m.put("avgMs",     avgMs);
                m.put("lastFlushed", String.valueOf(r.get("last_flushed")));
                out.add(m);
            });
        return out;
    }

    @Transactional
    public void resetStats() {
        dsl.execute("DELETE FROM algorithm_stat_window");
        dsl.execute("DELETE FROM algorithm_stat");
    }

    /** Returns stat windows for the last {@code hours} hours, oldest first. */
    public List<Map<String, Object>> getStatsTimeseries(int hours) {
        long cutoffEpochSec = java.time.Instant.now().minusSeconds(Math.max(1, hours) * 3600L).getEpochSecond();
        List<Map<String, Object>> out = new java.util.ArrayList<>();
        dsl.fetch(
            "SELECT * FROM algorithm_stat_window WHERE window_start >= TIMESTAMP 'epoch' + (? * INTERVAL '1 second') ORDER BY window_start",
            cutoffEpochSec)
            .forEach(r -> {
                long count   = r.get("call_count", Long.class);
                long totalNs = r.get("total_ns",   Long.class);
                long minNs   = r.get("min_ns",     Long.class);
                long maxNs   = r.get("max_ns",     Long.class);
                Map<String, Object> m = new java.util.LinkedHashMap<>();
                m.put("windowStart",   String.valueOf(r.get("window_start")));
                m.put("algorithmCode", r.get("algorithm_code", String.class));
                m.put("callCount",     count);
                m.put("totalMs",       totalNs / 1_000_000.0);
                m.put("avgMs",         count > 0 ? (totalNs / 1_000_000.0) / count : 0.0);
                m.put("minMs",         minNs / 1_000_000.0);
                m.put("maxMs",         maxNs / 1_000_000.0);
                out.add(m);
            });
        return out;
    }

    // Lifecycle-transition guards
    public List<Map<String, Object>> listTransitionGuards(String transitionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT ltg.*, ai.name AS instance_name, " +
            "       a.code AS algorithm_code, a.name AS algorithm_name, " +
            "       a.module_name AS module_name, " +
            "       t.name AS type_name " +
            "FROM lifecycle_transition_guard ltg " +
            "JOIN algorithm_instance ai ON ai.id = ltg.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE ltg.lifecycle_transition_id = ? ORDER BY ltg.display_order",
            transitionId).intoMaps());
    }

    @Transactional
    public String attachTransitionGuard(String transitionId, String instanceId, String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, transitionId, instanceId, effect, displayOrder);
        publishChange("CREATE", "LIFECYCLE_TRANSITION_GUARD", id);
        return id;
    }

    @Transactional
    public void updateTransitionGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK"))) {
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        }
        int rows = dsl.execute("UPDATE lifecycle_transition_guard SET effect = ? WHERE id = ?", effect, guardId);
        if (rows == 0) throw new IllegalArgumentException("Unknown transition guard: " + guardId);
        publishChange("UPDATE", "LIFECYCLE_TRANSITION_GUARD", guardId);
    }

    @Transactional
    public void detachTransitionGuard(String guardId) {
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE id = ?", guardId);
        publishChange("DELETE", "LIFECYCLE_TRANSITION_GUARD", guardId);
    }

    // Node-action guards (per node_type × action [× transition])
    public List<Map<String, Object>> listNodeActionGuards(String nodeTypeId, String actionCode, String transitionId) {
        String sql =
            "SELECT nag.*, ai.name AS instance_name, " +
            "       alg.code AS algorithm_code, alg.name AS algorithm_name, " +
            "       alg.module_name AS module_name, " +
            "       t.name AS type_name " +
            "FROM node_action_guard nag " +
            "JOIN algorithm_instance ai ON ai.id = nag.algorithm_instance_id " +
            "JOIN algorithm alg ON alg.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = alg.algorithm_type_id " +
            "JOIN action a ON a.id = nag.action_id " +
            "WHERE nag.node_type_id = ? AND a.action_code = ? " +
            (transitionId != null && !transitionId.isBlank() ? "AND nag.transition_id = ? " : "AND nag.transition_id IS NULL ") +
            "ORDER BY nag.display_order";
        return MapKeyUtil.camelize((transitionId != null && !transitionId.isBlank()
            ? dsl.fetch(sql, nodeTypeId, actionCode, transitionId)
            : dsl.fetch(sql, nodeTypeId, actionCode)).intoMaps());
    }

    @Transactional
    public String attachNodeActionGuard(String nodeTypeId, String actionCode, String transitionId,
                                        String instanceId, String effect, String overrideAction, int displayOrder) {
        String actionId = dsl.select(DSL.field("id")).from("action")
            .where("action_code = ?", actionCode)
            .fetchOptional("id", String.class)
            .orElseThrow(() -> new IllegalArgumentException("Unknown action code: " + actionCode));
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_action_guard (id, node_type_id, action_id, transition_id, algorithm_instance_id, effect, override_action, display_order) VALUES (?,?,?,?,?,?,?,?)",
            id, nodeTypeId, actionId,
            (transitionId == null || transitionId.isBlank()) ? null : transitionId,
            instanceId, effect, overrideAction == null ? "ADD" : overrideAction, displayOrder);
        publishChange("CREATE", "NODE_ACTION_GUARD", id);
        return id;
    }

    @Transactional
    public void updateNodeActionGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK"))) {
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        }
        int rows = dsl.execute("UPDATE node_action_guard SET effect = ? WHERE id = ?", effect, guardId);
        if (rows == 0) throw new IllegalArgumentException("Unknown node-action guard: " + guardId);
        publishChange("UPDATE", "NODE_ACTION_GUARD", guardId);
    }

    @Transactional
    public void detachNodeActionGuard(String guardId) {
        dsl.execute("DELETE FROM node_action_guard WHERE id = ?", guardId);
        publishChange("DELETE", "NODE_ACTION_GUARD", guardId);
    }

    // Node-type × lifecycle-state action overrides (tier 2)
    public List<Map<String, Object>> listNodeTypeStateActions(String nodeTypeId, String stateId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT ntsa.*, ai.name AS instance_name, " +
            "       a.code AS algorithm_code, a.name AS algorithm_name, " +
            "       a.module_name AS module_name, " +
            "       t.name AS type_name " +
            "FROM node_type_state_action ntsa " +
            "JOIN algorithm_instance ai ON ai.id = ntsa.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE ntsa.node_type_id = ? AND ntsa.lifecycle_state_id = ? " +
            "ORDER BY ntsa.display_order",
            nodeTypeId, stateId).intoMaps());
    }

    @Transactional
    public String attachNodeTypeStateAction(String nodeTypeId, String stateId, String instanceId,
                                            String trigger, String executionMode, String overrideAction,
                                            int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO node_type_state_action (id, node_type_id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, override_action, display_order) VALUES (?,?,?,?,?,?,?,?)",
            id, nodeTypeId, stateId, instanceId,
            trigger == null ? "ON_ENTER" : trigger,
            executionMode == null ? "TRANSACTIONAL" : executionMode,
            overrideAction == null ? "ADD" : overrideAction,
            displayOrder);
        publishChange("CREATE", "NODE_TYPE_STATE_ACTION", id);
        return id;
    }

    @Transactional
    public void detachNodeTypeStateAction(String attachmentId) {
        dsl.execute("DELETE FROM node_type_state_action WHERE id = ?", attachmentId);
        publishChange("DELETE", "NODE_TYPE_STATE_ACTION", attachmentId);
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
