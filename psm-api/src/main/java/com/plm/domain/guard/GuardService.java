package com.plm.domain.guard;

import com.plm.domain.algorithm.AlgorithmRegistry;
import com.plm.domain.exception.GuardViolationException;
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
 * Evaluates guards for actions. Maintains an in-memory cache of the guard
 * attachment graph (action → guards, (node_type, action, transition) → guards)
 * loaded at startup.
 *
 * Cache is invalidated via {@link #evictCache()} when admin changes guard config.
 */
@Slf4j
@Service
public class GuardService {

    private final DSLContext         dsl;
    private final AlgorithmRegistry  algorithmRegistry;

    /** Action-level guards (global across node types), keyed by actionId. */
    private Map<String, List<ResolvedGuard>> actionGuardsCache = Map.of();
    /** Lifecycle-transition-level guards (shared across node_types using that lifecycle), keyed by transitionId. */
    private Map<String, List<ResolvedGuard>> transitionGuardsCache = Map.of();
    /** Per-node-type guards, keyed by {@link NodeActionKey}. */
    private Map<NodeActionKey, List<ResolvedGuard>> nodeActionGuardsCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public GuardService(DSLContext dsl, AlgorithmRegistry algorithmRegistry) {
        this.dsl = dsl;
        this.algorithmRegistry = algorithmRegistry;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadCache() {
        rebuildCache();
    }

    /**
     * Evaluates all effective guards for the given action context.
     * Uses cached guard attachments — no DB query.
     */
    public GuardEvaluation evaluate(String actionId, String nodeTypeId,
                                    String transitionId, boolean isAdmin,
                                    GuardContext ctx) {
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
     * are NOT enforced here — they control action visibility, not executability.
     */
    public void assertGuards(String actionId, String nodeTypeId,
                             String transitionId, boolean isAdmin,
                             GuardContext ctx) {
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

    public void evictCache() {
        rebuildCache();
        log.info("Guard cache evicted and rebuilt");
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<String, List<ResolvedGuard>> newActionGuards = new HashMap<>();
        Map<String, List<ResolvedGuard>> newTransitionGuards = new HashMap<>();
        Map<NodeActionKey, List<ResolvedGuard>> newNodeActionGuards = new HashMap<>();

        List<Record> actionGuardRows = dsl.fetch("""
            SELECT ag.action_id, ag.algorithm_instance_id, ag.effect, ag.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM action_guard ag
            JOIN algorithm_instance ai ON ai.id = ag.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            ORDER BY ag.action_id, ag.display_order
            """);

        for (Record row : actionGuardRows) {
            String actionId = row.get("action_id", String.class);
            ResolvedGuard rg = resolveGuardFromRow(row, "ADD");
            if (rg != null) {
                newActionGuards.computeIfAbsent(actionId, k -> new ArrayList<>()).add(rg);
            }
        }

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

        List<Record> nodeActionGuardRows = dsl.fetch("""
            SELECT nag.node_type_id, nag.action_id, nag.transition_id,
                   nag.algorithm_instance_id, nag.effect, nag.override_action, nag.display_order,
                   ai.algorithm_id, a.code AS algorithm_code
            FROM node_action_guard nag
            JOIN algorithm_instance ai ON ai.id = nag.algorithm_instance_id
            JOIN algorithm a ON a.id = ai.algorithm_id
            ORDER BY nag.node_type_id, nag.action_id, nag.display_order
            """);

        for (Record row : nodeActionGuardRows) {
            NodeActionKey key = new NodeActionKey(
                row.get("node_type_id",  String.class),
                row.get("action_id",     String.class),
                row.get("transition_id", String.class));
            String overrideAction = row.get("override_action", String.class);
            ResolvedGuard rg = resolveGuardFromRow(row, overrideAction);
            if (rg != null) {
                newNodeActionGuards.computeIfAbsent(key, k -> new ArrayList<>()).add(rg);
            }
        }

        cacheLock.writeLock().lock();
        try {
            actionGuardsCache = Map.copyOf(newActionGuards);
            transitionGuardsCache = Map.copyOf(newTransitionGuards);
            nodeActionGuardsCache = Map.copyOf(newNodeActionGuards);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Guard cache loaded: {} action, {} transition, {} node-action entries",
            newActionGuards.values().stream().mapToInt(List::size).sum(),
            newTransitionGuards.values().stream().mapToInt(List::size).sum(),
            newNodeActionGuards.values().stream().mapToInt(List::size).sum());
    }

    private ResolvedGuard resolveGuardFromRow(Record row, String overrideAction) {
        String code = row.get("algorithm_code", String.class);
        String instanceId = row.get("algorithm_instance_id", String.class);
        GuardEffect effect = GuardEffect.valueOf(row.get("effect", String.class));

        if (!algorithmRegistry.hasBean(code)) {
            log.warn("Guard algorithm '{}' has no Spring bean — skipping", code);
            return null;
        }

        Guard bean = algorithmRegistry.resolve(code, Guard.class);

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
     * Resolves the effective guard set for (action, nodeType, transition) with
     * inherit + override. Merges:
     *   1. action-level guards (global)
     *   2. per-node-type guards matching the transition (or null transition for NODE scope)
     *   3. for LIFECYCLE actions, per-node-type guards with null transitionId also apply
     *      across all transitions of that (node_type, action).
     */
    /**
     * Three-tier merge:
     *   1. action_guard                 — global (per action)
     *   2. lifecycle_transition_guard   — shared by all node_types using the lifecycle
     *   3. node_action_guard            — per-type override (ADD or DISABLE)
     */
    private List<ResolvedGuard> resolveEffectiveGuards(String actionId, String nodeTypeId,
                                                       String transitionId) {
        cacheLock.readLock().lock();
        try {
            List<ResolvedGuard> base = new ArrayList<>(
                actionGuardsCache.getOrDefault(actionId, List.of()));

            // Tier 2: lifecycle-transition guards apply to LIFECYCLE-scope actions
            if (transitionId != null) {
                List<ResolvedGuard> transitionLevel = transitionGuardsCache.get(transitionId);
                if (transitionLevel != null) base.addAll(transitionLevel);
            }

            if (nodeTypeId == null) return base;

            // Tier 3: per-type overrides
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
        Guard bean,
        GuardEffect effect,
        String overrideAction,
        Map<String, String> parameters
    ) {}
}
