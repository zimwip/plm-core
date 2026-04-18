package com.plm.domain.guard.impl;

import com.plm.domain.algorithm.AlgorithmBean;
import com.plm.domain.guard.Guard;
import com.plm.domain.guard.GuardContext;
import com.plm.domain.guard.GuardEffect;
import com.plm.domain.guard.GuardViolation;
import com.plm.domain.service.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.List;

/**
 * Action Guard: user must not have already signed current revision.iteration.
 * Attached to SIGN by default.
 */
@AlgorithmBean(code = "not_already_signed", type = "ACTION_GUARD")
@RequiredArgsConstructor
public class NotAlreadySignedGuard implements Guard {

    private final DSLContext     dsl;
    private final VersionService versionService;

    @Override
    public String code() { return "not_already_signed"; }

    @Override
    public List<GuardViolation> evaluate(GuardContext ctx) {
        if (ctx.nodeId() == null) return List.of();

        Record current = versionService.getCurrentVersion(ctx.nodeId());
        if (current == null) return List.of();

        boolean alreadySigned = dsl.fetchCount(dsl.selectOne()
            .from("node_signature ns")
            .join("node_version nv").on("ns.node_version_id = nv.id")
            .join("plm_transaction pt").on("pt.id = nv.tx_id")
            .where("ns.node_id   = ?", ctx.nodeId())
            .and  ("ns.signed_by = ?", ctx.currentUserId())
            .and  ("pt.status    = 'COMMITTED'")
            .and  ("nv.version_number = (" +
                   "SELECT MAX(nv2.version_number) FROM node_version nv2 " +
                   "JOIN plm_transaction pt2 ON pt2.id = nv2.tx_id " +
                   "WHERE nv2.node_id = ? AND pt2.status = 'COMMITTED')", ctx.nodeId())
        ) > 0;

        if (alreadySigned) {
            return List.of(new GuardViolation(code(),
                "You have already signed the current revision",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
