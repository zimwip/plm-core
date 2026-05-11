package com.plm.platform.action.guard;

import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * {@link ActionGuardPort} backed by Spring-bean discovery.
 *
 * Guard attachments are declared via {@link ActionGuardRegistration} beans.
 * Guards are discovered as {@link ActionGuard} beans.
 * No psm-admin ConfigCache required — suitable for simple services (DST, etc.).
 */
@Slf4j
public class LocalActionGuardService implements ActionGuardPort {

    /** actionCode → list of (guard bean, effect) pairs to evaluate. */
    private final Map<String, List<AttachedGuard>> index;

    public LocalActionGuardService(List<ActionGuardRegistration> registrations,
                                   List<ActionGuard> allGuards) {
        Map<String, ActionGuard> byCode = new HashMap<>();
        for (ActionGuard g : allGuards) {
            byCode.put(g.code(), g);
        }

        Map<String, List<AttachedGuard>> idx = new HashMap<>();
        for (ActionGuardRegistration reg : registrations) {
            List<AttachedGuard> attached = new ArrayList<>();
            for (ActionGuardRegistration.GuardAttachment att : reg.attachments()) {
                ActionGuard bean = byCode.get(att.guardCode());
                if (bean == null) {
                    log.warn("LocalActionGuardService: guard '{}' declared for action '{}' has no bean — skipping",
                        att.guardCode(), reg.actionCode());
                    continue;
                }
                attached.add(new AttachedGuard(bean, att.effect()));
            }
            if (!attached.isEmpty()) {
                idx.put(reg.actionCode(), List.copyOf(attached));
            }
        }

        this.index = Map.copyOf(idx);
        log.info("LocalActionGuardService: indexed {} action guard registrations", index.size());
    }

    @Override
    public GuardEvaluation evaluate(String actionCode, String actionId,
                                    String nodeTypeId, String transitionId,
                                    boolean isAdmin, ActionGuardContext ctx) {
        List<AttachedGuard> guards = index.getOrDefault(actionCode, List.of());
        if (guards.isEmpty()) return GuardEvaluation.PASSED;

        boolean hidden = false;
        List<GuardViolation> blockViolations = new ArrayList<>();

        for (AttachedGuard ag : guards) {
            if (isAdmin && ag.effect() != GuardEffect.HIDE) continue;

            List<GuardViolation> violations = ag.guard().evaluate(ctx);
            if (violations.isEmpty()) continue;

            if (ag.effect() == GuardEffect.HIDE) {
                hidden = true;
                break;
            }
            for (GuardViolation v : violations) {
                blockViolations.add(new GuardViolation(v.code(), v.message(), ag.effect(), v.fieldRef(), v.details()));
            }
        }

        return new GuardEvaluation(hidden, blockViolations);
    }

    @Override
    public void assertGuards(String actionCode, String actionId,
                              String nodeTypeId, String transitionId,
                              boolean isAdmin, ActionGuardContext ctx) {
        if (isAdmin) return;

        List<AttachedGuard> guards = index.getOrDefault(actionCode, List.of());
        List<String> messages = new ArrayList<>();

        for (AttachedGuard ag : guards) {
            if (ag.effect() == GuardEffect.HIDE) continue;
            for (GuardViolation v : ag.guard().evaluate(ctx)) {
                messages.add(v.message());
            }
        }

        if (!messages.isEmpty()) {
            throw new GuardViolationException(messages);
        }
    }

    private record AttachedGuard(ActionGuard guard, GuardEffect effect) {}
}
