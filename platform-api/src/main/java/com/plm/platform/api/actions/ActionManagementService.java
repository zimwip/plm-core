package com.plm.platform.api.actions;

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

@Slf4j
@Service
@RequiredArgsConstructor
public class ActionManagementService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;

    public List<Map<String, Object>> listActions(String serviceCode) {
        String sql = "SELECT a.*, ai.name AS handler_instance_name, alg.code AS handler_code, alg.module_name AS handler_module_name " +
                     "FROM action a " +
                     "LEFT JOIN algorithm_instance ai ON ai.id = a.handler_instance_id " +
                     "LEFT JOIN algorithm alg ON alg.id = ai.algorithm_id";
        if (serviceCode != null && !serviceCode.isBlank()) {
            return MapKeyUtil.camelize(dsl.fetch(sql + " WHERE a.service_code = ? ORDER BY a.display_order, a.action_code", serviceCode).intoMaps());
        }
        return MapKeyUtil.camelize(dsl.fetch(sql + " ORDER BY a.service_code, a.display_order, a.action_code").intoMaps());
    }

    public Map<String, Object> getAction(String actionId) {
        return MapKeyUtil.camelize(dsl.fetchOne(
            "SELECT a.*, ai.name AS handler_instance_name, alg.code AS handler_code " +
            "FROM action a " +
            "LEFT JOIN algorithm_instance ai ON ai.id = a.handler_instance_id " +
            "LEFT JOIN algorithm alg ON alg.id = ai.algorithm_id " +
            "WHERE a.id = ?", actionId).intoMap());
    }

    @Transactional
    public String createAction(Map<String, Object> body) {
        String id = (String) body.getOrDefault("id", "act-" + UUID.randomUUID().toString().substring(0, 8));
        String code = (String) body.get("actionCode");
        String serviceCode = (String) body.get("serviceCode");
        if (code == null || code.isBlank()) throw new IllegalArgumentException("actionCode required");
        if (serviceCode == null || serviceCode.isBlank()) throw new IllegalArgumentException("serviceCode required");
        dsl.execute(
            "INSERT INTO action (id, service_code, action_code, scope, display_name, description, display_category, display_order, managed_with, handler_instance_id, created_at) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            id, serviceCode, code,
            body.getOrDefault("scope", "NODE"),
            body.getOrDefault("displayName", code),
            body.get("description"),
            body.getOrDefault("displayCategory", "PRIMARY"),
            body.getOrDefault("displayOrder", 0),
            body.get("managedWith"),
            body.get("handlerInstanceId"),
            LocalDateTime.now());
        publishChange("CREATE", "ACTION", id);
        return id;
    }

    @Transactional
    public void updateAction(String actionId, Map<String, Object> body) {
        dsl.execute(
            "UPDATE action SET display_name = ?, description = ?, scope = ?, display_category = ?, display_order = ?, handler_instance_id = ? WHERE id = ?",
            body.get("displayName"), body.get("description"),
            body.getOrDefault("scope", "NODE"),
            body.getOrDefault("displayCategory", "PRIMARY"),
            body.getOrDefault("displayOrder", 0),
            body.get("handlerInstanceId"),
            actionId);
        publishChange("UPDATE", "ACTION", actionId);
    }

    @Transactional
    public void deleteAction(String actionId) {
        dsl.execute("DELETE FROM action_guard WHERE action_id = ?", actionId);
        dsl.execute("DELETE FROM action_wrapper WHERE action_id = ?", actionId);
        dsl.execute("DELETE FROM action_required_permission WHERE action_id = ?", actionId);
        dsl.execute("DELETE FROM action_parameter WHERE action_id = ?", actionId);
        dsl.execute("DELETE FROM action WHERE id = ?", actionId);
        publishChange("DELETE", "ACTION", actionId);
    }

    // Parameters

    public List<Map<String, Object>> listParameters(String actionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT * FROM action_parameter WHERE action_id = ? ORDER BY display_order", actionId).intoMaps());
    }

    @Transactional
    public String addParameter(String actionId, Map<String, Object> body) {
        String id = "aparam-" + UUID.randomUUID().toString().substring(0, 8);
        dsl.execute(
            "INSERT INTO action_parameter (id, action_id, param_name, param_label, data_type, required, default_value, allowed_values, widget_type, validation_regex, visibility, display_order, tooltip) " +
            "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
            id, actionId,
            body.get("paramName"), body.get("paramLabel"),
            body.getOrDefault("dataType", "STRING"),
            body.getOrDefault("required", 0),
            body.get("defaultValue"), body.get("allowedValues"),
            body.getOrDefault("widgetType", "TEXT"),
            body.get("validationRegex"),
            body.getOrDefault("visibility", "UI_VISIBLE"),
            body.getOrDefault("displayOrder", 0),
            body.get("tooltip"));
        publishChange("UPDATE", "ACTION", actionId);
        return id;
    }

    // Guards

    public List<Map<String, Object>> listActionGuards(String actionId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT ag.*, ai.name AS instance_name, alg.code AS algorithm_code, alg.name AS algorithm_name, alg.module_name AS algorithm_module_name " +
            "FROM action_guard ag " +
            "JOIN algorithm_instance ai ON ai.id = ag.algorithm_instance_id " +
            "JOIN algorithm alg ON alg.id = ai.algorithm_id " +
            "WHERE ag.action_id = ? ORDER BY ag.display_order", actionId).intoMaps());
    }

    @Transactional
    public String attachGuard(String actionId, String instanceId, String effect, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO action_guard (id, action_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
            id, actionId, instanceId, effect, displayOrder);
        publishChange("UPDATE", "ACTION_GUARD", id);
        return id;
    }

    @Transactional
    public void updateGuardEffect(String guardId, String effect) {
        if (effect == null || (!effect.equals("HIDE") && !effect.equals("BLOCK")))
            throw new IllegalArgumentException("effect must be HIDE or BLOCK");
        dsl.execute("UPDATE action_guard SET effect = ? WHERE id = ?", effect, guardId);
        publishChange("UPDATE", "ACTION_GUARD", guardId);
    }

    @Transactional
    public void detachGuard(String guardId) {
        dsl.execute("DELETE FROM action_guard WHERE id = ?", guardId);
        publishChange("DELETE", "ACTION_GUARD", guardId);
    }

    private void publishChange(String op, String type, String id) {
        eventPublisher.publishEvent(new ConfigChangedEvent(op, type, id));
    }
}
