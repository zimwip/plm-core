package com.plm.search;

import com.plm.platform.settings.dto.SettingSectionDto;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class SearchIndexSettingSections {

    @Bean
    SettingSectionDto searchIndexSection() {
        return new SettingSectionDto("search-index", "Search Index", "INDEX", 10, "MANAGE_PLATFORM", "database");
    }
}
