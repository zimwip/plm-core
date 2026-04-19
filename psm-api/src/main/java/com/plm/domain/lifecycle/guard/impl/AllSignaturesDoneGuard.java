package com.plm.domain.lifecycle.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.lifecycle.guard.LifecycleGuard;
import com.plm.domain.lifecycle.guard.LifecycleGuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;
import com.plm.domain.service.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.List;
import java.util.Map;

/**
 * Lifecycle Guard: all required signatures must be collected.
 *
 * Checks signature_requirement rows for the transition and compares
 * with distinct committed signatories on the current revision.iteration.
 */
@AlgorithmBean(code = "all_signatures_done", name = "All Signatures Done", description = "All required signatures must be collected")
@RequiredArgsConstructor
public class AllSignaturesDoneGuard implements LifecycleGuard {

    private final DSLContext     dsl;
    private final VersionService versionService;

    @Override
    public String code() { return "all_signatures_done"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        if (ctx.transitionId() == null) return List.of();

        int required = dsl.fetchCount(dsl.selectOne()
            .from("signature_requirement")
            .where("lifecycle_transition_id = ?", ctx.transitionId()));
        if (required == 0) return List.of();

        Record current = versionService.getCurrentVersion(ctx.nodeId());
        if (current == null) return List.of(new GuardViolation(code(),
            "No current version found", GuardEffect.BLOCK));

        String revision  = current.get("revision",  String.class);
        int    iteration = current.get("iteration", Integer.class);

        Record signedRow = dsl.fetchOne(
            "SELECT COUNT(DISTINCT ns.signed_by) AS cnt FROM node_signature ns " +
            "JOIN node_version nv ON ns.node_version_id = nv.id " +
            "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
            "WHERE ns.node_id = ? AND nv.revision = ? AND nv.iteration = ? AND pt.status = 'COMMITTED'",
            ctx.nodeId(), revision, iteration);
        long signed = signedRow != null ? signedRow.get("cnt", Long.class) : 0L;

        if (signed < required) {
            return List.of(new GuardViolation(code(),
                String.format("Missing signatures: %d of %d required signature(s) collected", signed, required),
                GuardEffect.BLOCK, null,
                Map.of("signed", signed, "required", required)));
        }
        return List.of();
    }
}
