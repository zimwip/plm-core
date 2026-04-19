package com.plm.node.signature.internal.guard;
import com.plm.action.guard.ActionGuardContext;

import com.plm.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;
import com.plm.node.version.internal.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.List;

/**
 * Action Guard: user must not have already signed current revision.iteration.
 * Attached to SIGN by default.
 */
@AlgorithmBean(code = "not_already_signed", name = "Not Already Signed", description = "User must not have already signed current revision.iteration")
@RequiredArgsConstructor
public class NotAlreadySignedGuard implements ActionGuard {

    private final DSLContext     dsl;
    private final VersionService versionService;

    @Override
    public String code() { return "not_already_signed"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
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
