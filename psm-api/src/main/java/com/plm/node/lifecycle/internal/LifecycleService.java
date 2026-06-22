package com.plm.node.lifecycle.internal;
import com.plm.node.version.internal.VersionService;
import com.plm.node.transaction.internal.LockService;

import com.plm.shared.model.Enums.ChangeType;
import com.plm.shared.model.Enums.VersionStrategy;
import com.plm.node.lifecycle.internal.stateaction.StateActionContext;
import com.plm.node.lifecycle.internal.stateaction.StateActionService;
import com.plm.node.lifecycle.internal.stateaction.StateActionTrigger;
import com.plm.shared.event.PlmEventPublisher;
import com.plm.platform.action.PlmAction;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleStateConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.config.dto.LinkTypeConfig;
import com.plm.platform.config.dto.LinkTypeCascadeConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    @PlmAction("transition")
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
            fromStateId, null, StateActionTrigger.ON_EXIT, saCtx);

        // Execute ON_ENTER transactional state actions on the target state
        stateActionService.executeTransactionalActions(
            toStateId, null, StateActionTrigger.ON_ENTER, saCtx);

        // Acquiert le lock (conflit → exception + rollback) et écrit locked_by / locked_at.
        lockService.tryLock(nodeId, userId);

        // Cascade is driven entirely by link_type_cascade rules (ConfigCache), NOT by the
        // transition's action_type column. The whole subtree was validated up-front in
        // applyTransition; executeCascade performs the writes.
        executeCascade(nodeId, transitionId, userId, txId);

        // Collect and register POST_COMMIT state actions
        List<Runnable> postActions = new ArrayList<>();
        postActions.addAll(stateActionService.collectPostCommitActions(
            fromStateId, null, StateActionTrigger.ON_EXIT, saCtx));
        postActions.addAll(stateActionService.collectPostCommitActions(
            toStateId, null, StateActionTrigger.ON_ENTER, saCtx));
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

    /** A resolved cascade rule: fire {@code childTransitionId} on {@code childId} when in {@code childFromStateId}. */
    private record CascadeRule(String childId, String childFromStateId,
                              String childTransitionId, String toStateId) {}

    /**
     * Resolves the cascade rules triggered when {@code parentTransitionId} fires on {@code nodeId}.
     * For each outgoing SELF V2M link (key without an {@code @version} suffix — cross-source links
     * never cascade), matches {@link LinkTypeCascadeConfig} entries from ConfigCache whose
     * parent_transition_id equals the firing transition, resolving the child node from the link's
     * target key.
     */
    private List<CascadeRule> resolveCascadeRules(String nodeId, String parentTransitionId) {
        var links = dsl.fetch("""
            SELECT nl.link_type_id, nl.target_type,
                   CASE WHEN POSITION('@' IN nl.target_key) > 0
                        THEN SUBSTR(nl.target_key, 1, POSITION('@' IN nl.target_key) - 1)
                        ELSE nl.target_key END AS target_logical
            FROM node_version_link nl
            JOIN node_version nv_src ON nv_src.id = nl.source_node_version_id
            WHERE nv_src.node_id = ?
              AND nl.target_source_id = 'SELF'
              AND POSITION('@' IN nl.target_key) = 0
            """, nodeId);

        List<CascadeRule> rules = new ArrayList<>();
        for (Record link : links) {
            String linkTypeId = link.get("link_type_id", String.class);
            var ltOpt = configCache.getLinkType(linkTypeId);
            if (ltOpt.isEmpty() || ltOpt.get().cascades() == null) continue;

            List<LinkTypeCascadeConfig> matching = ltOpt.get().cascades().stream()
                .filter(c -> parentTransitionId.equals(c.parentTransitionId()))
                .toList();
            if (matching.isEmpty()) continue;

            String childId = resolveChildNodeId(
                link.get("target_logical", String.class), link.get("target_type", String.class));
            if (childId == null) continue;

            for (LinkTypeCascadeConfig cascade : matching) {
                rules.add(new CascadeRule(childId, cascade.childFromStateId(),
                    cascade.childTransitionId(), resolveTransitionToState(cascade.childTransitionId())));
            }
        }
        return rules;
    }

    /**
     * Resolves a link target (logical id) to a node id, accepting the link's declared target type OR
     * any subtype of it. A composed_of link declared to target {@code nt-part} can legitimately point
     * to an {@code nt-assembly} sub-assembly (nt-assembly inherits nt-part); the link row stores the
     * declared type, so an exact type match would silently drop sub-assemblies from the cascade.
     */
    private String resolveChildNodeId(String logicalId, String declaredTargetType) {
        var rows = dsl.select(DSL.field("id"), DSL.field("node_type_id"))
            .from("node").where("logical_id = ?", logicalId).fetch();
        if (rows.isEmpty()) return null;
        Set<String> accepted = acceptedChildTypes(declaredTargetType);
        String fallback = null;
        for (Record r : rows) {
            String nt = r.get("node_type_id", String.class);
            String id = r.get("id", String.class);
            if (declaredTargetType.equals(nt)) return id;   // exact declared type wins
            if (accepted.contains(nt)) fallback = id;        // accept subtype
        }
        return fallback;
    }

    /** The target type plus every node type that inherits from it (via ancestorChain in ConfigCache). */
    private Set<String> acceptedChildTypes(String targetType) {
        Set<String> accepted = new HashSet<>();
        accepted.add(targetType);
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            if (nt.ancestorChain() != null && nt.ancestorChain().contains(targetType)) {
                accepted.add(nt.id());
            }
        }
        return accepted;
    }

    /**
     * Cascade: for each in-scope composed-of child, invoke the SAME standard transition code
     * ({@link #applyTransition}) so the child's guards (incl. {@code not_checked_out}), lock,
     * versioning and its own nested cascade all run normally — no parallel validation. Child failures
     * are aggregated; if any child cannot transition, the whole transition aborts via
     * {@link CascadeBlockedException} and the (ISOLATED) transaction rolls back.
     */
    private void executeCascade(
        String nodeId,
        String parentTransitionId,
        String userId,
        String txId
    ) {
        List<String> errors = new ArrayList<>();

        for (CascadeRule rule : resolveCascadeRules(nodeId, parentTransitionId)) {
            String childId = rule.childId();

            // Diamond: child already transitioned to the target state in THIS tx (shared sub-assembly).
            Record openInTx = versionService.getCurrentVersionForTx(childId, txId);
            if (openInTx != null &&
                txId.equals(openInTx.get("tx_id", String.class)) &&
                rule.toStateId().equals(openInTx.get("lifecycle_state_id", String.class))) {
                log.debug("Cascade: child {} already at state {} in tx {} — skipping (diamond)",
                    childId, rule.toStateId(), txId);
                continue;
            }

            // Cascade scope: a child participates if its committed state is the rule's from-state, OR
            // it is checked out (open version) — in which case its own transition must still run so the
            // not_checked_out guard can block it. A child settled in another state is out of scope.
            Record committed = versionService.getCurrentVersion(childId);
            boolean inFromState = committed != null
                && rule.childFromStateId().equals(committed.get("lifecycle_state_id", String.class));
            boolean checkedOut = versionService.hasOpenVersion(childId);
            if (!inFromState && !checkedOut) continue;

            try {
                self.applyTransition(childId, rule.childTransitionId(), userId, txId);
            } catch (CascadeBlockedException e) {
                errors.addAll(e.getBlockedNodes());
            } catch (Exception e) {
                errors.add("'" + resolveLabel(childId) + "': " + e.getMessage());
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
        extends com.plm.platform.exception.PlmFunctionalException
    {

        public GuardException(String msg) {
            super(msg, 422);
        }
    }

    public static class CascadeBlockedException
        extends com.plm.platform.exception.PlmFunctionalException
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
