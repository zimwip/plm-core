package com.dst.settings;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class DstSettingSections {

    @Bean
    SettingSectionDto dstStatsSection() {
        return new SettingSectionDto("dst-stats", "Statistics", "Data Storage", 10, "MANAGE_DATA", "database");
    }
}
