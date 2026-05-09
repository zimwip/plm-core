package com.plm.action.guard;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.action.guard.ActionGuardContext;
import com.plm.platform.action.guard.ActionGuardPort;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardEvaluation;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.ActionGuardConfig;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.shared.exception.GuardViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
@Service
public class ActionGuardService implements ActionGuardPort {

    private final ConfigCache        configCache;
    private final AlgorithmRegistry  algorithmRegistry;

    /** Action-level guards, keyed by actionId. */
    private Map<String, List<ResolvedGuard>> actionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    /** Reverse index: algorithm id → algorithm code (rebuilt on each cache rebuild). */
    private Map<String, String> algorithmCodeById = Map.of();

    /** Reverse index: action code → action id (for callers that only know the code). */
    private Map<String, String> actionIdByCode = Map.of();

    public ActionGuardService(ConfigCache configCache, @Lazy AlgorithmRegistry algorithmRegistry) {
        this.configCache        = configCache;
        this.algorithmRegistry  = algorithmRegistry;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    // ================================================================
    // ActionGuardPort — interface methods
    // ================================================================

    @Override
    public GuardEvaluation evaluate(String actionCode, String actionId,
                                    String nodeTypeId, String transitionId,
                                    boolean isAdmin, ActionGuardContext ctx) {
        String effectiveId = actionId != null ? actionId : resolveActionId(actionCode);
        return evaluate(effectiveId, nodeTypeId, transitionId, isAdmin, ctx);
    }

    @Override
    public void assertGuards(String actionCode, String actionId,
                             String nodeTypeId, String transitionId,
                             boolean isAdmin, ActionGuardContext ctx) {
        String effectiveId = actionId != null ? actionId : resolveActionId(actionCode);
        assertGuards(effectiveId, nodeTypeId, transitionId, isAdmin, ctx);
    }

    private String resolveActionId(String actionCode) {
        cacheLock.readLock().lock();
        try {
            return actionIdByCode.get(actionCode);
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    // ================================================================
    // Internal methods (used by PlmActionAspect and ActionService directly)
    // ================================================================

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
    public GuardEvaluation evaluateSplit(String hideActionId, String blockActionId,
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
    public void assertSplit(String hideActionId, String blockActionId,
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

        // Build reverse index: algorithm id → code
        Map<String, String> codeById = new HashMap<>();
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            codeById.put(alg.id(), alg.code());
        }
        algorithmCodeById = Map.copyOf(codeById);

        Map<String, String> newActionIdByCode = new HashMap<>();
        for (var action : configCache.getAllActions()) {
            newActionIdByCode.put(action.actionCode(), action.id());
            for (ActionGuardConfig ag : configCache.getActionGuards(action.id())) {
                ResolvedGuard rg = resolveGuardFromConfig(ag.algorithmInstanceId(), ag.effect());
                if (rg != null) {
                    newActionGuards.computeIfAbsent(action.id(), k -> new ArrayList<>()).add(rg);
                }
            }
        }

        cacheLock.writeLock().lock();
        try {
            actionGuardsCache = Map.copyOf(newActionGuards);
            actionIdByCode = Map.copyOf(newActionIdByCode);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Action guard cache loaded: {} guards across {} actions",
            newActionGuards.values().stream().mapToInt(List::size).sum(),
            newActionGuards.size());
    }

    /**
     * Resolves a guard from ConfigCache data (replaces the old JOOQ-based resolveGuardFromRow).
     * Looks up the algorithm code via instanceId → algorithmId → code, then resolves the
     * Spring bean and collects instance parameters.
     */
    private ResolvedGuard resolveGuardFromConfig(String instanceId, String effectStr) {
        String code = resolveAlgorithmCode(instanceId);
        if (code == null) {
            log.warn("Cannot resolve algorithm code for instance '{}' -- skipping", instanceId);
            return null;
        }

        GuardEffect effect = GuardEffect.valueOf(effectStr);

        if (!algorithmRegistry.hasBean(code)) {
            log.warn("Guard algorithm '{}' has no Spring bean -- skipping", code);
            return null;
        }

        ActionGuard bean;
        try {
            bean = algorithmRegistry.resolve(code, ActionGuard.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement ActionGuard -- skipping (wrong attachment?)", code);
            return null;
        }

        // Instance parameters are already resolved in AlgorithmInstanceConfig
        Map<String, String> params = configCache.getInstance(instanceId)
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedGuard(instanceId, bean, effect, params);
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

    private List<ResolvedGuard> resolveEffectiveGuards(String actionId, String nodeTypeId,
                                                       String transitionId) {
        if (actionId == null) return List.of();
        cacheLock.readLock().lock();
        try {
            return new ArrayList<>(actionGuardsCache.getOrDefault(actionId, List.of()));
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    record ResolvedGuard(
        String algorithmInstanceId,
        ActionGuard bean,
        GuardEffect effect,
        Map<String, String> parameters
    ) {}
}
