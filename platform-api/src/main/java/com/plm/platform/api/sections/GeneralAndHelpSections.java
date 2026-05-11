package com.plm.platform.api.sections;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class GeneralAndHelpSections {

    @Bean
    SettingSectionDto apiPlaygroundSection() {
        return new SettingSectionDto("api-playground", "API Playground", "HELP", 10, null, "terminal");
    }

    @Bean
    SettingSectionDto userManualSection() {
        return new SettingSectionDto("user-manual", "User Manual", "HELP", 20, null, "book");
    }
}
