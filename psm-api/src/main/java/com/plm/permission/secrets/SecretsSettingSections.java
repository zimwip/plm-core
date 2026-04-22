package com.plm.permission.secrets;

import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import com.plm.shared.settings.SimpleSettingSection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class SecretsSettingSections {

    @Bean
    SettingSection secretsSection() {
        return new SimpleSettingSection("secrets", "Secrets", SettingGroup.PLATFORM, 15, "MANAGE_SECRETS");
    }
}
