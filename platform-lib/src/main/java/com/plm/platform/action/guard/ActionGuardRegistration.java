package com.plm.platform.action.guard;

import java.util.ArrayList;
import java.util.List;

/**
 * Declares guard attachments for an action in a simple service.
 *
 * Implement as a Spring bean to register guards without psm-admin config.
 * Used by {@link LocalActionGuardService} to build the evaluation index.
 *
 * Example:
 * <pre>
 * {@literal @}Bean
 * ActionGuardRegistration deleteGuards() {
 *     return ActionGuardRegistration.forAction("DELETE")
 *         .guard("dst_file_exists", GuardEffect.BLOCK)
 *         .build();
 * }
 * </pre>
 */
public interface ActionGuardRegistration {

    String actionCode();

    List<GuardAttachment> attachments();

    record GuardAttachment(String guardCode, GuardEffect effect) {}

    static Builder forAction(String actionCode) {
        return new Builder(actionCode);
    }

    class Builder {
        private final String actionCode;
        private final List<GuardAttachment> attachments = new ArrayList<>();

        Builder(String actionCode) {
            this.actionCode = actionCode;
        }

        public Builder guard(String guardCode, GuardEffect effect) {
            attachments.add(new GuardAttachment(guardCode, effect));
            return this;
        }

        public ActionGuardRegistration build() {
            String code = actionCode;
            List<GuardAttachment> list = List.copyOf(attachments);
            return new ActionGuardRegistration() {
                @Override public String actionCode() { return code; }
                @Override public List<GuardAttachment> attachments() { return list; }
            };
        }
    }
}
