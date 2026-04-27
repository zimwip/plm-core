package com.plm.admin.permission;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.plm.platform.settings.dto.SettingSectionDto;

/**
 * Access-rights admin section — role × permission policies live in psm-admin
 * (PermissionAdminService, RoleController). Moved from psm-api in Phase C of the
 * platform conformance cleanup.
 */
@Configuration
class PermissionSettingSections {

    @Bean
    SettingSectionDto accessRightsSection() {
        return new SettingSectionDto("access-rights", "Access Rights", "PNO", 30, "MANAGE_PNO");
    }
}
