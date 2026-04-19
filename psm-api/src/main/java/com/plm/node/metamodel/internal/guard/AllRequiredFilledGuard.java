package com.plm.node.metamodel.internal.guard;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.lifecycle.internal.guard.LifecycleGuard;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardContext;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;
import com.plm.shared.model.ResolvedAttribute;
import com.plm.node.metamodel.internal.MetaModelCache;
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
    private final VersionService versionService;
    private final MetaModelCache metaModelCache;

    @Override
    public String code() { return "all_required_filled"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        // Resolve target state from transition
        String toStateId = dsl.select().from("lifecycle_transition")
            .where("id = ?", ctx.transitionId())
            .fetchOne("to_state_id", String.class);
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

        List<GuardViolation> violations = new ArrayList<>();
        for (ResolvedAttribute attr : resolvedType.attributes()) {
            Record rule = metaModelCache.getStateRule(nodeTypeId, attr.id(), toStateId);
            if (rule == null || rule.get("required", Integer.class) != 1) continue;
            String value = currentValues.get(attr.id());
            if (value == null || value.isBlank()) {
                violations.add(new GuardViolation(code(),
                    "Required field '" + attr.label() + "' is empty",
                    GuardEffect.BLOCK, attr.name()));
            }
        }
        return violations;
    }
}
