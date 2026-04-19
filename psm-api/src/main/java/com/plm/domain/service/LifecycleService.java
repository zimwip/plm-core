package com.plm.domain.service;

import com.plm.domain.action.guard.ActionGuardContext;
import com.plm.domain.action.guard.ActionGuardService;
import com.plm.domain.guard.GuardEvaluation;
import com.plm.domain.guard.GuardViolation;
import com.plm.domain.lifecycle.guard.LifecycleGuardContext;
import com.plm.domain.lifecycle.guard.LifecycleGuardService;
import com.plm.domain.model.Enums.ChangeType;
import com.plm.domain.model.Enums.VersionStrategy;
import com.plm.domain.metadata.MetadataService;
import com.plm.domain.stateaction.StateActionContext;
import com.plm.domain.stateaction.StateActionService;
import com.plm.domain.stateaction.StateActionTrigger;
import com.plm.infrastructure.PlmEventPublisher;
import com.plm.domain.action.PlmAction;
import com.plm.domain.security.PlmUserContext;
import com.plm.domain.security.SecurityContextPort;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Application des transitions de lifecycle.
 *
 * txId obligatoire pour toute transition (comme toute opération d'authoring).
 * La transition est une modification de type LIFECYCLE — elle ne change pas
 * revision.iteration mais crée une nouvelle version technique pour la traçabilité.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LifecycleService {

    private final DSLContext              dsl;
    private final VersionService          versionService;
    private final LockService             lockService;
    private final PlmEventPublisher       eventPublisher;
    private final ActionGuardService       actionGuardService;
    private final LifecycleGuardService    lifecycleGuardService;
    private final SecurityContextPort     secCtx;
    private final StateActionService      stateActionService;
    private final MetadataService         metadataService;

    // ── In-memory lifecycle cache (states + transitions) ────────────
    // Lazy-built, invalidated via invalidateCache(). Same pattern as MetaModelCache.

    private record CachedState(String id, String name, String color, String lifecycleId,
                                boolean isInitial) {}
    private record CachedTransition(String id, String name, String lifecycleId,
                                     String fromStateId, String toStateId,
                                     String actionType, String versionStrategy) {}
    private record LifecycleSnapshot(
        Map<String, CachedState> statesById,
        Map<String, CachedTransition> transitionsById
    ) {}

    private final AtomicReference<LifecycleSnapshot> lifecycleCache = new AtomicReference<>(null);

    private LifecycleSnapshot getSnapshot() {
        LifecycleSnapshot snap = lifecycleCache.get();
        if (snap != null) return snap;
        snap = buildSnapshot();
        lifecycleCache.compareAndSet(null, snap);
        return lifecycleCache.get();
    }

    private LifecycleSnapshot buildSnapshot() {
        Map<String, CachedState> states = new HashMap<>();
        dsl.select().from("lifecycle_state").fetch().forEach(r -> {
            String id = r.get("id", String.class);
            states.put(id, new CachedState(id,
                r.get("name", String.class),
                r.get("color", String.class),
                r.get("lifecycle_id", String.class),
                r.get("is_initial", Integer.class) == 1));
        });
        Map<String, CachedTransition> transitions = new HashMap<>();
        dsl.select().from("lifecycle_transition").fetch().forEach(r -> {
            String id = r.get("id", String.class);
            transitions.put(id, new CachedTransition(id,
                r.get("name", String.class),
                r.get("lifecycle_id", String.class),
                r.get("from_state_id", String.class),
                r.get("to_state_id", String.class),
                r.get("action_type", String.class),
                r.get("version_strategy", String.class)));
        });
        log.info("Lifecycle cache built: {} states, {} transitions", states.size(), transitions.size());
        return new LifecycleSnapshot(Map.copyOf(states), Map.copyOf(transitions));
    }

    /** Invalidate lifecycle cache — call after metamodel changes to states/transitions. */
    public void invalidateCache() {
        lifecycleCache.set(null);
        log.info("Lifecycle cache invalidated");
    }

    /** Returns the color of the target state for a given transition, or null. */
    public String getTransitionTargetStateColor(String transitionId) {
        if (transitionId == null) return null;
        CachedTransition t = getSnapshot().transitionsById.get(transitionId);
        if (t == null) return null;
        CachedState s = getSnapshot().statesById.get(t.toStateId);
        return s != null ? s.color : null;
    }

    /** Returns cached transition by ID, or null. */
    public CachedTransition getCachedTransition(String transitionId) {
        return transitionId != null ? getSnapshot().transitionsById.get(transitionId) : null;
    }

    /** Returns cached state by ID, or null. */
    public CachedState getCachedState(String stateId) {
        return stateId != null ? getSnapshot().statesById.get(stateId) : null;
    }

    // ================================================================
    // LIFECYCLE AUTHORING — CRUD for lifecycles, states, transitions
    // ================================================================

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public String createLifecycle(String name, String description) {
        String id = java.util.UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            id, name, description, java.time.LocalDateTime.now());
        log.info("Lifecycle created: {}", name);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public String duplicateLifecycle(String sourceId, String newName) {
        Record src = dsl.select().from("lifecycle").where("id = ?", sourceId).fetchOne();
        if (src == null) throw new IllegalArgumentException("Source lifecycle not found: " + sourceId);

        String newId = java.util.UUID.randomUUID().toString();
        dsl.execute("INSERT INTO lifecycle (ID, NAME, DESCRIPTION, CREATED_AT) VALUES (?,?,?,?)",
            newId, newName, src.get("description", String.class), java.time.LocalDateTime.now());

        // Copy states (build old→new ID mapping)
        Map<String, String> stateMap = new HashMap<>();
        List<Record> srcStates = dsl.select().from("lifecycle_state")
            .where("lifecycle_id = ?", sourceId).orderBy(DSL.field("display_order")).fetch();
        for (Record s : srcStates) {
            String oldSid = s.get("id", String.class);
            String newSid = java.util.UUID.randomUUID().toString();
            stateMap.put(oldSid, newSid);
            dsl.execute(
                "INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?)",
                newSid, newId, s.get("name", String.class),
                s.get("is_initial", Integer.class),
                s.get("display_order", Integer.class),
                s.get("color", String.class));
            // Copy metadata
            Map<String, String> meta = metadataService.getMetadata("LIFECYCLE_STATE", oldSid);
            if (!meta.isEmpty()) {
                metadataService.setAll("LIFECYCLE_STATE", newSid, meta);
            }
            // Copy state actions
            List<Record> stateActions = dsl.fetch(
                "SELECT algorithm_instance_id, trigger, execution_mode, display_order FROM lifecycle_state_action WHERE lifecycle_state_id = ?",
                oldSid);
            for (Record sa : stateActions) {
                dsl.execute(
                    "INSERT INTO lifecycle_state_action (id, lifecycle_state_id, algorithm_instance_id, trigger, execution_mode, display_order) VALUES (?,?,?,?,?,?)",
                    java.util.UUID.randomUUID().toString(), newSid,
                    sa.get("algorithm_instance_id", String.class),
                    sa.get("trigger", String.class),
                    sa.get("execution_mode", String.class),
                    sa.get("display_order", Integer.class));
            }
        }

        // Copy transitions (remap state IDs)
        Map<String, String> transMap = new HashMap<>();
        List<Record> srcTransitions = dsl.select().from("lifecycle_transition")
            .where("lifecycle_id = ?", sourceId).fetch();
        for (Record t : srcTransitions) {
            String oldTid = t.get("id", String.class);
            String newTid = java.util.UUID.randomUUID().toString();
            transMap.put(oldTid, newTid);
            dsl.execute(
                "INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE, VERSION_STRATEGY) VALUES (?,?,?,?,?,?,?,?)",
                newTid, newId, t.get("name", String.class),
                stateMap.get(t.get("from_state_id", String.class)),
                stateMap.get(t.get("to_state_id", String.class)),
                t.get("guard_expr", String.class),
                t.get("action_type", String.class),
                t.get("version_strategy", String.class));
            // Copy transition guards
            List<Record> tGuards = dsl.fetch(
                "SELECT algorithm_instance_id, effect, display_order FROM lifecycle_transition_guard WHERE lifecycle_transition_id = ?",
                oldTid);
            for (Record g : tGuards) {
                dsl.execute(
                    "INSERT INTO lifecycle_transition_guard (id, lifecycle_transition_id, algorithm_instance_id, effect, display_order) VALUES (?,?,?,?,?)",
                    java.util.UUID.randomUUID().toString(), newTid,
                    g.get("algorithm_instance_id", String.class),
                    g.get("effect", String.class),
                    g.get("display_order", Integer.class));
            }
            // Copy signature requirements
            List<Record> sigReqs = dsl.fetch(
                "SELECT role_required, display_order FROM signature_requirement WHERE lifecycle_transition_id = ?",
                oldTid);
            for (Record sr : sigReqs) {
                dsl.execute(
                    "INSERT INTO signature_requirement (id, lifecycle_transition_id, role_required, display_order) VALUES (?,?,?,?)",
                    java.util.UUID.randomUUID().toString(), newTid,
                    sr.get("role_required", String.class),
                    sr.get("display_order", Integer.class));
            }
        }

        log.info("Lifecycle duplicated: {} → {} ({})", sourceId, newId, newName);
        invalidateCache();
        stateActionService.evictCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return newId;
    }

    public List<Record> getAllLifecycles() {
        return dsl.select().from("lifecycle").orderBy(DSL.field("name")).fetch();
    }

    public Record getLifecycle(String lifecycleId) {
        return dsl.select().from("lifecycle").where("id = ?", lifecycleId).fetchOne();
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public String addState(String lifecycleId, String name,
                           boolean isInitial, Map<String, String> metadata,
                           int displayOrder, String color) {
        if (isInitial) {
            int existing = dsl.fetchCount(
                dsl.selectOne().from("lifecycle_state")
                   .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1"));
            if (existing > 0) throw new IllegalStateException("Lifecycle already has an initial state");
        }
        String id = java.util.UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_state (ID, LIFECYCLE_ID, NAME, IS_INITIAL, DISPLAY_ORDER, COLOR) VALUES (?,?,?,?,?,?)",
            id, lifecycleId, name, isInitial ? 1 : 0, displayOrder, color);
        if (metadata != null && !metadata.isEmpty()) {
            metadataService.setAll("LIFECYCLE_STATE", id, metadata);
        }
        log.info("State '{}' added to lifecycle {}", name, lifecycleId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void updateState(String stateId, String name, boolean isInitial,
                            Map<String, String> metadata, int displayOrder, String color) {
        if (isInitial) {
            String lifecycleId = dsl.select().from("lifecycle_state")
                .where("id = ?", stateId).fetchOne("lifecycle_id", String.class);
            int existing = dsl.fetchCount(
                dsl.selectOne().from("lifecycle_state")
                   .where("lifecycle_id = ?", lifecycleId).and("is_initial = 1").and("id != ?", stateId));
            if (existing > 0) throw new IllegalStateException("Another state is already marked as initial");
        }
        dsl.execute(
            "UPDATE lifecycle_state SET NAME=?, IS_INITIAL=?, DISPLAY_ORDER=?, COLOR=? WHERE ID=?",
            name, isInitial ? 1 : 0, displayOrder, color, stateId);
        if (metadata != null) {
            metadataService.setAll("LIFECYCLE_STATE", stateId, metadata);
        }
        log.info("LifecycleState {} updated: name={}", stateId, name);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    public List<Map<String, Object>> getStates(String lifecycleId) {
        List<Record> states = dsl.select().from("lifecycle_state")
            .where("lifecycle_id = ?", lifecycleId).orderBy(DSL.field("display_order")).fetch();
        return states.stream().map(r -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>(r.intoMap());
            m.put("metadata", metadataService.getMetadata("LIFECYCLE_STATE", r.get("id", String.class)));
            return m;
        }).collect(Collectors.toList());
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public String addTransition(String lifecycleId, String name,
                                String fromStateId, String toStateId,
                                String guardExpr, String actionType, String versionStrategy) {
        validateStateOwnership(lifecycleId, fromStateId, "fromState");
        validateStateOwnership(lifecycleId, toStateId, "toState");
        String id = java.util.UUID.randomUUID().toString();
        dsl.execute(
            "INSERT INTO lifecycle_transition (ID, LIFECYCLE_ID, NAME, FROM_STATE_ID, TO_STATE_ID, GUARD_EXPR, ACTION_TYPE, VERSION_STRATEGY) VALUES (?,?,?,?,?,?,?,?)",
            id, lifecycleId, name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE");
        log.info("Transition '{}' added: {} → {}", name, fromStateId, toStateId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void updateTransition(String transitionId, String name, String fromStateId, String toStateId,
                                 String guardExpr, String actionType, String versionStrategy) {
        dsl.execute(
            "UPDATE lifecycle_transition SET NAME=?, FROM_STATE_ID=?, TO_STATE_ID=?, GUARD_EXPR=?, ACTION_TYPE=?, VERSION_STRATEGY=? WHERE ID=?",
            name, fromStateId, toStateId, guardExpr, actionType,
            versionStrategy != null ? versionStrategy : "NONE", transitionId);
        log.info("LifecycleTransition {} updated: name={}", transitionId, name);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
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
            .collect(java.util.stream.Collectors.groupingBy(
                r -> r.get("lifecycle_transition_id", String.class),
                java.util.stream.Collectors.mapping(r -> {
                    Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("id", r.get("sr_id", String.class));
                    m.put("roleRequired", r.get("role_required", String.class));
                    m.put("displayOrder", r.get("display_order", Integer.class));
                    return m;
                }, java.util.stream.Collectors.toList())));
        return transitions.stream().map(t -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>(t.intoMap());
            m.put("signatureRequirements",
                reqsByTransition.getOrDefault(t.get("id", String.class), List.of()));
            return m;
        }).collect(java.util.stream.Collectors.toList());
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public String addSignatureRequirement(String transitionId, String roleId, int displayOrder) {
        String id = java.util.UUID.randomUUID().toString();
        dsl.execute("INSERT INTO signature_requirement (ID, LIFECYCLE_TRANSITION_ID, ROLE_REQUIRED, DISPLAY_ORDER) VALUES (?,?,?,?)",
            id, transitionId, roleId, displayOrder);
        log.info("SignatureRequirement added: transition={} role={}", transitionId, roleId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
        return id;
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void removeSignatureRequirement(String reqId) {
        dsl.execute("DELETE FROM signature_requirement WHERE id = ?", reqId);
        log.info("SignatureRequirement {} deleted", reqId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void deleteLifecycle(String lifecycleId) {
        int used = dsl.fetchCount(dsl.selectOne().from("node_type").where("lifecycle_id = ?", lifecycleId));
        if (used > 0) throw new IllegalStateException("Lifecycle is referenced by " + used + " node type(s)");
        dsl.execute("DELETE FROM node_type_state_action WHERE lifecycle_state_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_state_action WHERE lifecycle_state_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM entity_metadata WHERE target_type = 'LIFECYCLE_STATE' AND target_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM attribute_state_rule WHERE lifecycle_state_id IN (SELECT id FROM lifecycle_state WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM action_permission WHERE action_id = 'act-transition' AND node_type_id IN (SELECT id FROM node_type WHERE lifecycle_id = ?) AND transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId, lifecycleId);
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE lifecycle_transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM node_action_guard WHERE transition_id IN (SELECT id FROM lifecycle_transition WHERE lifecycle_id = ?)", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle_state WHERE lifecycle_id = ?", lifecycleId);
        dsl.execute("DELETE FROM lifecycle WHERE id = ?", lifecycleId);
        log.info("Lifecycle {} deleted", lifecycleId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void deleteState(String stateId) {
        int inTransitions = dsl.fetchCount(
            dsl.selectOne().from("lifecycle_transition").where("from_state_id = ?", stateId).or("to_state_id = ?", stateId));
        if (inTransitions > 0) throw new IllegalStateException("State is referenced by " + inTransitions + " transition(s) — delete them first");
        int inVersions = dsl.fetchCount(dsl.selectOne().from("node_version").where("lifecycle_state_id = ?", stateId));
        if (inVersions > 0) throw new IllegalStateException("State is used by " + inVersions + " node version(s)");
        dsl.execute("DELETE FROM node_type_state_action WHERE lifecycle_state_id = ?", stateId);
        dsl.execute("DELETE FROM lifecycle_state_action WHERE lifecycle_state_id = ?", stateId);
        dsl.execute("DELETE FROM attribute_state_rule WHERE lifecycle_state_id = ?", stateId);
        metadataService.removeAll("LIFECYCLE_STATE", stateId);
        dsl.execute("DELETE FROM lifecycle_state WHERE id = ?", stateId);
        log.info("LifecycleState {} deleted", stateId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    @PlmAction("MANAGE_LIFECYCLE")
    @Transactional
    public void deleteTransition(String transitionId) {
        dsl.execute("DELETE FROM action_permission WHERE action_id = 'act-transition' AND transition_id = ?", transitionId);
        dsl.execute("DELETE FROM signature_requirement WHERE lifecycle_transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition_guard WHERE lifecycle_transition_id = ?", transitionId);
        dsl.execute("DELETE FROM node_action_guard WHERE transition_id = ?", transitionId);
        dsl.execute("DELETE FROM lifecycle_transition WHERE id = ?", transitionId);
        log.info("LifecycleTransition {} deleted", transitionId);
        invalidateCache();
        eventPublisher.metamodelChanged(secCtx.currentUser().getUserId());
    }

    private void validateStateOwnership(String lifecycleId, String stateId, String label) {
        String owner = dsl.select().from("lifecycle_state").where("id = ?", stateId)
            .fetchOne("lifecycle_id", String.class);
        if (!lifecycleId.equals(owner)) throw new IllegalArgumentException(label + " does not belong to lifecycle " + lifecycleId);
    }

    /**
     * Self-reference via Spring proxy for cascade calls.
     * Required so that recursive {@link #applyTransition} calls in
     * {@link #executeCascade} are intercepted by AOP (including {@link PlmAction}).
     * {@code @Lazy} breaks the circular dependency.
     */
    @Lazy
    @Autowired
    private LifecycleService self;

    /**
     * Applique une transition de lifecycle.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @PlmAction(
        value = "TRANSITION",
        nodeIdExpr = "#nodeId",
        transitionIdExpr = "#transitionId"
    )
    @Transactional
    public String applyTransition(
        String nodeId,
        String transitionId,
        String userId,
        String txId
    ) {
        Record transition = dsl
            .select()
            .from("lifecycle_transition")
            .where("id = ?", transitionId)
            .fetchOne();
        if (transition == null) throw new IllegalArgumentException(
            "Transition not found: " + transitionId
        );

        String fromStateId = transition.get("from_state_id", String.class);
        String toStateId = transition.get("to_state_id", String.class);
        String guardExpr = transition.get("guard_expr", String.class);
        String actionType = transition.get("action_type", String.class);
        String strategyRaw = transition.get("version_strategy", String.class);
        VersionStrategy strategy =
            strategyRaw != null
                ? VersionStrategy.valueOf(strategyRaw)
                : VersionStrategy.NONE;

        // Vérifier l'état courant (version publique)
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) throw new IllegalStateException(
            "Node has no version: " + nodeId
        );
        String currentStateId = current.get("lifecycle_state_id", String.class);
        if (
            !fromStateId.equals(currentStateId)
        ) throw new IllegalStateException(
            "Node is not in state " +
                fromStateId +
                " (is: " +
                currentStateId +
                ")"
        );

        // Vérifier permission transition
        // (délégué à permissionService dans NodeController — ici on fait confiance à l'appelant)

        // Evaluate guards via GuardService — resolves action_guard + node_action_guard
        String nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId).fetchOne(DSL.field("node_type_id"), String.class);
        String actionId = dsl.select(DSL.field("id")).from("action")
            .where("action_code = 'TRANSITION'")
            .fetchOne(DSL.field("id"), String.class);

        if (actionId != null && nodeTypeId != null) {
            boolean isAdmin = secCtx.currentUser().isAdmin();
            ActionGuardContext gCtx = new ActionGuardContext(nodeId, nodeTypeId, currentStateId,
                "TRANSITION", transitionId, false, false,
                secCtx.currentUser().getUserId(), Map.of());
            GuardEvaluation eval = actionGuardService.evaluate(actionId, nodeTypeId, transitionId, isAdmin, gCtx);
            if (!eval.passed()) {
                List<String> messages = eval.violations().stream()
                    .map(GuardViolation::message).toList();
                throw new GuardException(
                    "Transition blocked:\n" + messages.stream()
                        .map(s -> "  • " + s)
                        .collect(Collectors.joining("\n")));
            }
        }

        // Créer la version LIFECYCLE avec la stratégie de numérotation de la transition
        String versionId = versionService.createVersion(
            nodeId,
            userId,
            txId,
            ChangeType.LIFECYCLE,
            strategy,
            toStateId,
            Collections.emptyMap(),
            "Lifecycle transition: " + fromStateId + " → " + toStateId
        );

        // Build context for state actions
        Record versionRec = dsl.fetchOne(
            "SELECT revision, iteration FROM node_version WHERE id = ?", versionId);
        String revision = versionRec != null ? versionRec.get("revision", String.class) : "";
        int iteration = versionRec != null ? versionRec.get("iteration", Integer.class) : 0;

        StateActionContext saCtx = new StateActionContext(
            nodeId, nodeTypeId, fromStateId, toStateId, transitionId,
            userId, txId, versionId, revision, iteration, Map.of());

        // Execute ON_EXIT transactional state actions on the source state
        stateActionService.executeTransactionalActions(
            fromStateId, nodeTypeId, StateActionTrigger.ON_EXIT, saCtx);

        // Execute ON_ENTER transactional state actions on the target state
        // (e.g. collapse_history when entering Released)
        stateActionService.executeTransactionalActions(
            toStateId, nodeTypeId, StateActionTrigger.ON_ENTER, saCtx);

        // Acquiert le lock (conflit → exception + rollback) et écrit locked_by / locked_at.
        lockService.tryLock(nodeId, userId);

        // Cascade data-driven : consulte link_type_cascade pour la transition parente
        executeCascade(nodeId, transitionId, userId, txId);

        // Exécuter les actions supplémentaires (REQUIRE_SIGNATURE…)
        if (
            actionType != null &&
            !"NONE".equals(actionType) &&
            !"CASCADE_FROZEN".equals(actionType)
        ) {
            executeAction(actionType, nodeId, userId, txId);
        }

        // Collect and register POST_COMMIT state actions
        List<Runnable> postActions = new ArrayList<>();
        postActions.addAll(stateActionService.collectPostCommitActions(
            fromStateId, nodeTypeId, StateActionTrigger.ON_EXIT, saCtx));
        postActions.addAll(stateActionService.collectPostCommitActions(
            toStateId, nodeTypeId, StateActionTrigger.ON_ENTER, saCtx));
        if (!postActions.isEmpty()) {
            TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override public void afterCommit() {
                        postActions.forEach(Runnable::run);
                    }
                });
        }

        eventPublisher.stateChanged(nodeId, fromStateId, toStateId, userId);
        log.info(
            "Transition: node={} {}→{} tx={} user={}",
            nodeId,
            fromStateId,
            toStateId,
            txId,
            userId
        );
        return versionId;
    }

    public List<Record> getAvailableTransitions(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return Collections.emptyList();
        return dsl
            .select()
            .from("lifecycle_transition")
            .where(
                "from_state_id = ?",
                current.get("lifecycle_state_id", String.class)
            )
            .fetch();
    }

    // ================================================================
    // Guards
    // ================================================================

    /**
     * Evaluates all guards for a transition via GuardService.
     * Kept as a convenience method for callers that don't have the full context.
     */
    public List<String> evaluateAllGuards(String nodeId, String transitionId) {
        String nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId).fetchOne(DSL.field("node_type_id"), String.class);
        if (nodeTypeId == null) return List.of();

        Record current = versionService.getCurrentVersion(nodeId);
        String currentStateId = current != null ? current.get("lifecycle_state_id", String.class) : null;

        boolean isAdmin = secCtx.currentUser().isAdmin();
        ActionGuardContext gCtx = new ActionGuardContext(nodeId, nodeTypeId, currentStateId,
            "TRANSITION", transitionId, false, false,
            secCtx.currentUser().getUserId(), Map.of());
        GuardEvaluation eval = actionGuardService.evaluate("act-transition", nodeTypeId, transitionId, isAdmin, gCtx);
        return eval.violations().stream().map(GuardViolation::message).toList();
    }

    // ================================================================
    // Actions
    // ================================================================

    private void executeAction(
        String actionType,
        String nodeId,
        String userId,
        String txId
    ) {
        log.warn("Unknown or unhandled action type: {}", actionType);
    }

    /**
     * Data-driven cascade: for each outgoing link that has a cascade rule whose
     * parent_transition_id matches the transition just fired on the parent node,
     * fire the configured child transition on eligible child nodes.
     * No-op when no rules are defined for this transition.
     */
    private void executeCascade(
        String nodeId,
        String parentTransitionId,
        String userId,
        String txId
    ) {
        // Find all cascade rules triggered by the parent firing parentTransitionId.
        // child_from_state_id scopes each rule: only children currently in that state
        // are eligible. Children in other states (e.g. Released) are silently skipped.
        // We join child_transition to obtain to_state_id for the diamond guard.
        var rules = dsl
            .select(
                DSL.field("nl.target_node_id").as("child_id"),
                DSL.field("ltc.child_from_state_id").as("child_from_state_id"),
                DSL.field("ltc.child_transition_id").as("child_transition_id"),
                DSL.field("lt.to_state_id").as("to_state_id")
            )
            .from("node_version_link nl")
            .join("link_type_cascade ltc")
            .on("ltc.link_type_id = nl.link_type_id")
            .join("lifecycle_transition lt")
            .on("lt.id = ltc.child_transition_id")
            .join("node_version nv_src")
            .on("nv_src.id = nl.source_node_version_id")
            .where("nv_src.node_id = ?", nodeId)
            .and("ltc.parent_transition_id = ?", parentTransitionId)
            .and("nl.pinned_version_id IS NULL") // VERSION_TO_MASTER links only
            .fetch();

        List<String> errors = new ArrayList<>();

        for (Record rule : rules) {
            String childId = rule.get("child_id", String.class);
            String childFromStateId = rule.get(
                "child_from_state_id",
                String.class
            );
            String childTransitionId = rule.get(
                "child_transition_id",
                String.class
            );
            String toStateId = rule.get("to_state_id", String.class);

            // Idempotency guard: if the child already has an OPEN version in this
            // transaction that is already in the target state, the cascade was applied
            // via another branch (diamond hierarchy). Skip to avoid a duplicate
            // LIFECYCLE version with an identical fingerprint causing a false no-op error.
            Record openInTx = versionService.getCurrentVersionForTx(
                childId,
                txId
            );
            if (
                openInTx != null &&
                txId.equals(openInTx.get("tx_id", String.class)) &&
                toStateId.equals(
                    openInTx.get("lifecycle_state_id", String.class)
                )
            ) {
                log.debug(
                    "Cascade: child {} already at state {} in tx {} — skipping (diamond)",
                    childId,
                    toStateId,
                    txId
                );
                continue;
            }

            // Resolve the child's current committed state
            Record childCurrent = versionService.getCurrentVersion(childId);
            if (childCurrent == null) {
                log.warn(
                    "Cascade: child node {} has no version, skipping",
                    childId
                );
                continue;
            }
            String childCurrentStateId = childCurrent.get(
                "lifecycle_state_id",
                String.class
            );

            // Rule scope check: this cascade rule only applies when the child is in
            // child_from_state_id. Children in any other state (e.g. Released, already
            // Frozen) are silently skipped — the rule simply doesn't concern them.
            if (!childFromStateId.equals(childCurrentStateId)) {
                log.debug(
                    "Cascade: child {} is in state {} (rule expects {}) — skipping",
                    childId,
                    childCurrentStateId,
                    childFromStateId
                );
                continue;
            }

            // Delegate to applyTransition using the exact transition configured in the rule.
            // Guards, versioning strategy, actions and recursive cascade are all handled inside.
            // Catch and flatten errors so the user gets a complete picture of what's blocking.
            String childLabel = resolveLabel(childId);
            try {
                self.applyTransition(childId, childTransitionId, userId, txId);
            } catch (CascadeBlockedException cbe) {
                // Flatten nested cascade errors from sub-children
                errors.addAll(cbe.getBlockedNodes());
            } catch (Exception e) {
                errors.add("'" + childLabel + "': " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            throw new CascadeBlockedException(errors);
        }
    }

    private String resolveLabel(String nodeId) {
        String logicalId = dsl
            .select()
            .from("node")
            .where("id = ?", nodeId)
            .fetchOne("logical_id", String.class);
        return logicalId != null ? logicalId : nodeId;
    }

    public static class GuardException
        extends com.plm.domain.exception.PlmFunctionalException
    {

        public GuardException(String msg) {
            super(msg, 422);
        }
    }

    public static class CascadeBlockedException
        extends com.plm.domain.exception.PlmFunctionalException
    {

        private final List<String> blockedNodes;

        public CascadeBlockedException(List<String> blockedNodes) {
            super(
                "Cascade blocked — the following nodes cannot be transitioned:\n" +
                    blockedNodes
                        .stream()
                        .map(s -> "  • " + s)
                        .collect(java.util.stream.Collectors.joining("\n")),
                422
            );
            this.blockedNodes = List.copyOf(blockedNodes);
        }

        public List<String> getBlockedNodes() {
            return blockedNodes;
        }
    }
}
