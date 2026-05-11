package com.plm.node.lifecycle.internal.guard;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.platform.config.dto.TransitionGuardConfig;
import com.plm.shared.exception.GuardViolationException;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardEvaluation;
import com.plm.platform.action.guard.GuardViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantReadWriteLock;

@Slf4j
@Service
public class LifecycleGuardService {

    private final ConfigCache        configCache;
    private final AlgorithmRegistry  algorithmRegistry;

    /** Lifecycle-transition guards, keyed by transitionId. */
    private Map<String, List<ResolvedGuard>> transitionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public LifecycleGuardService(ConfigCache configCache, @Lazy AlgorithmRegistry algorithmRegistry) {
        this.configCache        = configCache;
        this.algorithmRegistry  = algorithmRegistry;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    /**
     * Evaluates all effective guards for the given lifecycle transition.
     * Uses cached guard attachments — no DB query.
     */
    public GuardEvaluation evaluate(String transitionId, String nodeTypeId,
                                    boolean isAdmin, LifecycleGuardContext ctx) {
        List<ResolvedGuard> effective = resolveEffectiveGuards(transitionId, nodeTypeId);
        if (effective.isEmpty()) return GuardEvaluation.PASSED;

        boolean hidden = false;
        List<GuardViolation> blockViolations = new ArrayList<>();

        for (ResolvedGuard rg : effective) {
            // Admin bypasses BLOCK guards (permission), not HIDE guards (visibility/structural)
            if (isAdmin && rg.effect() != GuardEffect.HIDE) continue;

            LifecycleGuardContext enriched = new LifecycleGuardContext(
                ctx.nodeId(), ctx.nodeTypeId(), ctx.currentStateId(), ctx.transitionId(),
                ctx.isLocked(), ctx.isLockedByCurrentUser(), ctx.currentUserId(),
                rg.parameters());

            List<GuardViolation> rawViolations = rg.bean().evaluate(enriched);
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

    /**
     * Asserts BLOCK guards pass at execution time. HIDE guards are UI-only and
     * are NOT enforced here — they control transition visibility, not executability.
     */
    public void assertGuards(String transitionId, String nodeTypeId,
                             boolean isAdmin, LifecycleGuardContext ctx) {
        if (isAdmin) return;

        List<ResolvedGuard> effective = resolveEffectiveGuards(transitionId, nodeTypeId);

        List<String> messages = new ArrayList<>();
        for (ResolvedGuard rg : effective) {
            if (rg.effect() == GuardEffect.HIDE) continue;

            LifecycleGuardContext enriched = new LifecycleGuardContext(
                ctx.nodeId(), ctx.nodeTypeId(), ctx.currentStateId(), ctx.transitionId(),
                ctx.isLocked(), ctx.isLockedByCurrentUser(), ctx.currentUserId(),
                rg.parameters());

            List<GuardViolation> violations = rg.bean().evaluate(enriched);
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
        log.info("Lifecycle guard cache evicted and rebuilt");
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<String, List<ResolvedGuard>> newTransitionGuards = new HashMap<>();

        for (var lifecycle : configCache.getAllLifecycles()) {
            if (lifecycle.transitions() == null) continue;
            for (var transition : lifecycle.transitions()) {
                List<TransitionGuardConfig> guards = configCache.getTransitionGuards(transition.id());
                for (TransitionGuardConfig tg : guards) {
                    ResolvedGuard rg = resolveGuardFromConfig(tg.algorithmInstanceId(), tg.effect());
                    if (rg != null) {
                        newTransitionGuards.computeIfAbsent(tg.lifecycleTransitionId(), k -> new ArrayList<>()).add(rg);
                    }
                }
            }
        }

        cacheLock.writeLock().lock();
        try {
            transitionGuardsCache = Map.copyOf(newTransitionGuards);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Lifecycle guard cache loaded: {} guards across {} transitions",
            newTransitionGuards.values().stream().mapToInt(List::size).sum(),
            newTransitionGuards.size());
    }

    private ResolvedGuard resolveGuardFromConfig(String instanceId, String effectStr) {
        String code = resolveAlgorithmCode(instanceId);
        if (code == null) {
            log.warn("No algorithm found for instance '{}' — skipping", instanceId);
            return null;
        }

        GuardEffect effect = GuardEffect.valueOf(effectStr);

        if (!algorithmRegistry.hasBean(code)) {
            log.warn("Lifecycle guard algorithm '{}' has no Spring bean — skipping", code);
            return null;
        }

        LifecycleGuard bean;
        try {
            bean = algorithmRegistry.resolve(code, LifecycleGuard.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement LifecycleGuard — skipping (wrong attachment?)", code);
            return null;
        }

        // Params come directly from AlgorithmInstanceConfig — no DB query needed
        Map<String, String> params = configCache.getInstance(instanceId)
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedGuard(instanceId, bean, effect, params);
    }

    /**
     * Resolves the algorithm code for a given instance id by walking all algorithms.
     */
    private String resolveAlgorithmCode(String instanceId) {
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            if (alg.instances() == null) continue;
            for (AlgorithmInstanceConfig inst : alg.instances()) {
                if (inst.id().equals(instanceId)) {
                    return alg.code();
                }
            }
        }
        return null;
    }

    private List<ResolvedGuard> resolveEffectiveGuards(String transitionId, String nodeTypeId) {
        cacheLock.readLock().lock();
        try {
            return new ArrayList<>(transitionGuardsCache.getOrDefault(transitionId, List.of()));
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    record ResolvedGuard(
        String algorithmInstanceId,
        LifecycleGuard bean,
        GuardEffect effect,
        Map<String, String> parameters
    ) {}
}
