package com.plm.node.lifecycle.internal.stateaction;

import com.plm.algorithm.AlgorithmRegistry;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Resolves and executes lifecycle state actions.
 *
 * Maintains an in-memory cache of the state action attachment graph
 * (lifecycle_state → actions, (node_type, lifecycle_state) → overrides)
 * loaded at startup. Same pattern as {@link com.plm.shared.guard.GuardService}.
 *
 * Cache is invalidated via {@link #evictCache()} when admin changes config.
 */
@Slf4j
@Service
public class StateActionService {

    private final DSLContext         dsl;
    private final ApplicationContext appCtx;

    private AlgorithmRegistry algorithmRegistry() {
        return AlgorithmRegistry.getInstance(appCtx);
    }

    /** Tier 1: lifecycle-state-level actions, keyed by (stateId, trigger). */
    private Map<StateKey, List<ResolvedStateAction>> stateActionsCache = Map.of();
    /** Tier 2: per-node-type overrides, keyed by (nodeTypeId, stateId, trigger). */
    private Map<NodeTypeStateKey, List<ResolvedStateAction>> nodeTypeActionsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public StateActionService(DSLContext dsl, ApplicationContext appCtx) {
        this.dsl = dsl;
        this.appCtx = appCtx;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadCache() {
        rebuildCache();
    }

    /**
     * Executes all TRANSACTIONAL state actions for the given state and trigger.
     * Any exception propagates — caller's transaction rolls back.
     */
    public void executeTransactionalActions(String stateId, String nodeTypeId,
                                            StateActionTrigger trigger,
                                            StateActionContext ctx) {
        List<ResolvedStateAction> actions = resolveEffectiveActions(stateId, nodeTypeId, trigger);
        for (ResolvedStateAction action : actions) {
            if (action.mode() != StateActionMode.TRANSACTIONAL) continue;
            StateActionContext enriched = ctx.withParameters(action.parameters());
            log.debug("Executing TRANSACTIONAL state action '{}' on state={} trigger={}",
                action.bean().code(), stateId, trigger);
            action.bean().execute(enriched);
        }
    }

    /**
     * Collects POST_COMMIT state actions as Runnables (errors caught inside each).
     * Caller registers these via TransactionSynchronizationManager.
     */
    public List<Runnable> collectPostCommitActions(String stateId, String nodeTypeId,
                                                    StateActionTrigger trigger,
                                                    StateActionContext ctx) {
        List<ResolvedStateAction> actions = resolveEffectiveActions(stateId, nodeTypeId, trigger);
        List<Runnable> deferred = new ArrayList<>();
        for (ResolvedStateAction action : actions) {
            if (action.mode() != StateActionMode.POST_COMMIT) continue;
            StateActionContext enriched = ctx.withParameters(action.parameters());
            String code = action.bean().code();
            deferred.add(() -> {
                try {
                    log.debug("Executing POST_COMMIT state action '{}'", code);
                    action.bean().execute(enriched);
                } catch (Exception e) {
                    log.warn("POST_COMMIT state action '{}' failed (ignored): {}",
                        code, e.getMessage(), e);
                }
            });
        }
        return deferred;
    }

    public void evictCache() {
        rebuildCache();
        log.info("State action cache evicted and rebuilt");
    }

    // ================================================================
    // Resolution
    // ================================================================

    /**
     * Resolves effective state actions for (state, nodeType, trigger) with
     * tier merge and ADD/DISABLE override semantics.
     */
    List<ResolvedStateAction> resolveEffectiveActions(String stateId, String nodeTypeId,
                                                             StateActionTrigger trigger) {
        cacheLock.readLock().lock();
        try {
            StateKey stateKey = new StateKey(stateId, trigger);
            List<ResolvedStateAction> base = new ArrayList<>(
                stateActionsCache.getOrDefault(stateKey, List.of()));

            if (nodeTypeId == null) return base;

            // Tier 2: per-node-type overrides
            NodeTypeStateKey ntKey = new NodeTypeStateKey(nodeTypeId, stateId, trigger);
            List<ResolvedStateAction> overrides = nodeTypeActionsCache.getOrDefault(ntKey, List.of());
            if (overrides.isEmpty()) return base;

            List<ResolvedStateAction> effective = new ArrayList<>(base);
            for (ResolvedStateAction override : overrides) {
                if ("DISABLE".equals(override.overrideAction())) {
                    effective.removeIf(a ->
                        a.algorithmInstanceId().equals(override.algorithmInstanceId()));
                } else {
                    effective.add(override);
                }
            }
            effective.sort((a, b) -> Integer.compare(a.displayOrder(), b.displayOrder()));
            return effective;
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<StateKey, List<ResolvedStateAction>> newStateActions = new HashMap<>();
        Map<NodeTypeStateKey, List<ResolvedStateAction>> newNodeTypeActions = new HashMap<>();

        // Tier 1: lifecycle_state_action
        List<Record> stateActionRows = dsl.fetch("""
            SELECT lsa.lifecycle_state_id, lsa.algorithm_instance_id,
                   lsa.trigger, lsa.execution_mode, lsa.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM lifecycle_state_action lsa
            JOIN algorithm_instance ai ON ai.id = lsa.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            ORDER BY lsa.lifecycle_state_id, lsa.display_order
            """);

        for (Record row : stateActionRows) {
            String stateId = row.get("lifecycle_state_id", String.class);
            StateActionTrigger trigger = StateActionTrigger.valueOf(row.get("trigger", String.class));
            StateKey key = new StateKey(stateId, trigger);
            ResolvedStateAction rsa = resolveFromRow(row, "ADD");
            if (rsa != null) {
                newStateActions.computeIfAbsent(key, k -> new ArrayList<>()).add(rsa);
            }
        }

        // Tier 2: node_type_state_action
        List<Record> nodeTypeRows = dsl.fetch("""
            SELECT ntsa.node_type_id, ntsa.lifecycle_state_id, ntsa.algorithm_instance_id,
                   ntsa.trigger, ntsa.execution_mode, ntsa.override_action, ntsa.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM node_type_state_action ntsa
            JOIN algorithm_instance ai ON ai.id = ntsa.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            ORDER BY ntsa.node_type_id, ntsa.lifecycle_state_id, ntsa.display_order
            """);

        for (Record row : nodeTypeRows) {
            String nodeTypeId = row.get("node_type_id", String.class);
            String stateId = row.get("lifecycle_state_id", String.class);
            StateActionTrigger trigger = StateActionTrigger.valueOf(row.get("trigger", String.class));
            String overrideAction = row.get("override_action", String.class);
            NodeTypeStateKey key = new NodeTypeStateKey(nodeTypeId, stateId, trigger);
            ResolvedStateAction rsa = resolveFromRow(row, overrideAction);
            if (rsa != null) {
                newNodeTypeActions.computeIfAbsent(key, k -> new ArrayList<>()).add(rsa);
            }
        }

        cacheLock.writeLock().lock();
        try {
            stateActionsCache = Map.copyOf(newStateActions);
            nodeTypeActionsCache = Map.copyOf(newNodeTypeActions);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("State action cache loaded: {} state-level, {} node-type-level entries",
            newStateActions.values().stream().mapToInt(List::size).sum(),
            newNodeTypeActions.values().stream().mapToInt(List::size).sum());
    }

    private ResolvedStateAction resolveFromRow(Record row, String overrideAction) {
        String code = row.get("algorithm_code", String.class);
        String instanceId = row.get("algorithm_instance_id", String.class);
        StateActionMode mode = StateActionMode.valueOf(row.get("execution_mode", String.class));
        int displayOrder = row.get("display_order", Integer.class);

        if (!algorithmRegistry().hasBean(code)) {
            log.warn("State action algorithm '{}' has no Spring bean — skipping", code);
            return null;
        }

        StateAction bean;
        try {
            bean = algorithmRegistry().resolve(code, StateAction.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement StateAction — skipping (wrong attachment?)", code);
            return null;
        }

        Map<String, String> params = new HashMap<>();
        dsl.fetch("""
            SELECT ap.param_name, aipv.value
            FROM algorithm_instance_param_value aipv
            JOIN algorithm_parameter ap ON ap.id = aipv.algorithm_parameter_id
            WHERE aipv.algorithm_instance_id = ?
            """, instanceId)
            .forEach(r -> params.put(r.get("param_name", String.class), r.get("value", String.class)));

        return new ResolvedStateAction(instanceId, bean, mode, displayOrder, overrideAction, Map.copyOf(params));
    }

    // ================================================================
    // Records and keys
    // ================================================================

    record ResolvedStateAction(
        String algorithmInstanceId,
        StateAction bean,
        StateActionMode mode,
        int displayOrder,
        String overrideAction,
        Map<String, String> parameters
    ) {}

    record StateKey(String stateId, StateActionTrigger trigger) {
        @Override public boolean equals(Object o) {
            if (!(o instanceof StateKey k)) return false;
            return Objects.equals(stateId, k.stateId) && trigger == k.trigger;
        }
        @Override public int hashCode() { return Objects.hash(stateId, trigger); }
    }

    record NodeTypeStateKey(String nodeTypeId, String stateId, StateActionTrigger trigger) {
        @Override public boolean equals(Object o) {
            if (!(o instanceof NodeTypeStateKey k)) return false;
            return Objects.equals(nodeTypeId, k.nodeTypeId)
                && Objects.equals(stateId, k.stateId)
                && trigger == k.trigger;
        }
        @Override public int hashCode() { return Objects.hash(nodeTypeId, stateId, trigger); }
    }
}
