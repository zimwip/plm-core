package com.plm.node.lifecycle.internal;
import com.plm.node.version.internal.VersionService;
import com.plm.node.transaction.internal.LockService;

import com.plm.shared.model.Enums.ChangeType;
import com.plm.shared.model.Enums.VersionStrategy;
import com.plm.node.lifecycle.internal.stateaction.StateActionContext;
import com.plm.node.lifecycle.internal.stateaction.StateActionService;
import com.plm.node.lifecycle.internal.stateaction.StateActionTrigger;
import com.plm.shared.event.PlmEventPublisher;
import com.plm.shared.action.PlmAction;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.config.dto.LinkTypeCascadeConfig;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
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
    private final ConfigCache             configCache;
    private final VersionService          versionService;
    private final LockService             lockService;
    private final PlmEventPublisher       eventPublisher;
    private final StateActionService      stateActionService;

    // ── In-memory lifecycle cache (states + transitions) ────────────
    // Lazy-built, invalidated via invalidateCache().

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
        Map<String, CachedTransition> transitions = new HashMap<>();
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.states() != null) {
                for (LifecycleStateConfig s : lc.states()) {
                    states.put(s.id(), new CachedState(s.id(), s.name(), s.color(),
                        s.lifecycleId(), s.isInitial()));
                }
            }
            if (lc.transitions() != null) {
                for (LifecycleTransitionConfig t : lc.transitions()) {
                    transitions.put(t.id(), new CachedTransition(t.id(), t.name(),
                        t.lifecycleId(), t.fromStateId(), t.toStateId(),
                        t.actionType(), t.versionStrategy()));
                }
            }
        }
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
     * Guards (action + lifecycle) are evaluated by PlmActionAspect via ActionGuardService
     * before this method proceeds — including TransitionLifecycleGuard bridge.
     *
     * @param txId  transaction PLM ouverte — OBLIGATOIRE
     */
    @PlmAction(
        value = "transition",
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
        return applyTransitionInternal(nodeId, transitionId, userId, txId);
    }

    /**
     * Internal transition logic — no guard evaluation, no @PlmAction.
     * Called by the public guarded version.
     */
    String applyTransitionInternal(
        String nodeId,
        String transitionId,
        String userId,
        String txId
    ) {
        CachedTransition transition = getCachedTransition(transitionId);
        if (transition == null) throw new IllegalArgumentException(
            "Transition not found: " + transitionId
        );

        String fromStateId = transition.fromStateId();
        String toStateId = transition.toStateId();
        String actionType = transition.actionType();
        VersionStrategy strategy =
            transition.versionStrategy() != null
                ? VersionStrategy.valueOf(transition.versionStrategy())
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

        String nodeTypeId = dsl.select(DSL.field("node_type_id")).from("node")
            .where("id = ?", nodeId).fetchOne(DSL.field("node_type_id"), String.class);

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

        // Cascade data-driven : consulte LinkTypeCascadeConfig (ConfigCache) pour la transition parente
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

    public List<CachedTransition> getAvailableTransitions(String nodeId) {
        Record current = versionService.getCurrentVersion(nodeId);
        if (current == null) return Collections.emptyList();
        String currentStateId = current.get("lifecycle_state_id", String.class);
        return getSnapshot().transitionsById.values().stream()
            .filter(t -> currentStateId.equals(t.fromStateId()))
            .toList();
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
        // Link type cascade and transition info resolved from ConfigCache (no DB tables).

        // 1. Get all SELF V2M links from this node (V2M = key without '@version' suffix).
        //    Cross-source links never participate in lifecycle cascade.
        var links = dsl.fetch("""
            SELECT n.id AS child_id, nl.link_type_id
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            JOIN node n ON n.logical_id = CASE
                    WHEN POSITION('@' IN nl.target_key) > 0
                        THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1)
                    ELSE nl.target_key
                  END
                  AND n.node_type_id = nl.target_type
            WHERE nv_src.node_id = ?
              AND nl.target_source_id = 'SELF'
              AND POSITION('@' IN nl.target_key) = 0
            """, nodeId);

        // 2. Build cascade rule records by matching link_type cascades from ConfigCache
        record CascadeRule(String childId, String childFromStateId,
                           String childTransitionId, String toStateId) {}
        List<CascadeRule> rules = new ArrayList<>();
        for (Record link : links) {
            String linkTypeId = link.get("link_type_id", String.class);
            String childId = link.get("child_id", String.class);
            var ltOpt = configCache.getLinkType(linkTypeId);
            if (ltOpt.isEmpty() || ltOpt.get().cascades() == null) continue;
            for (LinkTypeCascadeConfig cascade : ltOpt.get().cascades()) {
                if (!parentTransitionId.equals(cascade.parentTransitionId())) continue;
                // Resolve to_state_id from the child transition in ConfigCache
                String toStateId = resolveTransitionToState(cascade.childTransitionId());
                rules.add(new CascadeRule(childId, cascade.childFromStateId(),
                    cascade.childTransitionId(), toStateId));
            }
        }

        List<String> errors = new ArrayList<>();

        for (CascadeRule rule : rules) {
            String childId = rule.childId();
            String childFromStateId = rule.childFromStateId();
            String childTransitionId = rule.childTransitionId();
            String toStateId = rule.toStateId();

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

    /** Resolves the to_state_id of a transition from ConfigCache. */
    private String resolveTransitionToState(String transitionId) {
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.transitions() == null) continue;
            for (LifecycleTransitionConfig t : lc.transitions()) {
                if (transitionId.equals(t.id())) return t.toStateId();
            }
        }
        return null;
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
        extends com.plm.shared.exception.PlmFunctionalException
    {

        public GuardException(String msg) {
            super(msg, 422);
        }
    }

    public static class CascadeBlockedException
        extends com.plm.shared.exception.PlmFunctionalException
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
