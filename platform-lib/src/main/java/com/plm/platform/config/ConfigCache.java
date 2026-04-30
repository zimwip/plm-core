package com.plm.platform.config;

import com.plm.platform.config.dto.*;
import lombok.extern.slf4j.Slf4j;

import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Client-side in-memory cache for PSM configuration, populated by push
 * notifications from psm-admin and an initial pull after registration.
 * Thread-safe, versioned, rejects stale snapshots.
 * <p>
 * Mirrors {@code LocalServiceRegistry} pattern but for metamodel/config data.
 * Replaces MetaModelCache + all other admin DB reads in psm-data.
 */
@Slf4j
public class ConfigCache {

    private final AtomicReference<ConfigSnapshot> snapshot = new AtomicReference<>();
    private final CountDownLatch populated = new CountDownLatch(1);
    private volatile long snapshotVersion = -1;

    // --- Indexed lookups (rebuilt on each snapshot update) ---
    private volatile Map<String, NodeTypeConfig> nodeTypesById = Map.of();
    private volatile Map<String, LifecycleConfig> lifecyclesById = Map.of();
    private volatile Map<String, LinkTypeConfig> linkTypesById = Map.of();
    private volatile Map<String, ActionConfig> actionsByCode = Map.of();
    private volatile Map<String, ActionConfig> actionsById = Map.of();
    private volatile Map<String, PermissionConfig> permissionsByCode = Map.of();
    private volatile Map<String, AlgorithmConfig> algorithmsByCode = Map.of();
    private volatile Map<String, AlgorithmInstanceConfig> instancesById = Map.of();
    private volatile Map<String, DomainConfig> domainsById = Map.of();
    private volatile Map<String, EnumDefinitionConfig> enumsById = Map.of();
    private volatile Map<String, SourceConfig> sourcesById = Map.of();

    // Authorization policies
    private volatile List<AuthorizationPolicyConfig> authorizationPolicies = List.of();

    // Composite key indexes: "nodeTypeId:attrDefId:stateId" → rule
    private volatile Map<String, AttributeStateRuleConfig> stateRuleIndex = Map.of();
    // "nodeTypeId" → list of views
    private volatile Map<String, List<AttributeViewConfig>> viewsByNodeType = Map.of();
    // "stateId" → list of state actions (tier 1 only, nodeTypeId == null)
    private volatile Map<String, List<StateActionConfig>> stateActionsByState = Map.of();
    // "nodeTypeId:stateId" → list of state actions (tier 2, with nodeTypeId)
    private volatile Map<String, List<StateActionConfig>> nodeTypeStateActions = Map.of();
    // "actionId" → list of guards
    private volatile Map<String, List<ActionGuardConfig>> guardsByAction = Map.of();
    // "transitionId" → list of transition guards
    private volatile Map<String, List<TransitionGuardConfig>> guardsByTransition = Map.of();
    // "nodeTypeId:actionId" or "nodeTypeId:actionId:transitionId" → list of node action guards
    private volatile Map<String, List<NodeActionGuardConfig>> nodeActionGuardIndex = Map.of();

    /**
     * Update cache from a new snapshot. Rejects stale snapshots (version <= current).
     */
    public synchronized void updateFromSnapshot(ConfigSnapshot newSnapshot) {
        if (newSnapshot == null) return;
        if (newSnapshot.version() <= snapshotVersion) {
            log.debug("Ignoring stale config snapshot v{} (current v{})", newSnapshot.version(), snapshotVersion);
            return;
        }
        applySnapshot(newSnapshot);
        log.info("Config cache updated to v{} ({} nodeTypes, {} lifecycles, {} actions, {} algorithms)",
            snapshotVersion,
            nodeTypesById.size(), lifecyclesById.size(),
            actionsByCode.size(), algorithmsByCode.size());
    }

    /**
     * Load snapshot without version check (for tests).
     */
    public synchronized void loadFromSnapshot(ConfigSnapshot newSnapshot) {
        if (newSnapshot == null) return;
        applySnapshot(newSnapshot);
        log.debug("Config cache force-loaded v{}", snapshotVersion);
    }

