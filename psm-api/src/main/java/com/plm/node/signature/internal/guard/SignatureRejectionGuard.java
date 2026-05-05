package com.plm.node.signature.internal.guard;

import com.plm.algorithm.AlgorithmBean;
import com.plm.node.lifecycle.internal.guard.LifecycleGuard;
import com.plm.node.lifecycle.internal.guard.LifecycleGuardContext;
import com.plm.platform.action.guard.GuardEffect;
import com.plm.platform.action.guard.GuardViolation;
import com.plm.node.version.internal.VersionService;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Record;

import java.util.List;

/**
 * Lifecycle Guard: checks for rejected signatures on the current version.
 *
 * Two modes controlled by instance parameter {@code mode}:
 * <ul>
 *   <li>{@code NO_REJECTED} — blocks if any rejected signature exists (for Release)</li>
 *   <li>{@code HAS_REJECTED} — blocks if no rejected signature exists (for Unfreeze)</li>
 * </ul>
 */
@AlgorithmBean(code = "signature_rejection_check", name = "Signature Rejection Check",
    description = "Checks for rejected signatures on current version")
@RequiredArgsConstructor
public class SignatureRejectionGuard implements LifecycleGuard {

    private final DSLContext     dsl;
    private final VersionService versionService;

    @Override
    public String code() { return "signature_rejection_check"; }

    @Override
    public List<GuardViolation> evaluate(LifecycleGuardContext ctx) {
        String mode = ctx.parameters().getOrDefault("mode", "NO_REJECTED");

        Record current = versionService.getCurrentVersion(ctx.nodeId());
        if (current == null) return List.of();

        String currentVersionId = current.get("id", String.class);

        Record row = dsl.fetchOne(
            "SELECT COUNT(*) AS cnt FROM node_signature ns " +
            "WHERE ns.node_version_id = ? AND UPPER(ns.meaning) = 'REJECTED'",
            currentVersionId);
        long rejectedCount = row != null ? row.get("cnt", Long.class) : 0L;

        if ("NO_REJECTED".equals(mode)) {
            // Release: block if any rejected signature exists
            if (rejectedCount > 0) {
                return List.of(new GuardViolation(code(),
                    String.format("Cannot release: %d rejected signature(s) found", rejectedCount),
                    GuardEffect.BLOCK));
            }
        } else if ("HAS_REJECTED".equals(mode)) {
            // Unfreeze: block if no rejected signature exists
            if (rejectedCount == 0) {
                return List.of(new GuardViolation(code(),
                    "Unfreeze requires at least one rejected signature",
                    GuardEffect.BLOCK));
            }
        }

        return List.of();
    }
}
