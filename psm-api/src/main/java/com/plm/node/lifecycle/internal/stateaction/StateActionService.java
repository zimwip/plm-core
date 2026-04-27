package com.plm.node.lifecycle.internal.stateaction;

import com.plm.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.platform.config.dto.StateActionConfig;
import lombok.extern.slf4j.Slf4j;
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

    private final ConfigCache        configCache;
    private final ApplicationContext appCtx;

    private AlgorithmRegistry algorithmRegistry() {
        return AlgorithmRegistry.getInstance(appCtx);
    }

    /** Tier 1: lifecycle-state-level actions, keyed by (stateId, trigger). */
    private Map<StateKey, List<ResolvedStateAction>> stateActionsCache = Map.of();
    /** Tier 2: per-node-type overrides, keyed by (nodeTypeId, stateId, trigger). */
    private Map<NodeTypeStateKey, List<ResolvedStateAction>> nodeTypeActionsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public StateActionService(ConfigCache configCache, ApplicationContext appCtx) {
        this.configCache = configCache;
        this.appCtx = appCtx;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
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

        // Build instanceId → algorithm code lookup
        Map<String, String> instanceToCode = new HashMap<>();
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            if (alg.instances() != null) {
                for (AlgorithmInstanceConfig inst : alg.instances()) {
                    instanceToCode.put(inst.id(), alg.code());
                }
            }
        }

        // Tier 1: lifecycle state actions (nodeTypeId == null)
        for (StateActionConfig sa : configCache.getSnapshot() != null
                ? configCache.getSnapshot().stateActions() != null
                    ? configCache.getSnapshot().stateActions() : List.<StateActionConfig>of()
                : List.<StateActionConfig>of()) {

            if (sa.nodeTypeId() != null) continue; // tier 2 handled below

            StateActionTrigger trigger = StateActionTrigger.valueOf(sa.trigger());
            StateKey key = new StateKey(sa.lifecycleStateId(), trigger);
            String code = instanceToCode.get(sa.algorithmInstanceId());
            if (code == null) {
                log.warn("State action instance '{}' has no algorithm mapping — skipping", sa.algorithmInstanceId());
                continue;
            }
            ResolvedStateAction rsa = resolveFromConfig(sa, code, "ADD");
            if (rsa != null) {
                newStateActions.computeIfAbsent(key, k -> new ArrayList<>()).add(rsa);
            }
        }

        // Tier 2: node-type state actions (nodeTypeId != null)
        for (StateActionConfig sa : configCache.getSnapshot() != null
                ? configCache.getSnapshot().stateActions() != null
                    ? configCache.getSnapshot().stateActions() : List.<StateActionConfig>of()
                : List.<StateActionConfig>of()) {

            if (sa.nodeTypeId() == null) continue; // tier 1 handled above

            StateActionTrigger trigger = StateActionTrigger.valueOf(sa.trigger());
            NodeTypeStateKey key = new NodeTypeStateKey(sa.nodeTypeId(), sa.lifecycleStateId(), trigger);
            String code = instanceToCode.get(sa.algorithmInstanceId());
            if (code == null) {
                log.warn("State action instance '{}' has no algorithm mapping — skipping", sa.algorithmInstanceId());
                continue;
            }
            String overrideAction = sa.overrideAction();
            ResolvedStateAction rsa = resolveFromConfig(sa, code, overrideAction);
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

    private ResolvedStateAction resolveFromConfig(StateActionConfig sa, String algorithmCode, String overrideAction) {
        StateActionMode mode = StateActionMode.valueOf(sa.executionMode());
        int displayOrder = sa.displayOrder();

        if (!algorithmRegistry().hasBean(algorithmCode)) {
            log.warn("State action algorithm '{}' has no Spring bean — skipping", algorithmCode);
            return null;
        }

        StateAction bean;
        try {
            bean = algorithmRegistry().resolve(algorithmCode, StateAction.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement StateAction — skipping (wrong attachment?)", algorithmCode);
            return null;
        }

        // Params from instance config
        Map<String, String> params = configCache.getInstance(sa.algorithmInstanceId())
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedStateAction(sa.algorithmInstanceId(), bean, mode, displayOrder, overrideAction, Map.copyOf(params));
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
