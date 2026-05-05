package com.plm.platform.api.actions;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlgorithmManagementService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<Map<String, Object>> listAlgorithmTypes(String serviceCode) {
        if (serviceCode != null && !serviceCode.isBlank())
            return dsl.fetch("SELECT * FROM algorithm_type WHERE service_code = ? ORDER BY name", serviceCode).intoMaps();
        return dsl.fetch("SELECT * FROM algorithm_type ORDER BY service_code, name").intoMaps();
    }

    public List<Map<String, Object>> listAlgorithms(String serviceCode) {
        String sql = "SELECT a.*, t.name AS type_name FROM algorithm a JOIN algorithm_type t ON t.id = a.algorithm_type_id";
        if (serviceCode != null && !serviceCode.isBlank())
            return MapKeyUtil.camelize(dsl.fetch(sql + " WHERE a.service_code = ? ORDER BY a.code", serviceCode).intoMaps());
        return MapKeyUtil.camelize(dsl.fetch(sql + " ORDER BY a.service_code, a.code").intoMaps());
    }

    public List<Map<String, Object>> listAlgorithmsByType(String typeId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT a.*, t.name AS type_name FROM algorithm a JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE a.algorithm_type_id = ? ORDER BY a.code", typeId).intoMaps());
    }

    public List<Map<String, Object>> listParameters(String algorithmId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT * FROM algorithm_parameter WHERE algorithm_id = ? ORDER BY display_order", algorithmId).intoMaps());
    }

    public List<Map<String, Object>> listAllInstances(String serviceCode) {
        String sql = "SELECT ai.*, a.code AS algorithm_code, a.name AS algorithm_name, t.name AS type_name, t.id AS algorithm_type_id " +
                     "FROM algorithm_instance ai " +
                     "JOIN algorithm a ON a.id = ai.algorithm_id " +
                     "JOIN algorithm_type t ON t.id = a.algorithm_type_id";
        if (serviceCode != null && !serviceCode.isBlank())
            return MapKeyUtil.camelize(dsl.fetch(sql + " WHERE ai.service_code = ? ORDER BY ai.name", serviceCode).intoMaps());
        return MapKeyUtil.camelize(dsl.fetch(sql + " ORDER BY ai.service_code, ai.name").intoMaps());
    }

    public List<Map<String, Object>> listInstances(String algorithmId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT * FROM algorithm_instance WHERE algorithm_id = ? ORDER BY name", algorithmId).intoMaps());
    }

    @Transactional
    public String createInstance(String algorithmId, String name, String serviceCode) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO algorithm_instance (id, service_code, algorithm_id, name, created_at) VALUES (?,?,?,?,?)",
            id, serviceCode, algorithmId, name, LocalDateTime.now());
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
        dsl.execute("DELETE FROM action_wrapper WHERE algorithm_instance_id = ?", instanceId);
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

    // Action wrappers

    public List<Map<String, Object>> listActionWrappers(String actionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT aw.*, ai.name AS instance_name, a.code AS algorithm_code, a.name AS algorithm_name, t.name AS type_name " +
            "FROM action_wrapper aw " +
            "JOIN algorithm_instance ai ON ai.id = aw.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE aw.action_id = ? ORDER BY aw.execution_order", actionId).intoMaps());
    }

    @Transactional
    public String attachActionWrapper(String actionId, String instanceId, int executionOrder, String serviceCode) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO action_wrapper (id, service_code, action_id, algorithm_instance_id, execution_order) VALUES (?,?,?,?,?)",
            id, serviceCode, actionId, instanceId, executionOrder);
        publishChange("CREATE", "ACTION_WRAPPER", id);
        return id;
    }

    @Transactional
    public void detachActionWrapper(String wrapperId) {
        dsl.execute("DELETE FROM action_wrapper WHERE id = ?", wrapperId);
        publishChange("DELETE", "ACTION_WRAPPER", wrapperId);
    }

    // Lifecycle-transition guards

    public List<Map<String, Object>> listTransitionGuards(String transitionId, String serviceCode) {
        String sql = "SELECT ltg.*, ai.name AS instance_name, " +
            "a.code AS algorithm_code, a.name AS algorithm_name, " +
            "a.module_name AS module_name, t.name AS type_name " +
            "FROM lifecycle_transition_guard ltg " +
            "JOIN algorithm_instance ai ON ai.id = ltg.algorithm_instance_id " +
            "JOIN algorithm a ON a.id = ai.algorithm_id " +
            "JOIN algorithm_type t ON t.id = a.algorithm_type_id " +
            "WHERE ltg.lifecycle_transition_id = ?";
        if (serviceCode != null && !serviceCode.isBlank())
            return MapKeyUtil.camelize(dsl.fetch(sql + " AND ltg.service_code = ? ORDER BY ltg.display_order",
                transitionId, serviceCode).intoMaps());
        return MapKeyUtil.camelize(dsl.fetch(sql + " ORDER BY ltg.display_order", transitionId).intoMaps());
    }

    @Transactional
    public String attachTransitionGuard(String transitionId, String instanceId,
                                        String effect, int displayOrder, String serviceCode) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition_guard (id, service_code, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?,?)",
            id, serviceCode, transitionId, instanceId, effect, displayOrder);
        publishChange("CREATE", "LIFECYCLE_TRANSITION_GUARD", id);
        return id;
    }

    @Transactional
    public void updateTransitionGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK")))
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        int rows = dsl.execute("UPDATE lifecycle_transition_guard SET effect = ? WHERE id = ?", effect, guardId);
        if (rows == 0) throw new IllegalArgumentException("Unknown transition guard: " + guardId);
        publishChange("UPDATE", "LIFECYCLE_TRANSITION_GUARD", guardId);
    }

    @Transactional
    public void detachTransitionGuard(String guardId) {
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE id = ?", guardId);
        publishChange("DELETE", "LIFECYCLE_TRANSITION_GUARD", guardId);
    }

    // Stats

    public List<Map<String, Object>> getStats(String serviceCode) {
        String sql;
        List<Map<String, Object>> rows;
        if (serviceCode != null && !serviceCode.isBlank()) {
            sql = """
                SELECT s.algorithm_code, s.call_count, s.total_ns, s.min_ns, s.max_ns, s.last_flushed
                FROM algorithm_stat s
                WHERE EXISTS (SELECT 1 FROM algorithm a WHERE a.code = s.algorithm_code AND a.service_code = ?)
                ORDER BY s.call_count DESC
                """;
            rows = dsl.fetch(sql, serviceCode).intoMaps();
        } else {
            sql = "SELECT * FROM algorithm_stat ORDER BY call_count DESC";
            rows = dsl.fetch(sql).intoMaps();
        }
        return rows.stream().map(r -> {
            long totalNs = ((Number) r.get("total_ns")).longValue();
            long minNs   = ((Number) r.get("min_ns")).longValue();
            long maxNs   = ((Number) r.get("max_ns")).longValue();
            long count   = ((Number) r.get("call_count")).longValue();
            return Map.<String, Object>of(
                "algorithmCode", r.get("algorithm_code"),
                "callCount",     count,
                "minMs",         minNs / 1_000_000.0,
                "avgMs",         count > 0 ? (totalNs / 1_000_000.0 / count) : 0.0,
                "maxMs",         maxNs / 1_000_000.0,
                "totalMs",       totalNs / 1_000_000.0,
                "lastFlushed",   r.get("last_flushed") != null ? r.get("last_flushed").toString() : ""
            );
        }).toList();
    }

    public List<Map<String, Object>> getTimeseries(String serviceCode, int hours) {
        String sql;
        List<Map<String, Object>> rows;
        if (serviceCode != null && !serviceCode.isBlank()) {
            sql = """
                SELECT w.algorithm_code, w.window_start, w.call_count, w.total_ns, w.min_ns, w.max_ns
                FROM algorithm_stat_window w
                WHERE w.window_start >= ? AND EXISTS (
                    SELECT 1 FROM algorithm a WHERE a.code = w.algorithm_code AND a.service_code = ?
                )
                ORDER BY w.window_start, w.algorithm_code
                """;
            rows = dsl.fetch(sql, LocalDateTime.now().minusHours(hours), serviceCode).intoMaps();
        } else {
            sql = """
                SELECT * FROM algorithm_stat_window
                WHERE window_start >= ?
                ORDER BY window_start, algorithm_code
                """;
            rows = dsl.fetch(sql, LocalDateTime.now().minusHours(hours)).intoMaps();
        }
        return rows.stream().map(r -> {
            long totalNs = ((Number) r.get("total_ns")).longValue();
            long count   = ((Number) r.get("call_count")).longValue();
            return Map.<String, Object>of(
                "algorithmCode", r.get("algorithm_code"),
                "windowStart",   r.get("window_start") != null ? r.get("window_start").toString() : "",
                "callCount",     count,
                "totalMs",       totalNs / 1_000_000.0
            );
        }).toList();
    }

    @Transactional
    public void resetStats(String serviceCode) {
        if (serviceCode != null && !serviceCode.isBlank()) {
            dsl.execute("DELETE FROM algorithm_stat_window WHERE algorithm_code IN (SELECT code FROM algorithm WHERE service_code = ?)", serviceCode);
            dsl.execute("DELETE FROM algorithm_stat WHERE algorithm_code IN (SELECT code FROM algorithm WHERE service_code = ?)", serviceCode);
        } else {
            dsl.execute("DELETE FROM algorithm_stat_window");
            dsl.execute("DELETE FROM algorithm_stat");
        }
    }

    private void publishChange(String op, String type, String id) {
        eventPublisher.publishEvent(new ConfigChangedEvent(op, type, id));
    }
}
