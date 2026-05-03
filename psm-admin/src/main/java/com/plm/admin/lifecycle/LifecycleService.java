package com.plm.admin.lifecycle;

import com.plm.admin.config.ConfigChangedEvent;
import com.plm.admin.metadata.MetadataService;
import com.plm.admin.shared.MapKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin CRUD for lifecycles, states, transitions. No transition execution logic.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LifecycleService {

    private final DSLContext dsl;
    private final ApplicationEventPublisher eventPublisher;
    private final MetadataService metadataService;

    public List<Record> getAllLifecycles() {
        return dsl.select().from("lifecycle").orderBy(DSL.field("name")).fetch();
    }

    @Transactional
    public String createLifecycle(String name, String description) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            id, name, description, LocalDateTime.now());
        log.info("Lifecycle created: {}", name);
        publishChange("CREATE", "LIFECYCLE", id);
        return id;
    }

    @Transactional
    public String duplicateLifecycle(String sourceId, String newName) {
        Record src = dsl.select().from("lifecycle").where("id = ?", sourceId).fetchOne();
        if (src == null) throw new IllegalArgumentException("Source lifecycle not found: " + sourceId);
        String newId = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            newId, newName, src.get("description", String.class), LocalDateTime.now());

        Map<String, String> stateMap = new HashMap<>();
        List<Record> srcStates = dsl.select().from("lifecycle_state")
            .where("lifecycle_id = ?", sourceId).orderBy(DSL.field("display_order")).fetch();
        for (Record s : srcStates) {
            String oldSid = s.get("id", String.class);
            String newSid = UUID.randomUUID().toString();
            stateMap.put(oldSid, newSid);
            dsl.execute("INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?)",
                newSid, newId, s.get("name", String.class), s.get("is_initial", Integer.class),
                s.get("display_order", Integer.class), s.get("color", String.class));
            Map<String, String> meta = metadataService.getMetadata("LIFECYCLE_STATE", oldSid);
            if (!meta.isEmpty()) metadataService.setAll("LIFECYCLE_STATE", newSid, meta);
        }

        List<Record> srcTransitions = dsl.select().from("lifecycle_transition")
            .where("lifecycle_id = ?", sourceId).fetch();
        for (Record t : srcTransitions) {
            String newTid = UUID.randomUUID().toString();
            dsl.execute("INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE, VERSION_STRATEGY) VALUES (?,?,?,?,?,?,?,?)",
                newTid, newId, t.get("name", String.class),
                stateMap.get(t.get("from_state_id", String.class)),
                stateMap.get(t.get("to_state_id", String.class)),
                t.get("guard_expr", String.class), t.get("action_type", String.class),
                t.get("version_strategy", String.class));
        }

        log.info("Lifecycle duplicated: {} -> {} ({})", sourceId, newId, newName);
        publishChange("CREATE", "LIFECYCLE", newId);
        return newId;
    }

    public List<Map<String, Object>> getStates(String lifecycleId) {
        List<Record> states = dsl.select().from("lifecycle_state")
            .where("lifecycle_id = ?", lifecycleId).orderBy(DSL.field("display_order")).fetch();
        return states.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>(r.intoMap());
            m.put("metadata", metadataService.getMetadata("LIFECYCLE_STATE", r.get("id", String.class)));
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional
    public String addState(String lifecycleId, String name, boolean isInitial,
                           Map<String, String> metadata, int displayOrder, String color) {
        if (isInitial) {
            int existing = dsl.fetchCount(dsl.selectOne().from("lifecycle_state")
                .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1"));
            if (existing > 0) throw new IllegalStateException("Lifecycle already has an initial state");
        }
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?)",
            id, lifecycleId, name, isInitial ? 1 : 0, displayOrder, color);
        if (metadata != null && !metadata.isEmpty()) metadataService.setAll("LIFECYCLE_STATE", id, metadata);
        publishChange("CREATE", "LIFECYCLE_STATE", id);
        return id;
    }

    @Transactional
    public void updateState(String stateId, String name, boolean isInitial,
                            Map<String, String> metadata, int displayOrder, String color) {
        if (isInitial) {
            String lifecycleId = dsl.select().from("lifecycle_state")
                .where("id = ?", stateId).fetchOne("lifecycle_id", String.class);
            int existing = dsl.fetchCount(dsl.selectOne().from("lifecycle_state")
                .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1").and("id != ?", stateId));
            if (existing > 0) throw new IllegalStateException("Another state is already marked as initial");
        }
        dsl.execute("UPDATE lifecycle_state SET NAME=?, IS_INITIAL=?, DISPLAY_ORDER=?, COLOR=? WHERE ID=?",
            name, isInitial ? 1 : 0, displayOrder, color, stateId);
        if (metadata != null) metadataService.setAll("LIFECYCLE_STATE", stateId, metadata);
        publishChange("UPDATE", "LIFECYCLE_STATE", stateId);
    }

    @Transactional
    public String addTransition(String lifecycleId, String name,
                                String fromStateId, String toStateId,
                                String guardExpr, String actionType, String versionStrategy) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE, VERSION_STRATEGY) VALUES (?,?,?,?,?,?,?,?)",
            id, lifecycleId, name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE");
        publishChange("CREATE", "LIFECYCLE_TRANSITION", id);
        return id;
    }

    @Transactional
    public void updateTransition(String transitionId, String name, String fromStateId, String toStateId,
                                 String guardExpr, String actionType, String versionStrategy) {
        dsl.execute("UPDATE lifecycle_transition SET NAME=?, FROM_STATE_ID=?, TO_STATE_ID=?, GUARD_EXPR=?, ACTION_TYPE=?, VERSION_STRATEGY=? WHERE ID=?",
            name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE", transitionId);
        publishChange("UPDATE", "LIFECYCLE_TRANSITION", transitionId);
    }

    public List<Map<String, Object>> getTransitions(String lifecycleId) {
        List<Record> transitions = dsl.select().from("lifecycle_transition")
            .where("lifecycle_id = ?", lifecycleId).fetch();
        var sigReqs = dsl.select(
                DSL.field("sr.id").as("sr_id"),
                DSL.field("sr.lifecycle_transition_id").as("lifecycle_transition_id"),
                DSL.field("sr.role_required").as("role_required"),
                DSL.field("sr.display_order").as("display_order"))
            .from("signature_requirement sr")
            .join("lifecycle_transition lt").on("lt.id = sr.lifecycle_transition_id")
            .where("lt.lifecycle_id = ?", lifecycleId)
            .orderBy(DSL.field("sr.display_order")).fetch();
        Map<String, List<Map<String, Object>>> reqsByTransition = sigReqs.stream()
            .collect(Collectors.groupingBy(
                r -> r.get("lifecycle_transition_id", String.class),
                Collectors.mapping(r -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", r.get("sr_id", String.class));
                    m.put("roleRequired", r.get("role_required", String.class));
                    m.put("displayOrder", r.get("display_order", Integer.class));
                    return m;
                }, Collectors.toList())));
        return transitions.stream().map(t -> {
            Map<String, Object> m = new LinkedHashMap<>(t.intoMap());
            m.put("signatureRequirements", reqsByTransition.getOrDefault(t.get("id", String.class), List.of()));
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional
    public String addSignatureRequirement(String transitionId, String roleId, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute("INSERT INTO signature_requirement (ID, LIFECYCLE_TRANSITION_ID, ROLE_REQUIRED, DISPLAY_ORDER) VALUES (?,?,?,?)",
            id, transitionId, roleId, displayOrder);
        publishChange("CREATE", "SIGNATURE_REQUIREMENT", id);
        return id;
    }

    @Transactional
    public void removeSignatureRequirement(String reqId) {
        dsl.execute("DELETE FROM signature_requirement WHERE id = ?", reqId);
        publishChange("DELETE", "SIGNATURE_REQUIREMENT", reqId);
    }

    @Transactional
    public void deleteLifecycle(String lifecycleId) {
        dsl.execute("DELETE FROM lifecycle_state_action WHERE lifecycle_state_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM entity_metadata WHERE target_type = 'LIFECYCLE_STATE' AND target_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM attribute_state_rule WHERE lifecycle_state_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_state WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle WHERE id = ?", lifecycleId);
        publishChange("DELETE", "LIFECYCLE", lifecycleId);
    }

    @Transactional
    public void deleteState(String stateId) {
        int inTransitions = dsl.fetchCount(dsl.selectOne().from("lifecycle_transition")
            .where("from_state_id = ?", stateId).or("to_state_id = ?", stateId));
        if (inTransitions > 0) throw new IllegalStateException("State is referenced by " + inTransitions + " transition(s)");
        dsl.execute("DELETE FROM lifecycle_state_action WHERE lifecycle_state_id = ?", stateId);
        dsl.execute("DELETE FROM attribute_state_rule WHERE lifecycle_state_id = ?", stateId);
        metadataService.removeAll("LIFECYCLE_STATE", stateId);
        dsl.execute("DELETE FROM lifecycle_state WHERE id = ?", stateId);
        publishChange("DELETE", "LIFECYCLE_STATE", stateId);
    }

    @Transactional
    public void deleteTransition(String transitionId) {
        // authorization_policy TRANSITION rows cascade via NATS notification (owned by pno-api).
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE id = ?", transitionId);
        publishChange("DELETE", "LIFECYCLE_TRANSITION", transitionId);
    }

    // ── Lifecycle state actions (tier 1, lifecycle_state_action table) ──

    public List<Map<String, Object>> listStateActions(String stateId) {
        return MapKeyUtil.camelize(dsl.fetch(
            "SELECT * FROM lifecycle_state_action " +
            "WHERE lifecycle_state_id = ? ORDER BY display_order",
            stateId).intoMaps());
    }

    @Transactional
    public String attachStateAction(String stateId, String instanceId, String trigger,
                                    String executionMode, int displayOrder) {
        String id = UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES (?,?,?,?,?,?)",
            id, stateId, instanceId,
            trigger == null ? "ON_ENTER" : trigger,
            executionMode == null ? "TRANSACTIONAL" : executionMode,
            displayOrder);
        publishChange("CREATE", "LIFECYCLE_STATE_ACTION", id);
        return id;
    }

    @Transactional
    public void detachStateAction(String attachmentId) {
        dsl.execute("DELETE FROM lifecycle_state_action WHERE id = ?", attachmentId);
        publishChange("DELETE", "LIFECYCLE_STATE_ACTION", attachmentId);
    }

    private void publishChange(String changeType, String entityType, String entityId) {
        eventPublisher.publishEvent(new ConfigChangedEvent(changeType, entityType, entityId));
    }
}