    private void applySnapshot(ConfigSnapshot newSnapshot) {
        snapshotVersion = newSnapshot.version();
        snapshot.set(newSnapshot);
        rebuildIndexes(newSnapshot);
        populated.countDown();
    }

    private void rebuildIndexes(ConfigSnapshot s) {
        // Node types
        nodeTypesById = indexBy(s.nodeTypes(), NodeTypeConfig::id);

        // Lifecycles
        lifecyclesById = indexBy(s.lifecycles(), LifecycleConfig::id);

        // Link types
        linkTypesById = indexBy(s.linkTypes(), LinkTypeConfig::id);

        // Actions (by code and by id)
        actionsByCode = indexBy(s.actions(), ActionConfig::actionCode);
        actionsById = indexBy(s.actions(), ActionConfig::id);

        // Permissions
        permissionsByCode = indexBy(s.permissions(), PermissionConfig::permissionCode);

        // Algorithms + instances
        algorithmsByCode = indexBy(s.algorithms(), AlgorithmConfig::code);
        Map<String, AlgorithmInstanceConfig> instMap = new HashMap<>();
        if (s.algorithms() != null) {
            for (AlgorithmConfig alg : s.algorithms()) {
                if (alg.instances() != null) {
                    for (AlgorithmInstanceConfig inst : alg.instances()) {
                        instMap.put(inst.id(), inst);
                    }
                }
            }
        }
        instancesById = Map.copyOf(instMap);

        // Domains
        domainsById = indexBy(s.domains(), DomainConfig::id);

        // Enums
        enumsById = indexBy(s.enums(), EnumDefinitionConfig::id);

        // Sources
        sourcesById = indexBy(s.sources(), SourceConfig::id);

        // Authorization policies
        authorizationPolicies = s.authorizationPolicies() != null
            ? List.copyOf(s.authorizationPolicies()) : List.of();

        // State rules: composite key nodeTypeId:attrDefId:stateId
        Map<String, AttributeStateRuleConfig> ruleMap = new HashMap<>();
        if (s.nodeTypes() != null) {
            for (NodeTypeConfig nt : s.nodeTypes()) {
                if (nt.stateRules() != null) {
                    for (AttributeStateRuleConfig rule : nt.stateRules()) {
                        String key = rule.nodeTypeId() + ":" + rule.attributeDefinitionId() + ":" + rule.lifecycleStateId();
                        ruleMap.put(key, rule);
                    }
                }
            }
        }
        stateRuleIndex = Map.copyOf(ruleMap);

        // Action guards by actionId
        Map<String, List<ActionGuardConfig>> gByAction = new HashMap<>();
        if (s.actions() != null) {
            for (ActionConfig action : s.actions()) {
                if (action.guards() != null && !action.guards().isEmpty()) {
                    gByAction.put(action.id(), List.copyOf(action.guards()));
                }
            }
        }
        guardsByAction = Map.copyOf(gByAction);

        // Transition guards by transitionId
        Map<String, List<TransitionGuardConfig>> gByTransition = new HashMap<>();
        if (s.lifecycles() != null) {
            for (LifecycleConfig lc : s.lifecycles()) {
                if (lc.transitions() != null) {
                    for (LifecycleTransitionConfig tr : lc.transitions()) {
                        if (tr.guards() != null && !tr.guards().isEmpty()) {
                            gByTransition.put(tr.id(), List.copyOf(tr.guards()));
                        }
                    }
                }
            }
        }
        guardsByTransition = Map.copyOf(gByTransition);

        // Views by node type
        Map<String, List<AttributeViewConfig>> vByNt = new HashMap<>();
        if (s.attributeViews() != null) {
            for (AttributeViewConfig v : s.attributeViews()) {
                if (v.nodeTypeId() != null) {
                    vByNt.computeIfAbsent(v.nodeTypeId(), k -> new ArrayList<>()).add(v);
                }
            }
        }
        viewsByNodeType = Map.copyOf(vByNt);

        // State actions: tier 1 (nodeTypeId == null) by stateId
        Map<String, List<StateActionConfig>> saByState = new HashMap<>();
        Map<String, List<StateActionConfig>> ntSa = new HashMap<>();
        if (s.stateActions() != null) {
            for (StateActionConfig sa : s.stateActions()) {
                if (sa.nodeTypeId() == null) {
                    saByState.computeIfAbsent(sa.lifecycleStateId(), k -> new ArrayList<>()).add(sa);
                } else {
                    String key = sa.nodeTypeId() + ":" + sa.lifecycleStateId();
                    ntSa.computeIfAbsent(key, k -> new ArrayList<>()).add(sa);
                }
            }
        }
        stateActionsByState = Map.copyOf(saByState);
        nodeTypeStateActions = Map.copyOf(ntSa);

        // Node action guards
        Map<String, List<NodeActionGuardConfig>> nagIdx = new HashMap<>();
        if (s.nodeActionGuards() != null) {
            for (NodeActionGuardConfig nag : s.nodeActionGuards()) {
                // Index by nodeTypeId:actionId
                String shortKey = nag.nodeTypeId() + ":" + nag.actionId();
                nagIdx.computeIfAbsent(shortKey, k -> new ArrayList<>()).add(nag);
                // Also index by nodeTypeId:actionId:transitionId if transition present
                if (nag.transitionId() != null) {
                    String fullKey = shortKey + ":" + nag.transitionId();
                    nagIdx.computeIfAbsent(fullKey, k -> new ArrayList<>()).add(nag);
                }
            }
        }
        nodeActionGuardIndex = Map.copyOf(nagIdx);
    }

