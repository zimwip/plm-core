package com.plm.node.metamodel.internal.validation;

import com.plm.platform.algorithm.AlgorithmRegistry;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.ConfigSnapshotUpdatedEvent;
import com.plm.platform.config.dto.AlgorithmConfig;
import com.plm.platform.config.dto.AlgorithmInstanceConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Runtime resolver/cache for pluggable {@link AttributeValidator} attachments.
 *
 * <p>Mirrors {@code LifecycleGuardService}: validator attachments are published
 * into the config snapshot as {@code entity_metadata} entries and rebuilt into
 * an in-memory cache on each {@link ConfigSnapshotUpdatedEvent}. At runtime,
 * {@link #validate} / {@link #hints} look up validators for a
 * (nodeTypeId, attributeCode) pair and apply those matching the lifecycle state.
 *
 * <p><b>entity_metadata encoding</b> (see SHARED CONTRACT): a validator
 * attachment has key {@code ATTR_VALIDATOR:<nodeTypeId>__<attrDefId>:<stateId|_>__<instanceId>}
 * and value = effect ({@code BLOCK} / {@code HIDE}). {@code _} as stateId means
 * "all states". Keys split on {@code :} into exactly 3 parts; the internal id
 * separator is double-underscore {@code __}.
 */
@Slf4j
@Service
public class AttributeValidatorService {

    private static final String VALIDATOR_PREFIX  = "ATTR_VALIDATOR:";
    private static final String ATTR_DEF_PREFIX   = "ATTRIBUTE_DEFINITION:";

    private final ConfigCache       configCache;
    private final AlgorithmRegistry algorithmRegistry;

    /** Validators keyed by {@code nodeTypeId + ":" + attrDefId}. */
    private Map<String, List<ResolvedValidator>> validatorCache = Map.of();

    private final ReentrantReadWriteLock cacheLock = new ReentrantReadWriteLock();

    public AttributeValidatorService(ConfigCache configCache, @Lazy AlgorithmRegistry algorithmRegistry) {
        this.configCache       = configCache;
        this.algorithmRegistry = algorithmRegistry;
    }

    @EventListener(ConfigSnapshotUpdatedEvent.class)
    public void onConfigSnapshotUpdated(ConfigSnapshotUpdatedEvent event) {
        rebuildCache();
    }

    // ================================================================
    // Public API
    // ================================================================

    /**
     * Run all validators attached for (nodeTypeId, attrCode) whose state scope
     * matches {@code stateId} (or "_" = all states). Returns the collected
     * violations, or an empty list when none apply / none fail.
     */
    public List<GuardViolation> validate(String nodeTypeId, String stateId, String attrCode,
                                         String value, Map<String, String> allValues, String nodeId) {
        List<ResolvedValidator> validators = lookup(nodeTypeId, attrCode);
        if (validators.isEmpty()) return List.of();

        Map<String, String> attrMeta = sliceMetadata(attrCode);
        // Dedupe by violation code: the same attribute may carry an all-states rule
        // and a per-state rule for the same validator (e.g. required), which must not
        // produce two identical violations.
        Map<String, GuardViolation> out = new LinkedHashMap<>();
        for (ResolvedValidator rv : validators) {
            if (!appliesToState(rv, stateId)) continue;
            AttributeValidationContext ctx = new AttributeValidationContext(
                nodeId, nodeTypeId, stateId, attrCode, value, allValues, rv.params(), attrMeta);
            for (GuardViolation gv : rv.bean().validate(ctx)) {
                out.putIfAbsent(gv.code(), gv);
            }
        }
        return new ArrayList<>(out.values());
    }

    /**
     * Merge the UI hints from all validators attached for (nodeTypeId, attrCode)
     * whose state scope matches {@code stateId}. Empty map when none apply.
     */
    public Map<String, Object> hints(String nodeTypeId, String stateId, String attrCode) {
        return hints(nodeTypeId, stateId, attrCode, null, null, Map.of());
    }

    /**
     * Node-context-aware hints: validators receive the node id, this attribute's current
     * value, and all current values, and may contribute additional key/values. Used when
     * building a concrete object's description (the merged map becomes the field's extras).
     */
    public Map<String, Object> hints(String nodeTypeId, String stateId, String attrCode,
                                     String nodeId, String value, Map<String, String> allValues) {
        List<ResolvedValidator> validators = lookup(nodeTypeId, attrCode);
        if (validators.isEmpty()) return Map.of();

        Map<String, String> attrMeta = sliceMetadata(attrCode);
        Map<String, Object> merged = new LinkedHashMap<>();
        for (ResolvedValidator rv : validators) {
            if (!appliesToState(rv, stateId)) continue;
            AttributeHintContext ctx = new AttributeHintContext(
                nodeTypeId, stateId, attrCode, rv.params(), attrMeta,
                nodeId, value, allValues != null ? allValues : Map.of());
            for (Map.Entry<String, Object> h : rv.bean().hint(ctx).entrySet()) {
                if ("description".equals(h.getKey()) && merged.containsKey("description")) {
                    merged.put("description", merged.get("description") + "; " + h.getValue());
                } else {
                    merged.put(h.getKey(), h.getValue());
                }
            }
        }
        return merged;
    }

    public void evictCache() {
        rebuildCache();
        log.info("Attribute validator cache evicted and rebuilt");
    }

    // ================================================================
    // Resolved-state helpers (drive server-driven UI + validation)
    // ================================================================

    /** True when a required-validator rule applies for (nodeType, state, attr). */
    public boolean isRequired(String nodeTypeId, String stateId, String attrCode) {
        return Boolean.TRUE.equals(hints(nodeTypeId, stateId, attrCode).get("required"));
    }

    /** True unless an editable-validator rule locks the attribute in this state (default editable). */
    public boolean isEditable(String nodeTypeId, String stateId, String attrCode) {
        return !Boolean.FALSE.equals(hints(nodeTypeId, stateId, attrCode).get("editable"));
    }

    /**
     * True when the attribute is hidden in {@code stateId} (display concern, stored as
     * {@code visibility.hidden.<stateId>} in attribute metadata). Default: visible.
     */
    public boolean isHidden(String stateId, String attrCode) {
        if (stateId == null) return false;
        return "true".equalsIgnoreCase(sliceMetadata(attrCode).get("visibility.hidden." + stateId));
    }

    // ================================================================
    // Cache management
    // ================================================================

    private void rebuildCache() {
        Map<String, List<ResolvedValidator>> newCache = new HashMap<>();

        for (Map.Entry<String, String> e : configCache.getEntityMetadata().entrySet()) {
            String key = e.getKey();
            if (key == null || !key.startsWith(VALIDATOR_PREFIX)) continue;

            // KEY = type:targetId:metaKey (exactly 3 parts on ':')
            String[] keyParts = key.split(":", 3);
            if (keyParts.length != 3) {
                log.warn("Malformed ATTR_VALIDATOR key '{}' — skipping", key);
                continue;
            }
            String targetId = keyParts[1];   // <nodeTypeId>__<attrDefId>
            String metaKey  = keyParts[2];   // <stateId|_>__<instanceId>

            String[] target = targetId.split("__", 2);
            String[] meta   = metaKey.split("__", 2);
            if (target.length != 2 || meta.length != 2) {
                log.warn("Malformed ATTR_VALIDATOR target/meta in key '{}' — skipping", key);
                continue;
            }
            String nodeTypeId = target[0];
            String attrDefId  = target[1];
            String stateId    = meta[0];
            String instanceId = meta[1];

            String code = resolveAlgorithmCode(instanceId);
            if (code == null) {
                log.warn("No algorithm found for validator instance '{}' — skipping", instanceId);
                continue;
            }
            if (!algorithmRegistry.hasBean(code)) {
                log.warn("Attribute validator algorithm '{}' has no Spring bean — skipping", code);
                continue;
            }

            AttributeValidator bean;
            try {
                bean = algorithmRegistry.resolve(code, AttributeValidator.class);
            } catch (IllegalArgumentException ex) {
                log.warn("Algorithm '{}' does not implement AttributeValidator — skipping (wrong attachment?)", code);
                continue;
            }

            GuardEffect effect = parseEffect(e.getValue());
            Map<String, String> params = configCache.getInstance(instanceId)
                .map(AlgorithmInstanceConfig::paramValues)
                .orElse(Map.of());

            ResolvedValidator rv = new ResolvedValidator(stateId, instanceId, bean, effect, params);
            newCache.computeIfAbsent(nodeTypeId + ":" + attrDefId, k -> new ArrayList<>()).add(rv);
        }

        cacheLock.writeLock().lock();
        try {
            validatorCache = Map.copyOf(newCache);
        } finally {
            cacheLock.writeLock().unlock();
        }

        log.info("Attribute validator cache loaded: {} validators across {} attributes",
            newCache.values().stream().mapToInt(List::size).sum(),
            newCache.size());
    }

    /** Resolves the algorithm code for a given instance id by walking all algorithms. */
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

    /** Slice entity_metadata for one attribute: strip {@code ATTRIBUTE_DEFINITION:<id>:} prefix. */
    private Map<String, String> sliceMetadata(String attrDefId) {
        String prefix = ATTR_DEF_PREFIX + attrDefId + ":";
        Map<String, String> out = new HashMap<>();
        for (Map.Entry<String, String> e : configCache.getEntityMetadata().entrySet()) {
            if (e.getKey() != null && e.getKey().startsWith(prefix)) {
                out.put(e.getKey().substring(prefix.length()), e.getValue());
            }
        }
        return out;
    }

    /**
     * Returns rules for (nodeType, attr), aggregating:
     * <ul>
     *   <li>rules keyed under this node type;</li>
     *   <li>rules keyed under any ancestor type — an inherited attribute carries its
     *       rules under the owning ancestor (e.g. {@code nt-part} for an {@code nt-assembly} node);</li>
     *   <li>rules attached with the {@code *} (any node type) wildcard — domain attributes.</li>
     * </ul>
     */
    private List<ResolvedValidator> lookup(String nodeTypeId, String attrCode) {
        cacheLock.readLock().lock();
        try {
            List<ResolvedValidator> out = new ArrayList<>();
            for (String typeId : nodeTypeChain(nodeTypeId)) {
                out.addAll(validatorCache.getOrDefault(typeId + ":" + attrCode, List.of()));
            }
            out.addAll(validatorCache.getOrDefault("*:" + attrCode, List.of()));
            return out;
        } finally {
            cacheLock.readLock().unlock();
        }
    }

    /** Node type + its ancestor chain (self first). Empty when nodeTypeId is null. */
    private List<String> nodeTypeChain(String nodeTypeId) {
        if (nodeTypeId == null) return List.of();
        return configCache.getNodeType(nodeTypeId)
            .map(nt -> nt.ancestorChain() != null && !nt.ancestorChain().isEmpty()
                ? nt.ancestorChain() : List.of(nodeTypeId))
            .orElse(List.of(nodeTypeId));
    }

    private static boolean appliesToState(ResolvedValidator rv, String stateId) {
        // "*" = all states (sentinel must not collide with the "__" separator).
        return "*".equals(rv.stateId()) || rv.stateId().equals(stateId);
    }

    private static GuardEffect parseEffect(String value) {
        try {
            return GuardEffect.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException e) {
            return GuardEffect.BLOCK;
        }
    }

    record ResolvedValidator(
        String stateId,
        String instanceId,
        AttributeValidator bean,
        GuardEffect effect,
        Map<String, String> params
    ) {}
}
