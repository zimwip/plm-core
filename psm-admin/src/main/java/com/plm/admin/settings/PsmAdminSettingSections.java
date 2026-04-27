package com.plm.admin.settings;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Settings sections published by psm-admin — config/metamodel CRUD owned by this service.
 * All sections live in the PSM group; data backing these UIs is served by psm-admin.
 */
@Configuration
class PsmAdminSettingSections {

    @Bean
    SettingSectionDto nodeTypesSection() {
        return new SettingSectionDto("node-types", "Node Types", "PSM", 10, "MANAGE_PSM");
    }

    @Bean
    SettingSectionDto domainsSection() {
        return new SettingSectionDto("domains", "Domains", "PSM", 15, "MANAGE_PSM");
    }

    @Bean
    SettingSectionDto enumsSection() {
        return new SettingSectionDto("enums", "Enumerations", "PSM", 18, "MANAGE_PSM");
    }

    @Bean
    SettingSectionDto lifecyclesSection() {
        return new SettingSectionDto("lifecycles", "Lifecycles", "PSM", 20, "MANAGE_PSM");
    }

    @Bean
    SettingSectionDto guardsSection() {
        return new SettingSectionDto("guards", "Actions & Guards", "PSM", 25, "MANAGE_PSM");
    }

    @Bean
    SettingSectionDto algorithmsSection() {
        return new SettingSectionDto("algorithms", "Algorithms", "PSM", 30, "MANAGE_PSM");
    }
}
