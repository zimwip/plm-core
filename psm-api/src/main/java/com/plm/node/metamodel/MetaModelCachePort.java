package com.plm.node.metamodel;

import com.plm.shared.model.ResolvedAttribute;
import com.plm.shared.model.ResolvedNodeType;

import java.util.List;
import java.util.Map;

/**
 * Port for metamodel cache — abstracts the source of resolved node types,
 * domain attributes, and state rules.
 *
 * <p>Implementation: {@code ConfigCacheAdapter} backed by {@code ConfigCache}
 * from platform-lib, populated by psm-admin config snapshots.
 */
public interface MetaModelCachePort {

    /** Get a resolved node type by ID, or null if not found. */
    ResolvedNodeType get(String nodeTypeId);

    /** Get all resolved node types keyed by ID. */
    Map<String, ResolvedNodeType> getAll();

    /** Get resolved attributes for a domain. */
    List<ResolvedAttribute> getDomainAttributes(String domainId);

    /** Domain info record (simplified from JOOQ Record). */
    record DomainInfo(String id, String name, String description, String color, String icon) {}

    /** All domain infos keyed by ID. */
    Map<String, DomainInfo> getAllDomainInfos();

    /** State rule info (simplified from JOOQ Record). */
    record StateRuleInfo(boolean required, boolean editable, boolean visible) {}

    /**
     * Returns the most specific state rule for a (contextNodeTypeId, attrDefId, stateId) triple.
     * Returns null if no rule exists.
     */
    StateRuleInfo getStateRuleInfo(String contextNodeTypeId, String attrDefId, String stateId);

    /** Invalidates the cache; next access triggers a rebuild. No-op for push-based implementations. */
    void invalidate();
}
