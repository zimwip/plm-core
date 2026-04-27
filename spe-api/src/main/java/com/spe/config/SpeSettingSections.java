package com.spe.config;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class SpeSettingSections {

    @Bean
    SettingSectionDto platformEnvironmentSection() {
        return new SettingSectionDto("platform-environment", "Environment", "PLATFORM", 5, "MANAGE_PLATFORM");
    }
}
