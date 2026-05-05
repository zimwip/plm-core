package com.plm.node.signature.internal.guard;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.lifecycle.internal.guard.LifecycleGuard;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardContext;
import com.plm.platform.config.ConfigCache;
import com.plm.platform.config.dto.LifecycleConfig;
import com.plm.platform.config.dto.LifecycleTransitionConfig;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.node.version.internal.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.List;
import java.util.Map;

/**
 * Lifecycle Guard: all required signatures must be collected on the current version.
 *
 * Signatures are valid only for the current (frozen) version — not aggregated
 * across iterations. After release (new revision), the slate resets.
 */
@AlgorithmBean(code = "all_signatures_done", name = "All Signatures Done", description = "All required signatures must be collected")
@RequiredArgsConstructor
public class AllSignaturesDoneGuard implements LifecycleGuard {

    private final DSLContext     dsl;  // kept for node_signature (business table)
    private final ConfigCache    configCache;
    private final VersionService versionService;

    @Override
    public String code() { return "all_signatures_done"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        // Count required signatures from ConfigCache
        int required = countSignatureRequirements(ctx.transitionId());
        if (required == 0) return List.of();

        Record current = versionService.getCurrentVersion(ctx.nodeId());
        if (current == null) return List.of(new GuardViolation(code(),
            "No current version found", GuardEffect.BLOCK));

        String currentVersionId = current.get("id", String.class);

        Record signedRow = dsl.fetchOne(
            "SELECT COUNT(DISTINCT ns.signed_by) AS cnt FROM node_signature ns " +
            "WHERE ns.node_version_id = ?",
            currentVersionId);
        long signed = signedRow != null ? signedRow.get("cnt", Long.class) : 0L;

        if (signed < required) {
            return List.of(new GuardViolation(code(),
                String.format("Missing signatures: %d of %d required signature(s) collected", signed, required),
                GuardEffect.BLOCK, null,
                Map.of("signed", signed, "required", required)));
        }
        return List.of();
    }

    private int countSignatureRequirements(String transitionId) {
        for (LifecycleConfig lc : configCache.getAllLifecycles()) {
            if (lc.transitions() == null) continue;
            for (LifecycleTransitionConfig t : lc.transitions()) {
                if (transitionId.equals(t.id())) {
                    return t.signatureRequirements() != null ? t.signatureRequirements().size() : 0;
                }
            }
        }
        return 0;
    }
}
