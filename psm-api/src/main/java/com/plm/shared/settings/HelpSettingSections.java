package com.plm.shared.settings;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class HelpSettingSections {

    @Bean
    SettingSection myProfileSection() {
        return new SimpleSettingSection("my-profile", "My Profile", SettingGroup.GENERAL, 1, null);
    }

    @Bean
    SettingSection apiPlaygroundSection() {
        return new SimpleSettingSection("api-playground", "API Playground", SettingGroup.HELP, 10, null);
    }

    @Bean
    SettingSection userManualSection() {
        return new SimpleSettingSection("user-manual", "User Manual", SettingGroup.HELP, 20, null);
    }
}
