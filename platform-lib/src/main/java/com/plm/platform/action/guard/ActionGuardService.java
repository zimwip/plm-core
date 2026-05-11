package com.plm.platform.action.guard;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.ActionGuardConfig;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * {@link ActionGuardPort} backed by {@link ConfigCache}.
 *
 * Guard attachments come from ConfigCache (populated from platform-api at startup).
 * Wired by {@link com.plm.platform.action.ActionFrameworkAutoConfiguration} when
 * ConfigCache is present; {@link LocalActionGuardService} is used as fallback otherwise.
 */
@Slf4j
public class ActionGuardService implements ActionGuardPort {

    private final ConfigCache        configCache;
    private final AlgorithmRegistry  algorithmRegistry;

    /** Action-level guards, keyed by actionId. */
    private Map<String, List<ResolvedGuard>> actionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    /** Reverse index: algorithm id → algorithm code (rebuilt on each cache rebuild). */
    private Map<String, String> algorithmCodeById = Map.of();

    /** Reverse index: action code → action id. */
    private Map<String, String> actionIdByCode = Map.of();

    public ActionGuardService(ConfigCache configCache, @Lazy AlgorithmRegistry algorithmRegistry) {
        this.configCache       = configCache;
        this.algorithmRegistry = algorithmRegistry;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    @Override
    public GuardEvaluation evaluate(String actionCode, String actionId,
                                    String nodeTypeId, String transitionId,
                                    boolean isAdmin, ActionGuardContext ctx) {
        String effectiveId = actionId != null ? actionId : resolveActionId(actionCode);
        return evaluateById(effectiveId, nodeTypeId, transitionId, isAdmin, ctx);
    }

    @Override
    public void assertGuards(String actionCode, String actionId,
                             String nodeTypeId, String transitionId,
                             boolean isAdmin, ActionGuardContext ctx) {
        String effectiveId = actionId != null ? actionId : resolveActionId(actionCode);
        assertGuardsById(effectiveId, nodeTypeId, transitionId, isAdmin, ctx);
    }

    public GuardEvaluation evaluateById(String actionId, String nodeTypeId,
                                        String transitionId, boolean isAdmin,
                                        ActionGuardContext ctx) {
        List<ResolvedGuard> effective = resolveEffectiveGuards(actionId, nodeTypeId, transitionId);
        if (effective.isEmpty()) return GuardEvaluation.PASSED;

        boolean hidden = false;
        List<GuardViolation> blockViolations = new ArrayList<>();

        for (ResolvedGuard rg : effective) {
            if (isAdmin && rg.effect() != GuardEffect.HIDE) continue;

            List<GuardViolation> rawViolations = rg.bean().evaluate(ctx);
            if (rawViolations.isEmpty()) continue;

            if (rg.effect() == GuardEffect.HIDE) {
                hidden = true;
                break;
            }

            for (GuardViolation v : rawViolations) {
                blockViolations.add(new GuardViolation(
                    v.code(), v.message(), rg.effect(), v.fieldRef(), v.details()));
            }
        }

        return new GuardEvaluation(hidden, blockViolations);
    }

    public void assertGuardsById(String actionId, String nodeTypeId,
                                  String transitionId, boolean isAdmin,
                                  ActionGuardContext ctx) {
        if (isAdmin) return;

        List<ResolvedGuard> effective = resolveEffectiveGuards(actionId, nodeTypeId, transitionId);

        List<String> messages = new ArrayList<>();
        for (ResolvedGuard rg : effective) {
            if (rg.effect() == GuardEffect.HIDE) continue;
            for (GuardViolation v : rg.bean().evaluate(ctx)) {
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
        Map<String, String> codeById = new HashMap<>();
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            codeById.put(alg.id(), alg.code());
        }

        Map<String, List<ResolvedGuard>> newActionGuards = new HashMap<>();
        Map<String, String> newActionIdByCode = new HashMap<>();

        for (var action : configCache.getAllActions()) {
            newActionIdByCode.put(action.actionCode(), action.id());
            for (ActionGuardConfig ag : configCache.getActionGuards(action.id())) {
                ResolvedGuard rg = resolveGuardFromConfig(ag.algorithmInstanceId(), ag.effect(), codeById);
                if (rg != null) {
                    newActionGuards.computeIfAbsent(action.id(), k -> new ArrayList<>()).add(rg);
                }
            }
        }

        cacheLock.writeLock().lock();
        try {
            algorithmCodeById = Map.copyOf(codeById);
            actionGuardsCache = Map.copyOf(newActionGuards);
            actionIdByCode    = Map.copyOf(newActionIdByCode);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Action guard cache loaded: {} guards across {} actions",
            newActionGuards.values().stream().mapToInt(List::size).sum(),
            newActionGuards.size());
    }

    private ResolvedGuard resolveGuardFromConfig(String instanceId, String effectStr,
                                                  Map<String, String> codeById) {
        String code = resolveAlgorithmCode(instanceId, codeById);
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

        Map<String, String> params = configCache.getInstance(instanceId)
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedGuard(instanceId, bean, effect, params);
    }

    private String resolveAlgorithmCode(String instanceId, Map<String, String> codeById) {
        Optional<AlgorithmInstanceConfig> instance = configCache.getInstance(instanceId);
        if (instance.isEmpty()) return null;
        return codeById.get(instance.get().algorithmId());
    }

    private String resolveActionId(String actionCode) {
        cacheLock.readLock().lock();
        try {
            return actionIdByCode.get(actionCode);
        } finally {
            cacheLock.readLock().unlock();
        }
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