    // ---- Typed accessors ----

    /** Get node type by id, or empty if not found. */
    public Optional<NodeTypeConfig> getNodeType(String id) {
        return Optional.ofNullable(nodeTypesById.get(id));
    }

    /** All node types (unmodifiable). */
    public List<NodeTypeConfig> getAllNodeTypes() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.nodeTypes() != null ? s.nodeTypes() : List.of();
    }

    /** Get lifecycle by id. */
    public Optional<LifecycleConfig> getLifecycle(String id) {
        return Optional.ofNullable(lifecyclesById.get(id));
    }

    /** All lifecycles. */
    public List<LifecycleConfig> getAllLifecycles() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.lifecycles() != null ? s.lifecycles() : List.of();
    }

    /** Get link type by id. */
    public Optional<LinkTypeConfig> getLinkType(String id) {
        return Optional.ofNullable(linkTypesById.get(id));
    }

    /** All link types. */
    public List<LinkTypeConfig> getAllLinkTypes() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.linkTypes() != null ? s.linkTypes() : List.of();
    }

    /** Get action by action code. */
    public Optional<ActionConfig> getAction(String actionCode) {
        return Optional.ofNullable(actionsByCode.get(actionCode));
    }

    /** Get action by id. */
    public Optional<ActionConfig> getActionById(String actionId) {
        return Optional.ofNullable(actionsById.get(actionId));
    }

    /** All actions. */
    public List<ActionConfig> getAllActions() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.actions() != null ? s.actions() : List.of();
    }

    /** Get permission by code. */
    public Optional<PermissionConfig> getPermission(String code) {
        return Optional.ofNullable(permissionsByCode.get(code));
    }

    /** All permissions. */
    public List<PermissionConfig> getAllPermissions() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.permissions() != null ? s.permissions() : List.of();
    }

    /** All authorization policies. */
    public List<AuthorizationPolicyConfig> getAuthorizationPolicies() {
        return authorizationPolicies;
    }

    /** Get algorithm by code. */
    public Optional<AlgorithmConfig> getAlgorithm(String code) {
        return Optional.ofNullable(algorithmsByCode.get(code));
    }

    /** All algorithms. */
    public List<AlgorithmConfig> getAllAlgorithms() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.algorithms() != null ? s.algorithms() : List.of();
    }

    /** Get algorithm instance by id. */
    public Optional<AlgorithmInstanceConfig> getInstance(String instanceId) {
        return Optional.ofNullable(instancesById.get(instanceId));
    }

    /** Get domain by id. */
    public Optional<DomainConfig> getDomain(String id) {
        return Optional.ofNullable(domainsById.get(id));
    }

    /** All domains. */
    public List<DomainConfig> getAllDomains() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.domains() != null ? s.domains() : List.of();
    }

    /** Get attributes for a domain. */
    public List<AttributeConfig> getDomainAttributes(String domainId) {
        DomainConfig domain = domainsById.get(domainId);
        return domain != null && domain.attributes() != null ? domain.attributes() : List.of();
    }

    /** Get enum definition by id. */
    public Optional<EnumDefinitionConfig> getEnumDefinition(String id) {
        return Optional.ofNullable(enumsById.get(id));
    }

    /** All enum definitions. */
    public List<EnumDefinitionConfig> getAllEnumDefinitions() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.enums() != null ? s.enums() : List.of();
    }

    /** Get source by id (e.g. "SELF"). */
    public Optional<SourceConfig> getSource(String id) {
        return Optional.ofNullable(sourcesById.get(id));
    }

    /** All sources. */
    public List<SourceConfig> getAllSources() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.sources() != null ? s.sources() : List.of();
    }

    /** Resolve the algorithm code for a source's bound resolver, or empty if unknown. */
    public Optional<String> getResolverCodeForSource(String sourceId) {
        return getSource(sourceId).map(SourceConfig::resolverAlgorithmCode);
    }

    /** Get state rule for a specific context (nodeTypeId, attributeDefId, stateId). */
    public Optional<AttributeStateRuleConfig> getStateRule(String contextNodeTypeId, String attrDefId, String stateId) {
        String key = contextNodeTypeId + ":" + attrDefId + ":" + stateId;
        return Optional.ofNullable(stateRuleIndex.get(key));
    }

    /** Get attribute views for a node type. */
    public List<AttributeViewConfig> getAttributeViews(String nodeTypeId) {
        return viewsByNodeType.getOrDefault(nodeTypeId, List.of());
    }

    /** Get state actions for a lifecycle state (tier 1). */
    public List<StateActionConfig> getStateActions(String stateId) {
        return stateActionsByState.getOrDefault(stateId, List.of());
    }

    /** Get node-type-specific state actions (tier 2). */
    public List<StateActionConfig> getNodeTypeStateActions(String nodeTypeId, String stateId) {
        String key = nodeTypeId + ":" + stateId;
        return nodeTypeStateActions.getOrDefault(key, List.of());
    }

    /** Get action guards for an action. */
    public List<ActionGuardConfig> getActionGuards(String actionId) {
        return guardsByAction.getOrDefault(actionId, List.of());
    }

    /** Get transition guards for a transition. */
    public List<TransitionGuardConfig> getTransitionGuards(String transitionId) {
        return guardsByTransition.getOrDefault(transitionId, List.of());
    }

    /** Get node-type-specific action guards. */
    public List<NodeActionGuardConfig> getNodeActionGuards(String nodeTypeId, String actionId, String transitionId) {
        // Try with transition first, then without
        if (transitionId != null) {
            String fullKey = nodeTypeId + ":" + actionId + ":" + transitionId;
            List<NodeActionGuardConfig> result = nodeActionGuardIndex.get(fullKey);
            if (result != null) return result;
        }
        String shortKey = nodeTypeId + ":" + actionId;
        return nodeActionGuardIndex.getOrDefault(shortKey, List.of());
    }

    /** Entity metadata map. */
    public Map<String, String> getEntityMetadata() {
        ConfigSnapshot s = snapshot.get();
        return s != null && s.entityMetadata() != null ? s.entityMetadata() : Map.of();
    }

    /** The raw snapshot (may be null if never populated). */
    public ConfigSnapshot getSnapshot() {
        return snapshot.get();
    }

    /** Whether at least one snapshot has been received. */
    public boolean isPopulated() {
        return snapshotVersion >= 0;
    }

    /** Block until the cache is populated or timeout expires. */
    public boolean awaitPopulated(long timeout, TimeUnit unit) throws InterruptedException {
        return populated.await(timeout, unit);
    }

    /** Current snapshot version (-1 if never populated). */
    public long snapshotVersion() {
        return snapshotVersion;
    }

    // ---- Internal helpers ----

    private <T> Map<String, T> indexBy(List<T> items, java.util.function.Function<T, String> keyFn) {
        if (items == null || items.isEmpty()) return Map.of();
        Map<String, T> map = new HashMap<>(items.size());
        for (T item : items) {
            String key = keyFn.apply(item);
            if (key != null) {
                map.put(key, item);
            }
        }
        return Map.copyOf(map);
    }
}
