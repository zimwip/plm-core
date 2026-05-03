package com.plm.platform.api.actions;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class ActionSettingSections {

    @Bean
    SettingSectionDto actionsCatalogSection() {
        return new SettingSectionDto("actions-catalog", "Actions & Guards", "PLATFORM", 30, "MANAGE_PLATFORM", "zap");
    }

    @Bean
    SettingSectionDto algorithmsSection() {
        return new SettingSectionDto("platform-algorithms", "Algorithms", "PLATFORM", 40, "MANAGE_PLATFORM", "cpu");
    }
}
