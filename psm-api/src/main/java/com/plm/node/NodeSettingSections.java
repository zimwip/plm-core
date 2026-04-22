package com.plm.node;

import com.plm.shared.settings.SettingGroup;
import com.plm.shared.settings.SettingSection;
import com.plm.shared.settings.SimpleSettingSection;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class NodeSettingSections {

    @Bean
    SettingSection nodeTypesSection() {
        return new SimpleSettingSection("node-types", "Node Types", SettingGroup.APPLICATION, 10, "MANAGE_PSM");
    }

    @Bean
    SettingSection domainsSection() {
        return new SimpleSettingSection("domains", "Domains", SettingGroup.APPLICATION, 15, "MANAGE_PSM");
    }

    @Bean
    SettingSection enumsSection() {
        return new SimpleSettingSection("enums", "Enumerations", SettingGroup.APPLICATION, 18, "MANAGE_PSM");
    }

    @Bean
    SettingSection lifecyclesSection() {
        return new SimpleSettingSection("lifecycles", "Lifecycles", SettingGroup.APPLICATION, 20, "MANAGE_PSM");
    }
}
