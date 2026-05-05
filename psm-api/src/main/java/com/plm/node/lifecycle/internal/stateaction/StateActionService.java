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

@Slf4j
@Service
public class StateActionService {

    private final ConfigCache        configCache;
    private final ApplicationContext appCtx;

    private AlgorithmRegistry algorithmRegistry() {
        return AlgorithmRegistry.getInstance(appCtx);
    }

    private Map<StateKey, List<ResolvedStateAction>> stateActionsCache = Map.of();
    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public StateActionService(ConfigCache configCache, ApplicationContext appCtx) {
        this.configCache = configCache;
        this.appCtx = appCtx;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    public void executeTransactionalActions(String stateId, String nodeTypeId,
                                            StateActionTrigger trigger,
                                            StateActionContext ctx) {
        List<ResolvedStateAction> actions = resolveEffectiveActions(stateId, trigger);
        for (ResolvedStateAction action : actions) {
            if (action.mode() != StateActionMode.TRANSACTIONAL) continue;
            StateActionContext enriched = ctx.withParameters(action.parameters());
            log.debug("Executing TRANSACTIONAL state action '{}' on state={} trigger={}",
                action.bean().code(), stateId, trigger);
            action.bean().execute(enriched);
        }
    }

    public List<Runnable> collectPostCommitActions(String stateId, String nodeTypeId,
                                                    StateActionTrigger trigger,
                                                    StateActionContext ctx) {
        List<ResolvedStateAction> actions = resolveEffectiveActions(stateId, trigger);
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

    List<ResolvedStateAction> resolveEffectiveActions(String stateId, StateActionTrigger trigger) {
        cacheLock.readLock().lock();
        try {
            return new ArrayList<>(stateActionsCache.getOrDefault(new StateKey(stateId, trigger), List.of()));
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    private void rebuildCache() {
        Map<StateKey, List<ResolvedStateAction>> newCache = new HashMap<>();

        Map<String, String> instanceToCode = new HashMap<>();
        for (AlgorithmConfig alg : configCache.getAllAlgorithms()) {
            if (alg.instances() != null) {
                for (AlgorithmInstanceConfig inst : alg.instances()) {
                    instanceToCode.put(inst.id(), alg.code());
                }
            }
        }

        List<StateActionConfig> all = configCache.getSnapshot() != null
            && configCache.getSnapshot().stateActions() != null
            ? configCache.getSnapshot().stateActions() : List.of();

        for (StateActionConfig sa : all) {
            StateActionTrigger trigger = StateActionTrigger.valueOf(sa.trigger());
            StateKey key = new StateKey(sa.lifecycleStateId(), trigger);
            String code = instanceToCode.get(sa.algorithmInstanceId());
            if (code == null) {
                log.warn("State action instance '{}' has no algorithm mapping — skipping", sa.algorithmInstanceId());
                continue;
            }
            ResolvedStateAction rsa = resolveFromConfig(sa, code);
            if (rsa != null) newCache.computeIfAbsent(key, k -> new ArrayList<>()).add(rsa);
        }

        cacheLock.writeLock().lock();
        try {
            stateActionsCache = Map.copyOf(newCache);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("State action cache loaded: {} entries",
            newCache.values().stream().mapToInt(List::size).sum());
    }

    private ResolvedStateAction resolveFromConfig(StateActionConfig sa, String algorithmCode) {
        StateActionMode mode = StateActionMode.valueOf(sa.executionMode());

        if (!algorithmRegistry().hasBean(algorithmCode)) {
            log.warn("State action algorithm '{}' has no Spring bean — skipping", algorithmCode);
            return null;
        }

        StateAction bean;
        try {
            bean = algorithmRegistry().resolve(algorithmCode, StateAction.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement StateAction — skipping", algorithmCode);
            return null;
        }

        Map<String, String> params = configCache.getInstance(sa.algorithmInstanceId())
            .map(AlgorithmInstanceConfig::paramValues)
            .orElse(Map.of());

        return new ResolvedStateAction(sa.algorithmInstanceId(), bean, mode, sa.displayOrder(), Map.copyOf(params));
    }

    record ResolvedStateAction(
        String algorithmInstanceId,
        StateAction bean,
        StateActionMode mode,
        int displayOrder,
        Map<String, String> parameters
    ) {}

    record StateKey(String stateId, StateActionTrigger trigger) {
        @Override public boolean equals(Object o) {
            if (!(o instanceof StateKey k)) return false;
            return Objects.equals(stateId, k.stateId) && trigger == k.trigger;
        }
        @Override public int hashCode() { return Objects.hash(stateId, trigger); }
    }
}
