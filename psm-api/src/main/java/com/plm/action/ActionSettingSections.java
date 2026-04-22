package com.plm.action;

import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import com.plm.shared.settings.SimpleSettingSection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class ActionSettingSections {

    @Bean
    SettingSection guardsSection() {
        return new SimpleSettingSection("guards", "Actions & Guards", SettingGroup.PLATFORM, 10, "MANAGE_PLATFORM");
    }
}
