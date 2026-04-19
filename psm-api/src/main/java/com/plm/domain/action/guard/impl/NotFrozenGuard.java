package com.plm.domain.action.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.algorithm.AlgorithmParam;
import com.plm.domain.action.guard.ActionGuard;
import com.plm.domain.action.guard.ActionGuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;
import com.plm.domain.metadata.Metadata;
import com.plm.domain.metadata.MetadataService;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * Action Guard: node must not be in a lifecycle state that has a given
 * metadata key set to "true".
 *
 * Parameterized via algorithm instance parameter {@code meta_key}
 * (defaults to "frozen"). Attached to CHECKOUT by default.
 */
@Metadata(key = "frozen", target = "LIFECYCLE_STATE",
    description = "Blocks content modifications (checkout, attribute changes)")
@AlgorithmBean(code = "not_frozen",
    name = "Not Frozen",
    description = "Node must not be in a frozen lifecycle state")
@AlgorithmParam(name = "meta_key", label = "Metadata Key", dataType = "STRING",
    required = true, defaultValue = "frozen", displayOrder = 1)
@RequiredArgsConstructor
public class NotFrozenGuard implements ActionGuard {

    private final MetadataService metadataService;

    @Override
    public String code() { return "not_frozen"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.currentStateId() == null) return List.of();

        String metaKey = ctx.parameters().getOrDefault("meta_key", "frozen");

        if (metadataService.isTrue("LIFECYCLE_STATE", ctx.currentStateId(), metaKey)) {
            return List.of(new GuardViolation(code(),
                "Node is in a '" + metaKey + "' state — content modifications are not allowed",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
