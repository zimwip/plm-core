package com.plm.node.metamodel.internal;

import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.AttributeConfig;
import com.plm.platform.config.dto.DomainConfig;
import com.plm.platform.config.dto.EnumDefinitionConfig;
import com.plm.platform.config.dto.EnumValueConfig;
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
            .map(this::toResolvedNodeType)
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
            .map(this::toResolvedAttribute)
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
    public void invalidate() {
        // No-op: ConfigCache lifecycle is managed by psm-admin push notifications
        log.debug("ConfigCacheAdapter.invalidate() called — no-op (push-based)");
    }

    // ── Conversion helpers ────────────────────────────────────────────

    private ResolvedNodeType toResolvedNodeType(NodeTypeConfig nt) {
        List<ResolvedAttribute> attrs = nt.attributes() != null
            ? nt.attributes().stream().map(this::toResolvedAttribute).toList()
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

    private ResolvedAttribute toResolvedAttribute(AttributeConfig attr) {
        return new ResolvedAttribute(
            attr.id(),
            attr.name(),
            attr.label(),
            attr.dataType(),
            attr.widgetType(),
            attr.defaultValue(),
            resolveAllowedValues(attr),
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

    /**
     * ENUM value list as JSON {@code [{"value","label"}]}, reconstructed from the
     * enum tables by {@code enumDefinitionId}. {@code allowed_values} was dropped as a
     * column; the enum definition is the single source of truth. Returns the raw
     * {@code allowedValues} (legacy/explicit) as a fallback when no enum is attached.
     */
    private String resolveAllowedValues(AttributeConfig attr) {
        String enumDefId = attr.enumDefinitionId();
        if (enumDefId == null || enumDefId.isBlank()) return attr.allowedValues();
        EnumDefinitionConfig def = configCache.getEnumDefinition(enumDefId).orElse(null);
        if (def == null || def.values() == null || def.values().isEmpty()) return attr.allowedValues();

        StringBuilder sb = new StringBuilder("[");
        boolean first = true;
        for (EnumValueConfig v : def.values()) {
            if (!first) sb.append(",");
            first = false;
            sb.append("{\"value\":\"").append(escape(v.value())).append("\"");
            if (v.label() != null && !v.label().isBlank()) {
                sb.append(",\"label\":\"").append(escape(v.label())).append("\"");
            }
            sb.append("}");
        }
        return sb.append("]").toString();
    }

    private static String escape(String s) {
        return s == null ? "" : s.replace("\"", "\\\"");
    }
}
