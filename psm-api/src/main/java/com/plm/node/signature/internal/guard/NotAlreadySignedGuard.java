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
 * Action Guard: user must not have already signed the current version.
 * Signatures are per-version — not aggregated across iterations.
 */
@AlgorithmBean(code = "not_already_signed", name = "Not Already Signed", description = "User must not have already signed current version")
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

        String currentVersionId = current.get("id", String.class);

        boolean alreadySigned = dsl.fetchCount(dsl.selectOne()
            .from("node_signature ns")
            .where("ns.node_id   = ?", ctx.nodeId())
            .and  ("ns.signed_by = ?", ctx.currentUserId())
            .and  ("ns.node_version_id = ?", currentVersionId)
        ) > 0;

        if (alreadySigned) {
            return List.of(new GuardViolation(code(),
                "You have already signed the current version",
                GuardEffect.HIDE));
        }
        return List.of();
    }
}
