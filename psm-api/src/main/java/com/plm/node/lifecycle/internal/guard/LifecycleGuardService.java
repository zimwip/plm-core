package com.plm.node.lifecycle.internal.guard;

import com.plm.algorithm.AlgorithmRegistry;
import org.springframework.context.ApplicationContext;
import com.plm.shared.exception.GuardViolationException;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardEvaluation;
import com.plm.shared.guard.GuardViolation;
import lombok.extern.slf4j.Slf4j;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Evaluates guards for lifecycle transitions. Maintains an in-memory cache
 * of the guard attachment graph loaded at startup:
 *
 * <ul>
 *   <li>Tier 1: {@code lifecycle_transition_guard} — shared across all node types
 *       using that lifecycle, keyed by transitionId</li>
 *   <li>Tier 2: {@code node_action_guard WHERE transition_id IS NOT NULL} — per-node-type
 *       overrides (ADD/DISABLE) for specific transitions</li>
 * </ul>
 *
 * Cache is invalidated via {@link #evictCache()} when admin changes guard config.
 */
@Slf4j
@Service
public class LifecycleGuardService {

    private final DSLContext          dsl;
    private final ApplicationContext  appCtx;

    /** Tier 1: lifecycle-transition guards, keyed by transitionId. */
    private Map<String, List<ResolvedGuard>> transitionGuardsCache = Map.of();
    /** Tier 2: per-node-type transition overrides, keyed by (nodeTypeId, transitionId). */
    private Map<NodeTransitionKey, List<ResolvedGuard>> nodeTransitionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public LifecycleGuardService(DSLContext dsl, ApplicationContext appCtx) {
        this.dsl = dsl;
        this.appCtx = appCtx;
    }

    private AlgorithmRegistry algorithmRegistry() {
        return AlgorithmRegistry.getInstance(appCtx);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadCache() {
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
                    v.guardCode(), v.message(), rg.effect(), v.fieldRef(), v.details()));
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
        Map<NodeTransitionKey, List<ResolvedGuard>> newNodeTransitionGuards = new HashMap<>();

        // Tier 1: lifecycle_transition_guard
        List<Record> transitionGuardRows = dsl.fetch("""
            SELECT ltg.lifecycle_transition_id, ltg.algorithm_instance_id, ltg.effect, ltg.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM lifecycle_transition_guard ltg
            JOIN algorithm_instance ai ON ai.id = ltg.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            ORDER BY ltg.lifecycle_transition_id, ltg.display_order
            """);

        for (Record row : transitionGuardRows) {
            String transitionId = row.get("lifecycle_transition_id", String.class);
            ResolvedGuard rg = resolveGuardFromRow(row, "ADD");
            if (rg != null) {
                newTransitionGuards.computeIfAbsent(transitionId, k -> new ArrayList<>()).add(rg);
            }
        }

        // Tier 2: node_action_guard WHERE transition_id IS NOT NULL
        List<Record> nodeTransitionGuardRows = dsl.fetch("""
            SELECT nag.node_type_id, nag.transition_id,
                   nag.algorithm_instance_id, nag.effect, nag.override_action, nag.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM node_action_guard nag
            JOIN algorithm_instance ai ON ai.id = nag.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            WHERE nag.transition_id IS NOT NULL
            ORDER BY nag.node_type_id, nag.transition_id, nag.display_order
            """);

        for (Record row : nodeTransitionGuardRows) {
            NodeTransitionKey key = new NodeTransitionKey(
                row.get("node_type_id",  String.class),
                row.get("transition_id", String.class));
            String overrideAction = row.get("override_action", String.class);
            ResolvedGuard rg = resolveGuardFromRow(row, overrideAction);
            if (rg != null) {
                newNodeTransitionGuards.computeIfAbsent(key, k -> new ArrayList<>()).add(rg);
            }
        }

        cacheLock.writeLock().lock();
        try {
            transitionGuardsCache = Map.copyOf(newTransitionGuards);
            nodeTransitionGuardsCache = Map.copyOf(newNodeTransitionGuards);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Lifecycle guard cache loaded: {} transition, {} node-transition entries",
            newTransitionGuards.values().stream().mapToInt(List::size).sum(),
            newNodeTransitionGuards.values().stream().mapToInt(List::size).sum());
    }

    private ResolvedGuard resolveGuardFromRow(Record row, String overrideAction) {
        String code = row.get("algorithm_code", String.class);
        String instanceId = row.get("algorithm_instance_id", String.class);
        GuardEffect effect = GuardEffect.valueOf(row.get("effect", String.class));

        if (!algorithmRegistry().hasBean(code)) {
            log.warn("Lifecycle guard algorithm '{}' has no Spring bean — skipping", code);
            return null;
        }

        LifecycleGuard bean;
        try {
            bean = algorithmRegistry().resolve(code, LifecycleGuard.class);
        } catch (IllegalArgumentException e) {
            log.warn("Algorithm '{}' does not implement LifecycleGuard — skipping (wrong attachment?)", code);
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

        return new ResolvedGuard(instanceId, bean, effect, overrideAction, Map.copyOf(params));
    }

    /**
     * Resolves the effective guard set for a lifecycle transition with
     * inherit + override. Merges:
     *   <ol>
     *     <li>Tier 1: lifecycle_transition_guard — shared by all node types using the lifecycle</li>
     *     <li>Tier 2: node_action_guard overrides with ADD or DISABLE</li>
     *   </ol>
     */
    private List<ResolvedGuard> resolveEffectiveGuards(String transitionId, String nodeTypeId) {
        cacheLock.readLock().lock();
        try {
            List<ResolvedGuard> base = new ArrayList<>(
                transitionGuardsCache.getOrDefault(transitionId, List.of()));

            if (nodeTypeId == null) return base;

            // Tier 2: per-type overrides
            List<ResolvedGuard> overrides = nodeTransitionGuardsCache.get(
                new NodeTransitionKey(nodeTypeId, transitionId));

            if (overrides == null || overrides.isEmpty()) return base;

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

    /** Composite cache key: (node_type, transition). */
    record NodeTransitionKey(String nodeTypeId, String transitionId) {
        @Override public boolean equals(Object o) {
            if (!(o instanceof NodeTransitionKey k)) return false;
            return Objects.equals(nodeTypeId, k.nodeTypeId)
                && Objects.equals(transitionId, k.transitionId);
        }
        @Override public int hashCode() {
            return Objects.hash(nodeTypeId, transitionId);
        }
    }

    record ResolvedGuard(
        String algorithmInstanceId,
        LifecycleGuard bean,
        GuardEffect effect,
        String overrideAction,
        Map<String, String> parameters
    ) {}
}
