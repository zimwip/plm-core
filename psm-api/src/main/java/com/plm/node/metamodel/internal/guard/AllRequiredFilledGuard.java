package com.plm.node.metamodel.internal.guard;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.lifecycle.internal.guard.LifecycleGuard;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardContext;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.node.metamodel.MetaModelCachePort;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.node.version.internal.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lifecycle Guard: all required attributes for the target state must have values.
 *
 * Checks attribute values against the target state's attribute_state_rule.
 * Returns one violation per missing required field.
 */
@AlgorithmBean(code = "all_required_filled", name = "All Required Filled", description = "All required attributes for target state must have values")
@RequiredArgsConstructor
public class AllRequiredFilledGuard implements LifecycleGuard {

    private final DSLContext     dsl;
    private final ConfigCache    configCache;
    private final VersionService versionService;
    private final MetaModelCachePort metaModelCache;

    @Override
    public String code() { return "all_required_filled"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        // Resolve target state from transition via ConfigCache
        String toStateId = findTransitionToState(ctx.transitionId());
        if (toStateId == null) return List.of();

        String nodeTypeId = ctx.nodeTypeId() != null ? ctx.nodeTypeId()
            : dsl.select().from("node").where("id = ?", ctx.nodeId())
                  .fetchOne("node_type_id", String.class);
        if (nodeTypeId == null) return List.of();

        Record current = versionService.getCurrentVersion(ctx.nodeId());
        if (current == null) return List.of();

        String currentVersionId = current.get("id", String.class);
        Map<String, String> currentValues = new HashMap<>();
        dsl.select().from("node_version_attribute")
           .where("node_version_id = ?", currentVersionId)
           .fetch()
           .forEach(r -> currentValues.put(
               r.get("attribute_def_id", String.class),
               r.get("value", String.class)));

        var resolvedType = metaModelCache.get(nodeTypeId);
        if (resolvedType == null) return List.of();

        // Collect all effective attributes: node_type + domains
        List<ResolvedAttribute> allAttrs = new ArrayList<>(resolvedType.attributes());
        dsl.select().from("node_version_domain").where("node_version_id = ?", currentVersionId)
           .fetch().forEach(r -> allAttrs.addAll(
               metaModelCache.getDomainAttributes(r.get("domain_id", String.class))));

        List<GuardViolation> violations = new ArrayList<>();
        for (ResolvedAttribute attr : allAttrs) {
            MetaModelCachePort.StateRuleInfo rule = metaModelCache.getStateRuleInfo(nodeTypeId, attr.id(), toStateId);
            if (rule == null || !rule.required()) continue;
            String value = currentValues.get(attr.id());
            if (value == null || value.isBlank()) {
                String label = (attr.label() != null && !attr.label().isBlank())
                    ? attr.label() : attr.id();
                violations.add(new GuardViolation(code(),
                    "Required field '" + label + "' is empty",
                    GuardEffect.BLOCK, attr.id()));
            }
        }
        return violations;
    }

    private String findTransitionToState(String transitionId) {
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.transitions() == null) continue;
            for (LifecycleTransitionConfig tr : lc.transitions()) {
                if (transitionId.equals(tr.id())) {
                    return tr.toStateId();
                }
            }
        }
        return null;
    }
}
