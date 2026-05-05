package com.pno.settings;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class PnoPermissionSettingSections {

    @Bean
    SettingSectionDto accessRightsSection() {
        return new SettingSectionDto("access-rights", "Access Rights", "PNO", 30, "MANAGE_PNO", "shield");
    }
}
