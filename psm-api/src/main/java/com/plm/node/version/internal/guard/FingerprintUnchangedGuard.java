package com.plm.node.version.internal.guard;
import com.plm.action.guard.ActionGuardContext;

import com.plm.algorithm.AlgorithmBean;
import com.plm.action.guard.ActionGuard;
import com.plm.shared.guard.GuardEffect;
import com.plm.shared.guard.GuardViolation;
import com.plm.node.version.internal.FingerPrintService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;
import org.jooq.impl.DSL;

import java.util.List;

/**
 * Action Guard: blocks action when the current OPEN version has no real changes
 * compared to the previous version (fingerprint unchanged).
 * Attached to CHECKIN by default with BLOCK effect.
 */
@AlgorithmBean(code = "fingerprint_unchanged", name = "Fingerprint Unchanged", description = "Content fingerprint has not changed since last commit")
@RequiredArgsConstructor
public class FingerprintUnchangedGuard implements ActionGuard {

    private final DSLContext dsl;
    private final FingerPrintService fingerPrintService;

    @Override
    public String code() { return "fingerprint_unchanged"; }

    @Override
    public List<GuardViolation> evaluate(ActionGuardContext ctx) {
        if (ctx.nodeId() == null) return List.of();

        Record openVersion = dsl.fetchOne(
            "SELECT nv.id, nv.previous_version_id " +
            "FROM node_version nv " +
            "JOIN plm_transaction pt ON pt.id = nv.tx_id " +
            "WHERE nv.node_id = ? AND pt.status = 'OPEN' " +
            "ORDER BY nv.version_number DESC LIMIT 1", ctx.nodeId());

        if (openVersion == null) return List.of();

        String previousVersionId = openVersion.get("previous_version_id", String.class);
        if (previousVersionId == null) return List.of(); // first version — no comparison

        String openVersionId = openVersion.get("id", String.class);
        String currentFp = fingerPrintService.compute(ctx.nodeId(), openVersionId);

        String previousFp = dsl.select(DSL.field("fingerprint")).from("node_version")
            .where("id = ?", previousVersionId)
            .fetchOne(DSL.field("fingerprint"), String.class);

        if (previousFp != null && previousFp.equals(currentFp)) {
            return List.of(new GuardViolation(code(),
                "No changes detected — version content is identical to the previous version",
                GuardEffect.BLOCK));
        }
        return List.of();
    }
}
