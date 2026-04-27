package com.plm.node.metamodel.internal;

import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.AttributeConfig;
import com.plm.platform.config.dto.AttributeStateRuleConfig;
import com.plm.platform.config.dto.DomainConfig;
import com.plm.platform.config.dto.NodeTypeConfig;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.model.ResolvedNodeType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * MetaModelCachePort implementation backed by {@link ConfigCache} from platform-lib.
 * Reads config snapshots pushed by psm-admin.
 *
 * <p>Converts platform-lib DTOs ({@link NodeTypeConfig}, {@link AttributeConfig})
 * to psm-api model types ({@link ResolvedNodeType}, {@link ResolvedAttribute}).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ConfigCacheAdapter implements MetaModelCachePort {

    private final ConfigCache configCache;

    @Override
    public ResolvedNodeType get(String nodeTypeId) {
        return configCache.getNodeType(nodeTypeId)
            .map(ConfigCacheAdapter::toResolvedNodeType)
            .orElse(null);
    }

    @Override
    public Map<String, ResolvedNodeType> getAll() {
        Map<String, ResolvedNodeType> result = new LinkedHashMap<>();
        for (NodeTypeConfig nt : configCache.getAllNodeTypes()) {
            result.put(nt.id(), toResolvedNodeType(nt));
        }
        return Collections.unmodifiableMap(result);
    }

    @Override
    public List<ResolvedAttribute> getDomainAttributes(String domainId) {
        return configCache.getDomainAttributes(domainId).stream()
            .map(ConfigCacheAdapter::toResolvedAttribute)
            .toList();
    }

    @Override
    public Map<String, DomainInfo> getAllDomainInfos() {
        Map<String, DomainInfo> result = new LinkedHashMap<>();
        for (DomainConfig d : configCache.getAllDomains()) {
            result.put(d.id(), new DomainInfo(
                d.id(), d.name(), d.description(), d.color(), d.icon()
            ));
        }
        return Collections.unmodifiableMap(result);
    }

    @Override
    public StateRuleInfo getStateRuleInfo(String contextNodeTypeId, String attrDefId, String stateId) {
        if (stateId == null || attrDefId == null) return null;

        // 1. Context type override
        Optional<AttributeStateRuleConfig> rule = configCache.getStateRule(contextNodeTypeId, attrDefId, stateId);
        if (rule.isPresent()) return toStateRuleInfo(rule.get());

        // 2. Fall back to owner type's rule (inherited attrs)
        ResolvedNodeType nt = get(contextNodeTypeId);
        if (nt != null) {
            String ownerTypeId = nt.attributes().stream()
                .filter(a -> a.id().equals(attrDefId))
                .map(ResolvedAttribute::ownerNodeTypeId)
                .findFirst().orElse(null);
            if (ownerTypeId != null && !ownerTypeId.equals(contextNodeTypeId)) {
                rule = configCache.getStateRule(ownerTypeId, attrDefId, stateId);
                if (rule.isPresent()) return toStateRuleInfo(rule.get());
            }
        }

        // 3. Fall back to domain-level default (nodeTypeId == null)
        // ConfigCache stores state rules with nodeTypeId — domain-level defaults have null nodeTypeId.
        // The ConfigCache.getStateRule() uses composite key nodeTypeId:attrDefId:stateId.
        // For null nodeTypeId, we look up with "null" key.
        rule = configCache.getStateRule("null", attrDefId, stateId);
        if (rule.isPresent()) return toStateRuleInfo(rule.get());

        return null;
    }

    @Override
    public void invalidate() {
        // No-op: ConfigCache lifecycle is managed by psm-admin push notifications
        log.debug("ConfigCacheAdapter.invalidate() called — no-op (push-based)");
    }

    // ── Conversion helpers ────────────────────────────────────────────

    private static ResolvedNodeType toResolvedNodeType(NodeTypeConfig nt) {
        List<ResolvedAttribute> attrs = nt.attributes() != null
            ? nt.attributes().stream().map(ConfigCacheAdapter::toResolvedAttribute).toList()
            : List.of();
        return new ResolvedNodeType(
            nt.id(),
            nt.name(),
            nt.description(),
            nt.lifecycleId(),
            nt.logicalIdLabel(),
            nt.logicalIdPattern(),
            nt.numberingScheme(),
            nt.versionPolicy(),
            nt.collapseHistory(),
            nt.color(),
            nt.icon(),
            nt.parentNodeTypeId(),
            nt.ancestorChain() != null ? nt.ancestorChain() : List.of(),
            attrs
        );
    }

    private static ResolvedAttribute toResolvedAttribute(AttributeConfig attr) {
        return new ResolvedAttribute(
            attr.id(),
            attr.name(),
            attr.label(),
            attr.dataType(),
            attr.widgetType(),
            attr.required(),
            attr.defaultValue(),
            attr.namingRegex(),
            attr.allowedValues(),
            attr.enumDefinitionId(),
            attr.displayOrder(),
            attr.displaySection(),
            attr.tooltip(),
            attr.asName(),
            attr.inherited(),
            attr.inheritedFrom(),
            attr.ownerNodeTypeId(),
            attr.sourceDomainId(),
            attr.sourceDomainName()
        );
    }

    private static StateRuleInfo toStateRuleInfo(AttributeStateRuleConfig rule) {
        return new StateRuleInfo(rule.required(), rule.editable(), rule.visible());
    }
}
