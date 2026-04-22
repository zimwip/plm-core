package com.plm.algorithm;

import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import com.plm.shared.settings.SimpleSettingSection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class AlgorithmSettingSections {

    @Bean
    SettingSection algorithmsSection() {
        return new SimpleSettingSection("algorithms", "Algorithms", SettingGroup.PLATFORM, 20, "MANAGE_PLATFORM");
    }
}
