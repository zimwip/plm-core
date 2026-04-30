package com.plm.platform.api.registry;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Adds a Settings tab listing every service known to the spe-api registry —
 * services seen, instances, health, last heartbeat, capability summary. Lets
 * an admin verify the federation surface from the running platform without
 * jumping to spe-api logs.
 *
 * <p>Backed by spe-api's existing {@code /api/spe/registry/grouped}; the
 * frontend section calls it directly. Gate reuses {@code MANAGE_SECRETS} —
 * registry visibility is admin-only operational data, same trust level.
 */
@Configuration
class RegistrySettingSections {

    @Bean
    SettingSectionDto serviceRegistrySection() {
        return new SettingSectionDto("service-registry", "Service Registry", "PLATFORM", 20, "MANAGE_PLATFORM");
    }
}
