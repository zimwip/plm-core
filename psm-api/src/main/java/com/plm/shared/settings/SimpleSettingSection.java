package com.plm.shared.settings;

public record SimpleSettingSection(
        String key,
        String label,
        SettingGroup group,
        int order,
        String permission
) implements SettingSection {}
