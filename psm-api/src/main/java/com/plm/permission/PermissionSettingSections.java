package com.plm.permission;

import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import com.plm.shared.settings.SimpleSettingSection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class PermissionSettingSections {

    @Bean
    SettingSection usersRolesSection() {
        return new SimpleSettingSection("users-roles", "Users & Roles", SettingGroup.PNO, 10, "MANAGE_PNO");
    }

    @Bean
    SettingSection projSpacesSection() {
        return new SimpleSettingSection("proj-spaces", "Project Spaces", SettingGroup.PNO, 20, "MANAGE_PNO");
    }

    @Bean
    SettingSection accessRightsSection() {
        return new SimpleSettingSection("access-rights", "Access Rights", SettingGroup.PNO, 30, "MANAGE_PNO");
    }
}
