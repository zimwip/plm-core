package com.pno.settings;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class PnoSettingSections {

    @Bean
    SettingSectionDto usersRolesSection() {
        return new SettingSectionDto("users-roles", "Users & Roles", "PNO", 10, "MANAGE_PNO");
    }

    @Bean
    SettingSectionDto projSpacesSection() {
        return new SettingSectionDto("proj-spaces", "Project Spaces", "PNO", 20, "MANAGE_PNO");
    }
}
