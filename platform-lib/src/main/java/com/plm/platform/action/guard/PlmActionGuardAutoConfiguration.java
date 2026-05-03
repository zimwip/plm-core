package com.plm.platform.action.guard;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;

import java.util.List;

/**
 * Wires {@link LocalActionGuardService} when:
 * - no {@link ActionGuardPort} bean is present (PSM provides its own)
 * - at least one {@link ActionGuardRegistration} bean exists
 *
 * Simple services (DST, etc.) get this auto-configuration automatically.
 */
@AutoConfiguration
@ConditionalOnMissingBean(ActionGuardPort.class)
public class PlmActionGuardAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public LocalActionGuardService localActionGuardService(
            List<ActionGuardRegistration> registrations,
            List<ActionGuard> guards) {
        return new LocalActionGuardService(registrations, guards);
    }
}
