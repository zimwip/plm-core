package com.plm.action.guard;

import com.plm.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.ActionGuardConfig;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.platform.config.dto.NodeActionGuardConfig;
import com.plm.shared.exception.GuardViolationException;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardEvaluation;
import com.plm.shared.guard.GuardViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Evaluates guards for actions. Maintains an in-memory cache of the guard
 * attachment graph (action -> guards, (node_type, action, transition) -> guards)
 * loaded at startup from {@link ConfigCache}.
 *
 * Cache is invalidated via {@link #evictCache()} when admin changes guard config.
 */
@Slf4j
@Service
public class ActionGuardService {

    private final ConfigCache         configCache;
    private final ApplicationContext  appCtx;

    /** Action-level guards (global across node types), keyed by actionId. */
    private Map<String, List<ResolvedGuard>> actionGuardsCache = Map.of();
    /** Per-node-type guards, keyed by {@link NodeActionKey}. */
    private Map<NodeActionKey, List<ResolvedGuard>> nodeActionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    /** Reverse index: algorithm id → algorithm code (rebuilt on each cache rebuild). */
    private Map<String, String> algorithmCodeById = Map.of();

    public ActionGuardService(ConfigCache configCache, ApplicationContext appCtx) {
        this.configCache = configCache;
        this.appCtx = appCtx;
    }

    private AlgorithmRegistry algorithmRegistry() {
        return AlgorithmRegistry.getInstance(appCtx);
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    /**
     * Evaluates all effective guards for the given action context.
     * Uses cached guard attachments -- no DB query.
     */
    public GuardEvaluation evaluate(String actionId, String nodeTypeId,
                                    String transitionId, boolean isAdmin,
                                    ActionGuardContext ctx) {
        List<ResolvedGuard> effective = resolveEffectiveGuards(actionId, nodeTypeId, transitionId);
        if (effective.isEmpty()) return GuardEvaluation.PASSED;

        boolean hidden = false;
        List<GuardViolation> blockViolations = new ArrayList<>();

        for (ResolvedGuard rg : effective) {
            // Admin bypasses BLOCK guards (permission), not HIDE guards (visibility/structural)
            if (isAdmin && rg.effect() != GuardEffect.HIDE) continue;

            List<GuardViolation> rawViolations = rg.bean().evaluate(ctx);
            if (rawViolations.isEmpty()) continue;

            if (rg.effect() == GuardEffect.HIDE) {
                hidden = true;
                break;
            }

            for (GuardViolation v : rawViolations) {
                blockViolations.add(new GuardViolation(
                    v.guardCode(), v.message(), rg.effect(), v.fieldRef(), v.details()));
            }
        }

        return new GuardEvaluation(hidden, blockViolations);
    }

    /**
     * Asserts BLOCK guards pass at execution time. HIDE guards are UI-only and
     * are NOT enforced here -- they control action visibility, not executability.
     */
    public void assertGuards(String actionId, String nodeTypeId,
                             String transitionId, boolean isAdmin,
                             ActionGuardContext ctx) {
        if (isAdmin) return;

        List<ResolvedGuard> effective = resolveEffectiveGuards(actionId, nodeTypeId, transitionId);

        List<String> messages = new ArrayList<>();
        for (ResolvedGuard rg : effective) {
            if (rg.effect() == GuardEffect.HIDE) continue;

            List<GuardViolation> violations = rg.bean().evaluate(ctx);
            for (GuardViolation v : violations) {
                messages.add(v.message());
            }
        }

        if (!messages.isEmpty()) {
            throw new GuardViolationException(messages);
        }
    }

    /**
     * Split evaluation for managed (managee) actions.
     * HIDE guards resolved from hideActionId (the manager).
     * BLOCK guards resolved from blockActionId (the managee itself).
     */
    public GuardEvaluation evaluate(String hideActionId, String blockActionId,
                                    String nodeTypeId, String transitionId,
                                    boolean isAdmin, ActionGuardContext ctx) {
        // Evaluate HIDE guards from manager
        List<ResolvedGuard> hideGuards = resolveEffectiveGuards(hideActionId, nodeTypeId, transitionId)
            .stream().filter(rg -> rg.effect() == GuardEffect.HIDE).toList();

        for (ResolvedGuard rg : hideGuards) {
            List<GuardViolation> rawViolations = rg.bean().evaluate(ctx);
            if (!rawViolations.isEmpty()) {
                return new GuardEvaluation(true, List.of());
            }
        }

        // Evaluate BLOCK guards from managee (admin bypasses)
        if (isAdmin) return GuardEvaluation.PASSED;

        List<ResolvedGuard> blockGuards = resolveEffectiveGuards(blockActionId, nodeTypeId, transitionId)
            .stream().filter(rg -> rg.effect() == GuardEffect.BLOCK).toList();

        List<GuardViolation> blockViolations = new ArrayList<>();
        for (ResolvedGuard rg : blockGuards) {
            List<GuardViolation> rawViolations = rg.bean().evaluate(ctx);
            for (GuardViolation v : rawViolations) {
                blockViolations.add(new GuardViolation(
                    v.guardCode(), v.message(), rg.effect(), v.fieldRef(), v.details()));
            }
        }

        return new GuardEvaluation(false, blockViolations);
    }

    /**
     * Split assertion for managed actions at execution time.
     * Only BLOCK guards from blockActionId are enforced.
     */
    public void assertGuards(String hideActionId, String blockActionId,
                             String nodeTypeId, String transitionId,
                             boolean isAdmin, ActionGuardContext ctx) {
        if (isAdmin) return;

        List<ResolvedGuard> blockGuards = resolveEffectiveGuards(blockActionId, nodeTypeId, transitionId)
            .stream().filter(rg -> rg.effect() == GuardEffect.BLOCK).toList();

        List<String> messages = new ArrayList<>();
        for (ResolvedGuard rg : blockGuards) {
            List<GuardViolation> violations = rg.bean().evaluate(ctx);
            for (GuardViolation v : violations) {
                messages.add(v.message());
            }
        }

        if (!messages.isEmpty()) {
            throw new GuardViolationException(messages);
        }
    }

    public void evictCache() {
        rebuildCache();
        log.info("Action guard cache evicted and rebuilt");
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<String, List<ResolvedGuard>> newActionGuards = new HashMap<>();
        Map<NodeActionKey, List<ResolvedGuard>> newNodeActionGuards = new HashMap<>();

        // Build reverse index: algorithm id → code
        Map<String, String> codeById = new HashMap<>();
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            codeById.put(alg.id(), alg.code());
        }
        algorithmCodeById = Map.copyOf(codeById);

        // Action-level guards (from ActionConfig.guards())
        for (var action : configCache.getAllActions()) {
            for (ActionGuardConfig ag : configCache.getActionGuards(action.id())) {
                ResolvedGuard rg = resolveGuardFromConfig(ag.algorithmInstanceId(), ag.effect(), "ADD");
                if (rg != null) {
                    newActionGuards.computeIfAbsent(action.id(), k -> new ArrayList<>()).add(rg);
                }
            }
        }

        // Node-action-level guards (from ConfigSnapshot.nodeActionGuards)
        ConfigCache cache = configCache;
        var snapshot = cache.getSnapshot();
        if (snapshot != null && snapshot.nodeActionGuards() != null) {
            for (NodeActionGuardConfig nag : snapshot.nodeActionGuards()) {
                NodeActionKey key = new NodeActionKey(
                    nag.nodeTypeId(), nag.actionId(), nag.transitionId());
                String overrideAction = nag.overrideAction();
                ResolvedGuard rg = resolveGuardFromConfig(nag.algorithmInstanceId(), nag.effect(), overrideAction);
                if (rg != null) {
                    newNodeActionGuards.computeIfAbsent(key, k -> new ArrayList<>()).add(rg);
                }
            }
        }

        cacheLock.writeLock().lock();
        try {
            actionGuardsCache = Map.copyOf(newActionGuards);
            nodeActionGuardsCache = Map.copyOf(newNodeActionGuards);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Action guard cache loaded: {} action, {} node-action entries",
            newActionGuards.values().stream().mapToInt(List::size).sum(),
            newNodeActionGuards.values().stream().mapToInt(List::size).sum());
    }

    /**
     * Resolves a guard from ConfigCache data (replaces the old JOOQ-based resolveGuardFromRow).
     * Looks up the algorithm code via instanceId → algorithmId → code, then resolves the
     * Spring bean and collects instance parameters.
     */
    private ResolvedGuard resolveGuardFromConfig(String instanceId, String effectStr, String overrideAction) {
        String code = resolveAlgorithmCode(instanceId);
        if (code == null) {
            log.warn("Cannot resolve algorithm code for instance '{}' -- skipping", instanceId);
            return null;
        }

        GuardEffect effect = GuardEffect.valueOf(effectStr);

        if (!algorithmRegistry().hasBean(code)) {
            log.warn("Guard algorithm '{}' has no Spring bean -- skipping", code);
            return null;
        }

        ActionGuard bean;
        try {
            bean = algorithmRegistry().resolve(code, ActionGuard.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement ActionGuard -- skipping (wrong attachment?)", code);
            return null;
        }

        // Instance parameters are already resolved in AlgorithmInstanceConfig
        Map<String, String> params = configCache.getInstance(instanceId)
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedGuard(instanceId, bean, effect, overrideAction, params);
    }

    /**
     * Resolves algorithm code from an instance id:
     * instanceId → AlgorithmInstanceConfig.algorithmId() → AlgorithmConfig.code()
     */
    private String resolveAlgorithmCode(String instanceId) {
        Optional<AlgorithmInstanceConfig> instance = configCache.getInstance(instanceId);
        if (instance.isEmpty()) return null;
        return algorithmCodeById.get(instance.get().algorithmId());
    }

    /**
     * Two-tier merge:
     *   1. action_guard          -- global (per action)
     *   2. node_action_guard     -- per-type override (ADD or DISABLE),
     *      with transition_id IS NULL or matching
     */
    private List<ResolvedGuard> resolveEffectiveGuards(String actionId, String nodeTypeId,
                                                       String transitionId) {
        cacheLock.readLock().lock();
        try {
            List<ResolvedGuard> base = new ArrayList<>(
                actionGuardsCache.getOrDefault(actionId, List.of()));

            if (nodeTypeId == null) return base;

            // Tier 2: per-type overrides
            List<ResolvedGuard> overrides = new ArrayList<>();
            List<ResolvedGuard> exact = nodeActionGuardsCache.get(
                new NodeActionKey(nodeTypeId, actionId, transitionId));
            if (exact != null) overrides.addAll(exact);

            if (transitionId != null) {
                List<ResolvedGuard> allTransitions = nodeActionGuardsCache.get(
                    new NodeActionKey(nodeTypeId, actionId, null));
                if (allTransitions != null) overrides.addAll(allTransitions);
            }

            if (overrides.isEmpty()) return base;

            List<ResolvedGuard> effective = new ArrayList<>(base);
            for (ResolvedGuard override : overrides) {
                if ("DISABLE".equals(override.overrideAction())) {
                    effective.removeIf(g ->
                        g.algorithmInstanceId().equals(override.algorithmInstanceId()));
                } else {
                    effective.add(override);
                }
            }
            return effective;
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    /** Composite cache key: (node_type, action, transition) with null transition allowed. */
    record NodeActionKey(String nodeTypeId, String actionId, String transitionId) {
        @Override public boolean equals(Object o) {
            if (!(o instanceof NodeActionKey k)) return false;
            return Objects.equals(nodeTypeId, k.nodeTypeId)
                && Objects.equals(actionId, k.actionId)
                && Objects.equals(transitionId, k.transitionId);
        }
        @Override public int hashCode() {
            return Objects.hash(nodeTypeId, actionId, transitionId);
        }
    }

    record ResolvedGuard(
        String algorithmInstanceId,
        ActionGuard bean,
        GuardEffect effect,
        String overrideAction,
        Map<String, String> parameters
    ) {}
}
